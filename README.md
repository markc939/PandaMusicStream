# PandaMusicStream (Public CI Repo)

This repository contains only CI/CD build logic for **Panda Music Stream**.

The actual application code lives in the private repository: [markc939/Panda-Music-Stream](https://github.com/markc939/Panda-Music-Stream)

## How It Works

1. Push code to the private **Panda Music Stream** repo
2. Trigger a build in this public repo (Actions → Build iOS IPA → Run workflow)
3. The workflow clones the private repo using a deploy key
4. Builds an unsigned iOS IPA using free macOS CI minutes
5. Download the IPA from Actions artifacts
6. Sideload onto your iPhone using AltStore

## Setup

### Deploy Key

The private repo's code is accessed via a read-only SSH deploy key.

1. Generate key: `ssh-keygen -t ed25519 -C "opencode-ci" -f opencode_ci_key`
2. Add `opencode_ci_key.pub` to private repo → Settings → Deploy Keys
3. Add `opencode_ci_key` content to this repo → Settings → Secrets → `PRIVATE_REPO_KEY`

### Sideload with AltStore

1. Install AltStore on your iPhone
2. Download the IPA from GitHub Actions artifacts
3. Open the IPA in AltStore to install

## Architecture

```
PandaMusicStream (public)
├── .github/workflows/build.yml    # CI build logic
├── build-scripts/                  # Helper scripts
└── README.md

Panda Music Stream (private)
├── app/                           # Expo Router screens
├── src/                           # Services, hooks, components
├── assets/                        # Images, fonts
├── package.json                   # Dependencies
└── ...                            # All app code
```
