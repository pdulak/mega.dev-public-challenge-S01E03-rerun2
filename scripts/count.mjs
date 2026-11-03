import fs from 'node:fs';
import { groupByCause, uniqueById, ticketCause, readAs, causeOf, dayFirst } from '../src/lib/kb/causes.ts';
const root = process.argv[2];
const reports = JSON.parse(fs.readFileSync(root+'/src/lib/data/reports-4471.json'));
const notes = JSON.parse(fs.readFileSync(root+'/src/lib/data/desk-notes.json'));
const tdir = root+'/src/lib/data/tenants';
const tenants = new Map(fs.readdirSync(tdir).map(f=>JSON.parse(fs.readFileSync(tdir+'/'+f))).map(t=>[t.handle,t]));
for (const t of tenants.values()) console.log(t.handle, t.locale, t.form, dayFirst(t.locale));
// duplicates differing?
const seen = new Map(); let diff=0;
for (const r of reports){ if(seen.has(r.id) && JSON.stringify(seen.get(r.id))!==JSON.stringify(r)){diff++; console.log('DIFF', r.id, JSON.stringify(seen.get(r.id)), JSON.stringify(r));} seen.set(r.id,r);}
console.log('dups differing', diff);
const merged = uniqueById(reports).filter(r=>r.mergedInto===4471);
const groups = groupByCause(merged, r=>tenants.get(r.tenant));
console.log('merged', merged.length, 'owner', ticketCause(groups,4471));
for (const g of groups) console.log(g.cause, g.reports.length, JSON.stringify(g.taggedAs), g.tenants, g.firstSeen, g.lastSeen, 'oneDayMove', readAs(g, notes.oneDayMove));
