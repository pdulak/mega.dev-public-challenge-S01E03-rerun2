// Splits a merged ticket into the problems it holds. Builds on causes.ts: the cause by tenant, form and channel,
// except for reports the desk read as a one-day move (desk-notes.json). Those describe a date moved by one day,
// which a month-first parser cannot produce, so they are their own problem, not a footnote under `parser`.
import { causeOf, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'one-day-move' | 'unplaced';

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  taggedAs: Record<string, number>;
  tenants: Record<string, number>;
  channels: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
};

const tally = (rs: Report[], key: (r: Report) => string) =>
  rs.reduce<Record<string, number>>((n, r) => ({ ...n, [key(r)]: (n[key(r)] ?? 0) + 1 }), {});

export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[]): Problem {
  if (oneDayMove.includes(r.id)) return 'one-day-move';
  return causeOf(r, t) ?? 'unplaced';
}

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { rows: number; merged: Report[]; groups: ProblemGroup[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const by = new Map<Problem, Report[]>();
  for (const r of merged) {
    const p = problemOf(r, tenantOf(r), oneDayMove);
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  const groups = [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        taggedAs: tally(rs, (r) => r.meta.intakeTag),
        tenants: tally(rs, (r) => r.tenant),
        channels: tally(rs, (r) => r.channel),
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
  return { rows: all.filter((r) => r.mergedInto === ticket).length, merged, groups };
}
