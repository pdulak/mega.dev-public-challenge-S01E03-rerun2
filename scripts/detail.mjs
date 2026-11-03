import fs from 'node:fs';
import { uniqueById, causeOf } from '../src/lib/kb/causes.ts';
const root = process.argv[2];
const reports = JSON.parse(fs.readFileSync(root+'/src/lib/data/reports-4471.json'));
const notes = JSON.parse(fs.readFileSync(root+'/src/lib/data/desk-notes.json'));
const tdir = root+'/src/lib/data/tenants';
const tenants = new Map(fs.readdirSync(tdir).map(f=>JSON.parse(fs.readFileSync(tdir+'/'+f))).map(t=>[t.handle,t]));
const u = uniqueById(reports).filter(r=>r.mergedInto===4471);
const g = {};
for (const r of u){ const k = notes.oneDayMove.includes(r.id)?'one-day-move':causeOf(r,tenants.get(r.tenant))??'unplaced'; (g[k]??=[]).push(r);}
for (const [k,rs] of Object.entries(g)){
  const ten={}, ch={}, tag={}; for(const r of rs){ten[r.tenant]=(ten[r.tenant]??0)+1; ch[r.channel]=(ch[r.channel]??0)+1; tag[r.meta.intakeTag]=(tag[r.meta.intakeTag]??0)+1;}
  const d=rs.map(r=>r.receivedAt.slice(0,10)).sort();
  console.log(k, rs.length, d[0], d.at(-1), JSON.stringify(ten), JSON.stringify(ch), JSON.stringify(tag), rs.slice(0,3).map(r=>r.id+': '+r.body).join(' || '));
}
