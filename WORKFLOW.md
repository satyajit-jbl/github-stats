# Git Workflow — github-stats & Profile

Quick reference for safe edits, preview deploy, and merging.  
Keep this file in the repo so we can follow the same steps every time.

---

## Two repos (don’t mix them up)
1. https://github.com/satyajit-jbl/github-stats (deplpyed in vercel for collecting data from github)
2. https://github.com/satyajit-jbl/satyajit-jbl

| Repo | Path (example) | What it does |
|------|----------------|--------------|
| **github-stats** | `E/github-stats` | API images (`/api/stats`, `/api/streak`, `/api/top-langs`) → Vercel |
| **satyajit-jbl** (profile) | `E/satyajit-jbl` | `README.md` only → shows on https://github.com/satyajit-jbl/satyajit-jbl |

- Editing **`readme2.md`** in github-stats does **not** change profile.
- Profile layout changes → push **`satyajit-jbl/satyajit-jbl`** → `README.md`.
- Card **design/data** changes → push **github-stats** → Vercel redeploys.

---

## Before code

```bash
cd /run/media/satyajit-ghosh/E/github-stats   # adjust path if needed
git status
git checkout main
git pull origin main
```

---

## 1. Create a branch (always before edits)

Never commit straight to `main` for app changes.

```bash
git checkout -b feature/short-description
```

Examples: `feature/streak-all-time`, `fix/stats-token-error`

---

## 2. Edit & test locally

### Commit-ready working tree

```bash
git status
```
test locally
```bash
npm install    # only if needed
npm run dev
```


### Build (catches syntax / import errors)

```bash
npm run build
```

**OK:** `✓ Compiled successfully`  
**Fail:** `Failed to compile`, `Type error`, `exit code 1` → fix before push

### Dev server (catches runtime / API errors)

```bash
npm run dev
```

Test in browser (need `.env.local` with `GITHUB_USERNAME` + `GITHUB_TOKEN`):

| URL | Expected |
|-----|----------|
| http://localhost:3000/api/streak | Stat cards (SVG image) |
| http://localhost:3000/api/stats | Overview card |
| http://localhost:3000/api/top-langs | Language bar chart |

> Home `/` may still show the default Next.js page — **that is fine**. Profile uses `/api/*` only.

### Avoid merge conflicts with `main`

```bash
git fetch origin
git merge origin/main
```

- `Already up to date` → good  
- `CONFLICT` → fix files → `git add .` → `git commit`

Run `npm run build` again after resolving conflicts.

---

## 3. Commit

Stage only what you intend (or everything changed in this folder):

```bash
git add app/api/streak/route.js    # specific file
# or
git add .                          # all changes (check git status first!)
```

```bash
git commit -m "Short message: what and why"
```

**Do not commit:** `.env`, `.env.local`, secrets, `node_modules/`

---

## 4. Push branch (triggers Vercel Preview)

```bash
git push -u origin feature/short-description
```

This does **not** update production until you merge the PR.

---

## 5. Check Vercel Preview (before merging)

### Option A — GitHub Pull Request

1. Open https://github.com/satyajit-jbl/github-stats  
2. **Pull requests** → **New pull request**  
   - base: `main` ← compare: your branch  
3. Wait for **Vercel** check (green ✓)  
4. Click **Visit Preview** in the Vercel bot comment (or PR **Checks** → Vercel → Details)

### Option B — Vercel Dashboard

1. https://vercel.com/dashboard → project **github-stats**  
2. **Deployments** → latest **Preview** (your branch name, not Production)  
3. **Visit**

### What to test on preview

Replace `PREVIEW-URL` with your deployment host (e.g. `github-stats-xxxxx.vercel.app`):

```text
https://PREVIEW-URL/api/streak
https://PREVIEW-URL/api/stats
https://PREVIEW-URL/api/top-langs
```

| Result | Meaning |
|--------|---------|
| SVG stat cards load | Preview deploy **OK** |
| Broken image / `{"error":...}` | Fix code or env vars on Vercel |
| Default Next.js page on `/` only | **OK** — test `/api/*` instead |

### PR must show

- **This branch has no conflicts with the base branch**  
- Vercel deployment **Ready** (not Failed)

---

## 6. Merge Pull Request → Production

1. On GitHub PR → **Merge pull request**  
2. Vercel deploys **Production** (~1–2 min)  
3. Test live APIs:

```text
https://github-stats-nu-self.vercel.app/api/streak
https://github-stats-nu-self.vercel.app/api/stats
https://github-stats-nu-self.vercel.app/api/top-langs
```

4. Refresh profile: https://github.com/satyajit-jbl (hard refresh: Ctrl+Shift+R)

---

## 7. If something goes wrong (rollback)

### Undo last commit (local only, not pushed)

```bash
git restore .
```

### Revert after push

```bash
git revert HEAD
git push
```

### Vercel

Dashboard → **Deployments** → previous good deploy → **Promote to Production**

---
### Simple mental model
Edit locally  →  test (dev/build)  →  push branch  →  preview  →  merge  →  live
     ↑                                                              │
     └── safe to experiment here(before merge)──────────────────────┘
                                                                    only risky here(live)

## Profile README changes (separate repo) if needed

```bash
cd /run/media/satyajit-ghosh/E/satyajit-jbl
git checkout -b feature/update-profile-stats
# edit README.md only (not readme2.md in github-stats)
git add README.md
git commit -m "Update profile stats section"
git push -u origin feature/update-profile-stats
# open PR → merge
```

Profile uses image URLs pointing at Vercel — deploy **github-stats** first if API URLs or behavior changed.

---
## Update local main (after you merge the PR)
```bash
git checkout main
git pull origin main
```
## Old branches (optional cleanup later)
Safe to delete on GitHub after their PRs are merged.
```bash
git ...
git ...n
```
## Git push auth (GitHub)

Password login does **not** work. Use either:

- **Personal Access Token** — username: `satyajit-jbl`, password: token (`ghp_...`)  
- **SSH** — `git@github.com:satyajit-jbl/github-stats.git`

---

## One-page checklist

```text
[ ] git checkout main && git pull
[ ] git checkout -b feature/...
[ ] edit code
[ ] npm run build
[ ] npm run dev → test /api/streak, /api/stats, /api/top-langs
[ ] git fetch && git merge origin/main
[ ] git add / commit
[ ] git push -u origin feature/...
[ ] open PR → Vercel preview green → test preview /api/* URLs
[ ] merge PR
[ ] test production URLs + GitHub profile
```

---

## Cheat sheet commands

```bash
# Start feature
git checkout main && git pull && git checkout -b feature/my-change

# Save work
git add . && git commit -m "Describe change"

# Sync with main before PR
git fetch origin && git merge origin/main

# Ship branch
git push -u origin feature/my-change

# After merge, update local main
git checkout main && git pull origin main
```
