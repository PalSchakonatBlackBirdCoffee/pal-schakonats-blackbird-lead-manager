// adversus-check lookup. Read only: search POSTs and timeline GETs, nothing is saved, no call is placed.
// Paste this whole file into javascript_tool on a logged-in https://app.adversus.io tab, followed by
//   await bbCheck([['5565284329', 'Melleruds Färg AB'], ['', 'Name Only AB'], ...])
// One pair per row, in list order: company ID digits without dash ('' if not found), registered name.
// Then read the result with bbLines(0, 15), bbLines(15, 30) and so on (javascript_tool truncates near 1000 chars).

window.bbCheck = async (rows) => {
  const H = {'Content-Type': 'application/json', 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest'};
  const login = await fetch('/adversus-api/v2/users', {headers: H});
  if (login.status !== 200 || !(login.headers.get('content-type') || '').includes('json')) {
    return 'STOP: not logged in or API changed (users ' + login.status + ')';
  }
  const search = async (q, field) => {
    const r = await fetch('/adversus-api/v2/search/leads', {method: 'POST', headers: H,
      body: JSON.stringify({query: q, fields: [field], projections: []})});
    if (r.status !== 200) throw new Error('search ' + r.status);
    return r.json();
  };
  const timeline = async (id) => {
    const r = await fetch('/api/v2/dialer/leads/' + id + '/activity', {headers: H});
    if (r.status !== 200) throw new Error('activity ' + r.status);
    const a = await r.json();
    const list = Array.isArray(a) ? a : (a.data || []);
    let calls = 0, longest = 0, last = '';
    for (const e of list) {
      if (e.type !== 'session') continue;
      for (const c of (e.cdr_data || [])) {
        calls++;
        longest = Math.max(longest, +c.billsec || 0);
        if (String(e.datetime) > last) last = String(e.datetime);
      }
    }
    return {calls, longest, last: last.slice(0, 10)};
  };
  // Adversus answers in Danish. Anything not listed is kept as is and goes in the uncertain batch.
  const STATUS = {'Succes': 'Success', 'Genopkald': 'Callback', 'Ukvalificeret': 'Unqualified', 'Ugyldigt': 'Invalid',
    'Ikke interesseret': 'Not interested', 'Ubehandlet': 'Unprocessed', 'Aut. redial': 'Aut. redial'};

  const out = rows.map(([org, name], i) => ({i, org, name, via: '', hits: [], notes: []}));
  try {
    // 1. Company ID, every row with one, 25 at a time. Only an exact value counts.
    for (let k = 0; k < out.length; k += 25) {
      await Promise.all(out.slice(k, k + 25).filter(o => o.org).map(async o => {
        o.hits = (await search(o.org, 112622)).filter(h => h.value === o.org);
        if (o.hits.length) o.via = 'id';
      }));
    }
    // 2. Name, only rows the ID search missed. Lowercase, exact name only: the search matches substrings.
    for (const o of out.filter(o => !o.hits.length && o.name)) {
      const q = o.name.toLowerCase().trim();
      const all = await search(q, 112623);
      o.hits = all.filter(h => String(h.value).toLowerCase().trim() === q);
      if (o.hits.length) o.via = 'name';
      const near = all.filter(h => String(h.value).toLowerCase().trim() !== q).map(h => h.value + ' ' + h.id);
      if (near.length && !o.hits.length) o.notes.push('similar names: ' + near.slice(0, 3).join(' / '));
    }
    // 3. Timeline of every hit. contactAttempts is not a call count, so it is never used to skip one.
    const hits = out.flatMap(o => o.hits);
    for (let k = 0; k < hits.length; k += 10) {
      await Promise.all(hits.slice(k, k + 10).map(async h => { h.tl = await timeline(h.id); }));
    }
  } catch (e) {
    return 'STOP: API error, nothing delivered (' + e.message + ')';
  }

  for (const o of out) {
    for (const h of o.hits) {
      h.st = STATUS[h.status] || h.status;
      if (!STATUS[h.status]) o.notes.push('unknown status ' + h.status);
    }
    o.worked = o.hits.some(h => h.tl.longest >= 20);
    o.group = !o.hits.length ? '1a' : (o.worked ? '2' : '1b');
    if (!o.org) o.notes.push('no company ID, a miss proves nothing');
    if (o.via === 'name') o.notes.push('found by name only');
    if (o.hits.length > 1) o.notes.push(o.hits.length + ' leads');
  }
  window.__bb = out;
  const n = g => out.filter(o => o.group === g).length;
  return 'checked ' + out.length + ': 1a ' + n('1a') + ', 1b ' + n('1b') + ', 2 ' + n('2') +
    ', uncertain ' + out.filter(o => o.notes.length).length;
};

// One line per row: index | group | per lead: id, status, calls, longest call s, last call date | notes
window.bbLines = (from, to) => window.__bb.slice(from, to).map(o =>
  o.i + ' | ' + o.group + ' | ' + o.hits.map(h => h.id + ', ' + h.st + ', ' + h.tl.calls + ' calls, ' +
    h.tl.longest + ' s, ' + (h.tl.last || 'none')).join(' + ') + (o.notes.length ? ' | ' + o.notes.join('; ') : '')
).join('\n');
