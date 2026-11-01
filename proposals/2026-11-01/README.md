# Lansing Codes proposal backup — November 1, 2026

This directory preserves the exact GitHub diff for each of the 60 open pull requests authored by Rich (`rhamenator`) across the 11 active Lansing Codes repositories at the heads in `manifest.json`. These patches supplement the original October 28 working-tree snapshot in the repository root. They include changes proposed after that snapshot, without replacing the separate personal Netlify staging branch.

Each manifest entry records the PR URL, base branch and commit, head commit, patch path, and SHA-256 digest. Patches for stacked PRs are relative to their recorded parent branch; apply the parent PR first. A later force-push or rebase will not alter this dated backup. This archive is source evidence, not proof of deployment or a substitute for the PR review and CI results.

| Repository | Open PR patches |
| --- | ---: |
| `beginner-resources` | 2 |
| `newsletter-events` | 3 |
| `organizer-resources` | 4 |
| `promotion` | 2 |
| `sign-in-sheet` | 4 |
| `slackbot` | 16 |
| `slackin` | 1 |
| `slackin-redirect` | 6 |
| `slide` | 3 |
| `webfont` | 2 |
| `website` | 17 |

The older root-level folders remain the October 28 snapshots, including retired `api` and `www` for historical comparison. No production credentials or generated build outputs were added.

A separate [contributor branch follow-up](contributor-followups/README.md) backs up the mock-data PR targeting jguett’s branch for Lansing Codes website issue #7.
