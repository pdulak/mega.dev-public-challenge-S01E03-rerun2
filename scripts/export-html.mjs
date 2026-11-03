// Turn the prerendered page into ONE self-contained HTML file (CSS and JS inlined, no network).
// usage: node scripts/export-html.mjs <built page> <out file>
import { build } from 'rolldown';
import fs from 'node:fs';
import path from 'node:path';

const [page, out] = process.argv.slice(2);
const dir = path.dirname(path.resolve(page));
let html = fs.readFileSync(page, 'utf8');

const start = html.match(/import\("([^"]*entry\/start[^"]*)"\)/)[1];
const app = html.match(/import\("([^"]*entry\/app[^"]*)"\)/)[1];
const nodeIds = html.match(/node_ids: (\[[^\]]*\])/)[1];
const data = html.match(/data: (\[[^\]]*\])/)[1];

const entry = path.join(dir, '.export-entry.mjs');
fs.writeFileSync(
  entry,
  `import * as kit from ${JSON.stringify(path.resolve(dir, start))};
import * as app from ${JSON.stringify(path.resolve(dir, app))};
kit.init({ base: '' });
kit.start(app, document.getElementById('app-root'), { node_ids: ${nodeIds}, data: ${data}, form: null, error: null });
`
);
const bundled = await build({
  input: entry,
  output: { format: 'iife', minify: true, codeSplitting: false },
  transform: { define: { 'import.meta.url': 'location.href' } },
  write: false,
  logLevel: 'silent'
});
fs.rmSync(entry);
// Styles are already inlined and every chunk is in this bundle, so turn the router's
// preload list (__vite__mapDeps) into an empty list: nothing is fetched from the network.
const js = bundled.output[0].code
  .replaceAll('=>e.map(e=>n[e])', '=>[]')
  .replaceAll('</script', '<\\/script');

html = html
  .replace(/<link[^>]*(modulepreload|rel="stylesheet")[^>]*>\s*/g, '')
  .replace(/<script>\s*\{[\s\S]*?<\/script>/, '')
  .replace('<div style="display: contents">', () => '<div id="app-root" style="display: contents">')
  .replace('</body>', () => `<script>${js}</script>\n</body>`);
fs.writeFileSync(out, html);
console.log(out, html.length, 'bytes');
