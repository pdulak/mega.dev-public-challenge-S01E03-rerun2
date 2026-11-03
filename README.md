# kb — the support knowledge base

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       exports from the ticket system
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Owners

Support desk. Decision records: whoever signed them.

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.

---

## This repo (MEGA.dev S01E03, run 2)

The kb export above plus a page that splits #4471 into its problems:

- page source: `src/routes/kb/incidents/4471/split/+page.svx` (logic in `src/lib/kb/split.ts`, `SplitTable.svelte`)
- the page as the desk sees it: `export/4471-split.html` (one self-contained file; open it in a browser)
- tickets: issues #1 (parser, closed: fixed), #2 (hint, closed: won't fix), #3 (one-day move, closed: not planned)
- ticket state: `scripts/refresh-snapshot.sh` writes `src/lib/data/issues-snapshot.json` (with `fetchedAt`); desk update in `src/lib/data/desk-update-4471.json`
- build: `npm i && npx vite build`, then `node scripts/export-html.mjs build/kb/incidents/4471/split.html export/4471-split.html`
- counts check: `node scripts/count.mjs .` and `node scripts/detail.mjs .` (Node 22+, runs the kb's own `causes.ts`)
