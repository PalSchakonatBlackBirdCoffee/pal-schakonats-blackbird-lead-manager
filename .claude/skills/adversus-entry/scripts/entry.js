// adversus-entry writer. Writes leads through the same endpoints the Adversus dialer uses when you click
// Save lead. It never dials: the only writes are sessions/create, sessions/createForLead and sessions/<id>/close.
// Paste this whole file into javascript_tool on a logged-in https://app.adversus.io tab, then:
//   await bbSetup(123308, 'Pål Schakonat')        campaign id, booker's name exactly as in Adversus
//   await bbCreate({note: 'RING: ...', fields: {Firmanavn: 'X AB', CVR: '5566802483', Telefon: '0456699300', ...}})
//   await bbRefresh(1036696057, 'RING: ...')      a 1b lead: note and callback, its fields stay as they are
//   await bbRefresh(1036696057, 'RING: ...', true)  only when the booker says to take this lead from a colleague
//   await bbSetPhone(1036696155, '0708855504')    a 1b lead with no number: fills the empty Telefon field
//   await bbFixPhone(1046105672, ['08933155'])    an 08 number stored as +4646..., dialled as 046
//   await bbVerify(1054984770)                    read a lead back
// Every call returns one short line. Anything starting with STOP means: stop and tell the booker.

window.bbSetup = async (campaignId, userName) => {
  const H = {'Content-Type': 'application/json', 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest'};
  const u = await fetch('/adversus-api/v2/users', {headers: H});
  if (u.status !== 200 || !(u.headers.get('content-type') || '').includes('json')) {
    return 'STOP: not logged in or API changed (users ' + u.status + ')';
  }
  const users = (await u.json()).filter(x => x.name === userName);
  if (users.length !== 1) return 'STOP: ' + users.length + ' users named ' + userName;
  const c = await fetch('/api/v2/dialer/campaigns/' + campaignId, {headers: H});
  if (c.status !== 200) return 'STOP: campaign ' + campaignId + ' (' + c.status + ')';
  const j = await c.json();
  const camp = j.data || j;
  const fields = camp.leadFields.concat(camp.resultFields);
  window.__bbe = {H, camp, fields, userId: users[0].id};
  return 'campaign ' + camp.name + ', save as ' + users[0].name + ' (' + users[0].id + ')';
};

// Opens a session, which is what the dialer does when a lead is shown. Nothing is saved until close.
// The helpers live on window so the file can be pasted again in the same tab without a redeclare error.
window.bbPost = async (url, body, extra) => {
  const r = await fetch(url, {method: 'POST', headers: {...window.__bbe.H, ...(extra || {})}, body: JSON.stringify(body)});
  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) {}
  return {status: r.status, text: text.slice(0, 120), json};
};

// Saves the session as a private callback for the booker, the same body the Save lead button sends.
// The server refuses any field that is not in the lead's campaign, so data is filtered to those.
window.bbClose = (s, data, note, status, nextCall) => {
  const ids = window.__bbe.fields.map(f => String(f.headingId));
  const kept = Object.fromEntries(Object.entries(data || {}).filter(([k]) => ids.includes(String(k))));
  const lead = {...s.lead, data: kept, note, status, nextCall, commonRedial: false, blacklist: false,
    lastCalledBy: window.__bbe.userId, vip: false, availabilityHour: s.lead.availabilityHour == null ? '0' : s.lead.availabilityHour};
  return bbPost('/api/v2/dialer/sessions/' + s.id + '/close', {...s, lead}, {'ADV-Update-Session-Expiration': 'true'});
};

window.bbCallback = {type: 'offset', offset: 'PT5M'};

// The lead's sessions, newest first, or null if the timeline cannot be read.
window.bbSessions = async (leadId) => {
  const a = await fetch('/api/v2/dialer/leads/' + leadId + '/activity', {headers: window.__bbe.H});
  if (a.status !== 200) return null;
  const j = await a.json();
  return (Array.isArray(j) ? j : (j.data || [])).filter(e => e.type === 'session')
    .sort((x, y) => String(y.datetime).localeCompare(String(x.datetime)));
};

// A colleague's private or shared callback, overdue or not. Saving the lead would take it from them,
// since every save sets the owner to the booker. An automatic redial belongs to nobody, so it does not count.
window.bbHeldBy = (sessions) => {
  const last = sessions[0];
  if (!last || !/redial/.test(last.statustype) || last.statustype === 'auto-redial') return '';
  if (String(last.userid) === String(window.__bbe.userId)) return '';
  return last.statustype + ' by ' + last.logname + ', due ' + String(last.redialtime).slice(0, 16);
};

window.bbCreate = async ({note, fields}) => {
  if (!window.__bbe) return 'STOP: run bbSetup first';
  const data = {};
  for (const [name, value] of Object.entries(fields)) {
    const f = window.__bbe.fields.find(x => x.name === name);
    if (!f) return 'STOP: no field ' + name + ' in this campaign, nothing written';
    if (value === '' || /ej hittad|ikke fundet/i.test(value)) continue;
    data[f.headingId] = {headingId: f.headingId, name: f.name, value: String(value), type: f.type};
  }
  const name = fields.Firmanavn || '?';
  // Search the company ID once more right before writing: the list can be days old.
  if (fields.CVR) {
    const s = await bbPost('/adversus-api/v2/search/leads', {query: fields.CVR, fields: [112622], projections: []});
    if (s.status !== 200) return 'STOP: search ' + s.status + ', nothing written';
    const hits = s.json.filter(h => h.value === fields.CVR);
    if (hits.length) return 'SKIP ' + name + ': already in Adversus, lead ' + hits.map(h => h.id + ' ' + h.status).join(', ');
  }
  const c = await bbPost('/api/v2/dialer/sessions/create', {campaignId: window.__bbe.camp.id});
  if (c.status !== 200 || !c.json || !c.json.lead) return 'STOP: create ' + c.status + ', nothing written';
  const r = await bbClose(c.json, data, note, 'Genopkald', bbCallback);
  if (r.status !== 200) return 'STOP: empty lead ' + c.json.lead.id + ' left in the campaign, save failed ' + r.status + ' ' + r.text;
  return 'created ' + name + ': lead ' + c.json.lead.id;
};

window.bbRefresh = async (leadId, note, takeOver) => {
  if (!window.__bbe) return 'STOP: run bbSetup first';
  // Re-check the timeline: a real call or someone else's callback since the list was made means hands off.
  const sessions = await bbSessions(leadId);
  if (!sessions) return 'STOP: activity ' + leadId + ', nothing written';
  const longest = Math.max(0, ...sessions.flatMap(e => (e.cdr_data || []).map(x => +x.billsec || 0)));
  if (longest >= 20) return 'SKIP ' + leadId + ': has a call of ' + longest + ' s';
  const held = bbHeldBy(sessions);
  if (held && !takeOver) return 'SKIP ' + leadId + ': ' + held;
  // The campaign is checked on the lead itself below. A session's campaign_name goes stale when a lead is moved.
  const o = await bbPost('/api/v2/dialer/sessions/createForLead', {lead: {id: leadId}});
  if (o.status !== 200 || !o.json || !o.json.lead) return 'STOP: open ' + leadId + ' ' + o.status + ', nothing written';
  if (String(o.json.lead.campaignId) !== String(window.__bbe.camp.id)) {
    return 'STOP: lead ' + leadId + ' is in campaign ' + o.json.lead.campaignId + ', run bbSetup with that campaign';
  }
  const r = await bbClose(o.json, o.json.lead.data, note, 'Genopkald', bbCallback);
  if (r.status !== 200) return 'STOP: save ' + leadId + ' failed ' + r.status + ' ' + r.text;
  return 'refreshed lead ' + leadId;
};

// Fills the Telefon field of an existing lead only when it is empty, so the dialer has a number to ring.
// A number already there is never replaced. Status, callback time and the other fields stay as they are.
window.bbSetPhone = async (leadId, digits) => {
  if (!window.__bbe) return 'STOP: run bbSetup first';
  const f = window.__bbe.fields.find(x => x.name === 'Telefon');
  if (!f) return 'STOP: no field Telefon in this campaign, nothing written';
  const sessions = await bbSessions(leadId);
  if (!sessions) return 'STOP: activity ' + leadId + ', nothing written';
  const held = bbHeldBy(sessions);
  if (held) return 'SKIP ' + leadId + ': ' + held;
  const o = await bbPost('/api/v2/dialer/sessions/createForLead', {lead: {id: leadId}});
  if (o.status !== 200 || !o.json || !o.json.lead) return 'STOP: open ' + leadId + ' ' + o.status + ', nothing written';
  const l = o.json.lead;
  if (String(l.campaignId) !== String(window.__bbe.camp.id)) {
    return 'STOP: lead ' + leadId + ' is in campaign ' + l.campaignId + ', run bbSetup with that campaign';
  }
  const next = l.nextCall ? {type: 'fixed', timestamp: new Date(l.nextCall).toISOString().replace('.000', '')} : null;
  const cur = Object.values(l.data || {}).find(x => x.name === 'Telefon');
  if (cur && cur.value) {
    await bbClose(o.json, l.data, '', l.status, next);
    return 'SKIP ' + leadId + ': Telefon is already ' + cur.value;
  }
  const data = {...l.data, [f.headingId]: {headingId: f.headingId, name: f.name, value: String(digits), type: f.type}};
  const r = await bbClose(o.json, data, '', l.status, next);
  if (r.status !== 200) return 'STOP: save ' + leadId + ' failed ' + r.status + ' ' + r.text;
  return 'set Telefon ' + digits + ' on lead ' + leadId;
};

// Repairs an 08 number stored with 46 twice (+46468933155), which the dialer rings as 046-893 31 55.
// `known` holds the digits of numbers found on the company's pages, e.g. ['08933155']. A value is only
// changed when its repaired form is one of them, so a real Lund number (046) is never touched.
window.bbFixPhone = async (leadId, known) => {
  if (!window.__bbe) return 'STOP: run bbSetup first';
  const sessions = await bbSessions(leadId);
  if (!sessions) return 'STOP: activity ' + leadId + ', nothing written';
  const held = bbHeldBy(sessions);
  if (held) return 'SKIP ' + leadId + ': ' + held;
  const o = await bbPost('/api/v2/dialer/sessions/createForLead', {lead: {id: leadId}});
  if (o.status !== 200 || !o.json || !o.json.lead) return 'STOP: open ' + leadId + ' ' + o.status + ', nothing written';
  const l = o.json.lead;
  if (String(l.campaignId) !== String(window.__bbe.camp.id)) {
    return 'STOP: lead ' + leadId + ' is in campaign ' + l.campaignId + ', run bbSetup with that campaign';
  }
  const next = l.nextCall ? {type: 'fixed', timestamp: new Date(l.nextCall).toISOString().replace('.000', '')} : null;
  const data = {...l.data}, fixed = [];
  for (const [k, x] of Object.entries(l.data || {})) {
    const m = String(x.value).replace(/\D/g, '').match(/^4646(\d{6,9})$/);
    if (m && known.includes('0' + m[1])) { data[k] = {...x, value: '+46' + m[1]}; fixed.push(x.name + ' 0' + m[1]); }
  }
  const r = await bbClose(o.json, data, '', l.status, next);
  if (r.status !== 200) return 'STOP: save ' + leadId + ' failed ' + r.status + ' ' + r.text;
  return fixed.length ? 'fixed ' + leadId + ': ' + fixed.join(', ') : 'SKIP ' + leadId + ': no 4646 number';
};

// Reads a lead back. Search returns no field values, so the lead is opened and saved again unchanged,
// with its callback time pinned to the one it already has.
window.bbVerify = async (leadId) => {
  if (!window.__bbe) return 'STOP: run bbSetup first';
  const sessions = await bbSessions(leadId);
  if (!sessions) return 'STOP: activity ' + leadId;
  const held = bbHeldBy(sessions);
  if (held) return 'SKIP ' + leadId + ': ' + held;
  const o = await bbPost('/api/v2/dialer/sessions/createForLead', {lead: {id: leadId}});
  if (o.status !== 200 || !o.json || !o.json.lead) return 'STOP: open ' + leadId + ' ' + o.status;
  const l = o.json.lead;
  if (String(l.campaignId) !== String(window.__bbe.camp.id)) {
    return 'STOP: lead ' + leadId + ' is in campaign ' + l.campaignId + ', run bbSetup with that campaign';
  }
  const next = l.nextCall ? {type: 'fixed', timestamp: new Date(l.nextCall).toISOString().replace('.000', '')} : null;
  const r = await bbClose(o.json, l.data, '', l.status, next);
  const v = n => { const f = Object.values(l.data || {}).find(x => x.name === n); return f ? f.value : '-'; };
  const a = await (await fetch('/api/v2/dialer/leads/' + leadId + '/activity', {headers: window.__bbe.H})).json();
  const notes = (Array.isArray(a) ? a : (a.data || [])).filter(e => e.type === 'note');
  return leadId + ' | ' + l.status + (l.commonRedial ? ' shared' : ' private') + ', owner ' + l.lastCalledBy +
    ', due ' + String(l.nextCall).slice(0, 16) + ' UTC, campaign ' + l.campaignId + ' | ' + v('Firmanavn') + ', ' + v('CVR') +
    ', ' + v('Postnummer') + ' ' + v('By') + ' | dials ' + (l.numbers || []).map(n => n.national).join(' / ') +
    ' | notes ' + notes.length + (r.status === 200 ? '' : ' | re-save ' + r.status);
};
