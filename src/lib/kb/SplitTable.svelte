<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import tickets from '#lib/data/tickets-4471.json';
  import snapshot from '#lib/data/issues-snapshot.json';
  import update from '#lib/data/desk-update-4471.json';
  import { splitTicket } from '#lib/kb/split';
  import { tenantOf } from '#lib/kb/locales';
  import type { Report } from '#lib/kb/causes';

  let { ticket }: { ticket: number } = $props();

  const LABEL: Record<string, string> = {
    parser: 'shared parser reads day-first dates month first',
    hint: 'booking-v3 form hint MM/DD/YYYY on day-first tenants',
    'one-day-move': 'date moves by one day (timezone or DST)',
    unplaced: 'no tenant on file',
  };

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const issue = (p: string) => (tickets.split as Record<string, number>)[p];
  const stateOf = (p: string) => snapshot.issues.find((i) => i.number === issue(p));
  const state = (p: string) => {
    const i = stateOf(p);
    if (!i) return 'not in snapshot';
    return i.state === 'open' ? 'open' : `closed (${(i.stateReason ?? '').replace('_', ' ')}) ${i.closedAt?.slice(0, 10) ?? ''}`;
  };
  const outcome = (p: string) => (update.outcomes as Record<string, { outcome: string; note: string }>)[p];
  const list = (n: Record<string, number>) =>
    Object.entries(n)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} ×${v}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{split.rows}</strong> rows merged into #{ticket} · <strong>{split.merged.length}</strong> unique reports ·
  <strong>{split.groups.length}</strong> problems
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>ticket</th><th>state on GitHub</th><th>desk update</th><th>tenants</th><th>channels</th><th>intake tagged as</th><th>seen</th></tr>
  </thead>
  <tbody>
    {#each split.groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code><br /><span class="what">{LABEL[g.problem]}</span></td>
        <td class="n">{g.reports.length}</td>
        <td>
          {#if issue(g.problem)}<a href="{tickets.repo}/issues/{issue(g.problem)}">#{issue(g.problem)}</a>{:else}none{/if}
        </td>
        <td class="small">{state(g.problem)}</td>
        <td class="small">
          {#if outcome(g.problem)}<b>{outcome(g.problem).outcome}</b>: {outcome(g.problem).note}{:else}not covered{/if}
        </td>
        <td>{Object.keys(g.tenants).length}</td>
        <td class="small">{list(g.channels)}</td>
        <td class="small">{list(g.taggedAs)}</td>
        <td class="small">{g.firstSeen} → {g.lastSeen}</td>
      </tr>
    {/each}
  </tbody>
</table>

<p class="small">
  State: GitHub snapshot of <a href="https://github.com/{snapshot.repo}/issues">{snapshot.repo}</a>, fetched
  {snapshot.fetchedAt.slice(0, 16).replace('T', ' ')} UTC (not live; GitHub is the authority). Desk update: {update.source};
  #{update.ticket} closed {update.closed}.
</p>

<style>
  .sum { font-size: 1.1rem; }
  .n { font-weight: 600; }
  .what, .small { color: var(--muted); font-size: 0.85em; }
</style>
