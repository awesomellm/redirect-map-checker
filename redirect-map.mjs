/** Exact URL mappings only. Query strings, case and trailing slashes are significant. */
export function checkRedirectMap(input, origin) {
  const base = new URL(origin);
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password) throw new Error('Enter an HTTP or HTTPS site URL without credentials.');
  const lines = input.replace(/^\uFEFF/, '').split(/\r?\n/).map((text, i) => ({ text, line: i + 1 })).filter(r => r.text.trim());
  if (lines.length > 2000) throw new Error('Use no more than 2,000 rows per check.');
  if (!lines.length) throw new Error('Paste at least one old URL and new URL, separated by a tab.');
  const normalize = value => {
    if (!value || /\s/.test(value) || value.startsWith('//') || value.includes('\\') || !(/^(https?:\/\/|\/)/i.test(value))) throw new Error('Use an absolute HTTP(S) URL or a path starting with /.');
    const url = new URL(value, base.origin);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.hash) throw new Error('Remove credentials or #fragments; use HTTP(S) URLs.');
    return url.href;
  };
  const rows = lines.map(({text, line}) => {
    const columns = text.split('\t').map(s => s.trim());
    const row = {line, from: columns[0] || '', to: columns[1] || '', issues: []};
    try {
      if (columns.length !== 2) throw new Error('Expected exactly two tab-separated columns, without a header.');
      row.from = normalize(row.from); row.to = normalize(row.to);
      if (row.from === row.to) row.issues.push('Self redirect');
      if (new URL(row.to).origin !== base.origin) row.issues.push('External destination: verify ownership and intent');
      if (row.from.startsWith('https:') && row.to.startsWith('http:')) row.issues.push('HTTPS to HTTP downgrade');
    } catch (error) { row.issues.push(error.message); row.invalid = true; }
    return row;
  });
  const grouped = new Map();
  for (const row of rows.filter(r => !r.invalid)) {
    const group = grouped.get(row.from) || []; group.push(row); grouped.set(row.from, group);
  }
  for (const group of grouped.values()) if (group.length > 1) {
    const issue = new Set(group.map(r => r.to)).size > 1 ? 'Conflicting destinations for this source' : 'Duplicate mapping';
    group.forEach(row => row.issues.push(issue));
  }
  for (const row of rows.filter(r => !r.invalid && r.from !== r.to)) {
    const seen = new Set([row.from]); let next = row.to; let hops = 1;
    while (grouped.has(next)) {
      if (seen.has(next)) { row.issues.push('Redirect loop'); break; }
      seen.add(next);
      const targets = new Set(grouped.get(next).map(r => r.to));
      if (targets.size !== 1) { row.issues.push('Path reaches a conflicting mapping'); break; }
      next = [...targets][0]; hops++;
    }
    if (hops > 1 && !row.issues.includes('Redirect loop')) row.issues.push(`Redirect chain: ${hops} hops; review a direct destination`);
  }
  return rows;
}
