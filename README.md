# Lansing Codes local stack backup

This private repository is a snapshot of the local contributor workspaces on October 28, 2026. Each top-level subfolder contains the working files for one Lansing Codes repository, including local edits and non-ignored untracked files. The source `.git` directories and ignored build artifacts are excluded. No changes are pushed to the Lansing Codes repositories.

The source branch, base commit, and changed paths for each folder are recorded in [SNAPSHOT_MANIFEST.json](SNAPSHOT_MANIFEST.json). The contributor/admin report is in [slackbot/CONTRIBUTOR_ADMIN_REPORT.md](slackbot/CONTRIBUTOR_ADMIN_REPORT.md).

| Folder | Source branch | Snapshot files | Local changes |
| --- | --- | ---: | ---: |
| [api](api/) | `fix/security-runtime` | 77 | 29 |
| [beginner-resources](beginner-resources/) | `main` | 5 | 0 |
| [newsletter-events](newsletter-events/) | `fix/browser-deps-xss` | 19 | 12 |
| [organizer-resources](organizer-resources/) | `main` | 7 | 0 |
| [promotion](promotion/) | `main` | 37 | 0 |
| [sign-in-sheet](sign-in-sheet/) | `fix/title-rendering` | 8 | 3 |
| [slackbot](slackbot/) | `fix/slackbot-runtime-security` | 85 | 58 |
| [slackin](slackin/) | `main` | 49 | 0 |
| [slackin-redirect](slackin-redirect/) | `fix/http-redirect-docs` | 5 | 4 |
| [slide](slide/) | `fix/security-runtime` | 15 | 8 |
| [webfont](webfont/) | `main` | 13 | 0 |
| [website](website/) | `fix/security-quality` | 117 | 8 |
| [www](www/) | `main` | 89 | 0 |

## Restore a folder

Copy the needed subfolder into a fresh checkout of its matching Lansing Codes repository, then review the diff against the base commit in the manifest. The folders here are snapshots rather than independent Git repositories.

Authentication tokens and API secrets remain in the owner’s GNOME Keyring and are not part of this backup.
