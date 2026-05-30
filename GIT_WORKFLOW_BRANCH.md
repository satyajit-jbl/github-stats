# Git Branch Cleanup Checklist

## 1. View All Local Branches

```bash
git branch
```

Example:

```bash
feature/equal-stat-cards
feature/streak-all-time
fix/balance-stat-cards
* main
```

---

## 2. Update Local Repository

Always fetch the latest remote information first.

```bash
git fetch
```

---

## 3. Check Branch Tracking Status

See which branches are ahead, behind, or synchronized with GitHub.

```bash
git branch -vv
```

Example:

```bash
feature/equal-stat-cards 1dc6dee [origin/feature/equal-stat-cards]
feature/streak-all-time  5f9ca18 [origin/feature/streak-all-time]
fix/balance-stat-cards   8ecabf7 [origin/fix/balance-stat-cards: ahead 4]
* main                   a1e1e71 [origin/main]
```

### Meaning

| Status          | Meaning                     |
| --------------- | --------------------------- |
| ahead N         | Local commits not pushed    |
| behind N        | Remote commits not pulled   |
| no ahead/behind | Local and remote are synced |

---

## 4. Check Unmerged Branches

Show branches that are not merged into main.

```bash
git branch --no-merged
```

Example:

```bash
fix/balance-stat-cards
```

If a branch appears here, inspect it before deleting.

---

## 5. View Commits Missing From Main

```bash
git log --oneline main..branch-name
```

Example:

```bash
git log --oneline main..fix/balance-stat-cards
```

---

## 6. Check For Real Work (Ignore Merge Commits)

Most important command before deletion:

```bash
git log --oneline --no-merges main..branch-name
```

Example:

```bash
git log --oneline --no-merges main..fix/balance-stat-cards
```

### Result A

```bash
a123456 Add new stats card
b234567 Fix language layout
```

Branch contains unique work.
Do NOT delete yet.

### Result B

No output

```bash
$
```

Branch has no unique commits.
Safe to delete.

---

## 7. See Code Differences

View actual changes.

```bash
git diff main..branch-name
```

Summary only:

```bash
git diff --stat main..branch-name
```

---

## 8. See Commits Not Pushed To GitHub

```bash
git log --oneline origin/branch-name..branch-name
```

Example:

```bash
git log --oneline origin/fix/balance-stat-cards..fix/balance-stat-cards
```

If commits appear, they exist only locally.

---

## 9. Verify Main Is Up To Date

```bash
git checkout main
git pull origin main
```

---

## 10. Optional Safety Backup

Create a tag before cleanup.

```bash
git tag backup-before-cleanup
git push origin backup-before-cleanup
```

Check whether any open PRs still use those branches

### On GitHub:

Go to Pull Requests
Check for any open PRs whose source branch is:
feature/streak-all-time
feature/equal-stat-cards
fix/balance-stat-cards

Don't delete a branch that is still being used by an open PR.

Restore later if needed:

```bash
git checkout backup-before-cleanup
```

---

## 11. Delete Local Branches

Safe delete (merged only):

```bash
git branch -d branch-name
```

Force delete:

```bash
git branch -D branch-name
```

Example:

```bash
git branch -D feature/equal-stat-cards
git branch -D feature/streak-all-time
git branch -D fix/balance-stat-cards
```

---

## 12. Verify Local Cleanup

```bash
git branch
```

Expected:

```bash
* main
```

---

## 13. Delete Remote GitHub Branches

```bash
git push origin --delete branch-name
```

Example:

```bash
git push origin --delete feature/equal-stat-cards
git push origin --delete feature/streak-all-time
git push origin --delete fix/balance-stat-cards
```

---

## 14. Remove Stale References

```bash
git fetch --prune
```

---

## 15. Final Verification

Local branches:

```bash
git branch
```

Remote branches:

```bash
git branch -r
```

Expected:

```bash
* main
origin/main
```

---

# Quick Safe Deletion Workflow

```bash
git fetch

git branch -vv

git branch --no-merged

git log --oneline --no-merges main..branch-name

git checkout main
git pull origin main

git branch -D branch-name

git push origin --delete branch-name

git fetch --prune
```

---

# Golden Rule

Before deleting any branch, always run:

```bash
git log --oneline --no-merges main..branch-name
```

If it returns commits, review them.

If it returns nothing, the branch contains no unique work and is usually safe to delete.
