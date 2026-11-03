import fs from 'node:fs';
import { uniqueById, causeOf } from '../src/lib/kb/causes.ts';
const root=process.argv[2];
const R=JSON.parse(fs.readFileSync(root+'/src/lib/data/reports-4471.json')); const n=JSON.parse(fs.readFileSync(root+'/src/lib/data/desk-notes.json')).oneDayMove;
const td=root+'/src/lib/data/tenants'; const T=new Map(fs.readdirSync(td).map(f=>JSON.parse(fs.readFileSync(td+'/'+f))).map(t=>[t.handle,t]));
const m=new Map(); for(const r of uniqueById(R)){const p=n.includes(r.id)?'one':causeOf(r,T.get(r.tenant)); const s=r.subject.toLowerCase().replace(/[^\w\s]/g,''); (m.get(s)??m.set(s,new Set()).get(s)).add(p);}
for(const [s,ps] of m) console.log([...ps].join(','),'|',s);
