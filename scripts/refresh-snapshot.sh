#!/usr/bin/env bash
# Writes src/lib/data/issues-snapshot.json from the GitHub API. GitHub is the authority for ticket state;
# the page prints fetchedAt so nobody reads the snapshot as live.
set -euo pipefail
REPO=pdulak/mega.dev-public-challenge-S01E03-rerun2
cd "$(dirname "$0")/.."
gh api "repos/$REPO/issues?state=all&per_page=100" | node -e '
  let s = ""; process.stdin.on("data", (d) => (s += d)).on("end", () => {
    const issues = JSON.parse(s).filter((i) => !i.pull_request)
      .map((i) => ({ number: i.number, title: i.title, state: i.state, stateReason: i.state_reason, closedAt: i.closed_at, url: i.html_url }))
      .sort((a, b) => a.number - b.number);
    process.stdout.write(JSON.stringify({ repo: process.argv[1], fetchedAt: new Date().toISOString(), issues }, null, 2) + "\n");
  });' "$REPO" > src/lib/data/issues-snapshot.json
echo "wrote src/lib/data/issues-snapshot.json"
