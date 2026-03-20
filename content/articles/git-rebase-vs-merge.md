---
title: "Git Rebase vs Merge: The Definitive Guide"
description: "Understand when to use git rebase vs merge. Covers linear history, conflict resolution, interactive rebase, and team workflow best practices."
keywords: ["git rebase vs merge", "git merge vs rebase", "when to use git rebase", "git rebase tutorial", "git linear history"]
canonical: "https://devplaybook.cc/blog/git-rebase-vs-merge"
date: "2025-03-20"
tags: ["git", "version-control", "workflow", "devtools"]
slug: "git-rebase-vs-merge"
---

# Git Rebase vs Merge: The Definitive Guide

`git merge` and `git rebase` both integrate changes from one branch into another. They produce the same final code, but they create different Git histories. Understanding that difference — and its implications — determines which you should use and when.

This guide covers the mechanics, the trade-offs, and the right tool for each scenario.

---

## The Core Difference

### Git Merge

Merge creates a **merge commit** that ties two branch histories together. The history is non-linear but fully preserves what actually happened.

```
Before merge:
main:    A---B---C
feature:     D---E---F

After git merge feature (into main):
main:    A---B---C---M
                 \   /
feature:          D-E-F

M = merge commit with two parents (C and F)
```

```bash
git checkout main
git merge feature
```

### Git Rebase

Rebase **moves** the feature branch commits onto the tip of the target branch. It replays each commit as if it were written on top of the latest code. The result: a linear history with no merge commits.

```
Before rebase:
main:    A---B---C
feature:     D---E---F

After git rebase main (from feature branch):
main:    A---B---C
feature:         D'--E'--F'

D', E', F' are new commits with new SHAs (history was rewritten)
```

```bash
git checkout feature
git rebase main
```

---

## When to Use Merge

### 1. Merging a completed feature into main/develop

When a feature is ready to ship, use merge (or a squash merge). The merge commit documents when the feature was integrated.

```bash
# Standard merge (preserves all commits)
git checkout main
git merge feature/user-auth

# Squash merge (all feature commits become one)
git merge --squash feature/user-auth
git commit -m "Add user authentication"
```

### 2. Merging long-lived branches

If `main` and `develop` both have diverged significantly and both are "published" (pushed, tracked by others), merge is safer. Rebasing a shared branch rewrites history, which breaks everyone else's copy.

### 3. You want a full audit trail

Merge preserves the exact sequence of events. You can see exactly when a branch diverged and when it was integrated. For regulated environments or complex debugging, this matters.

**Merge rule of thumb:** Always use merge when integrating back to a shared branch. Never rebase a branch that others have pulled.

---

## When to Use Rebase

### 1. Keeping your feature branch up to date

While working on a feature branch, regularly rebase onto main to stay current. This avoids a messy merge commit when you eventually integrate.

```bash
# Update your feature branch with latest main
git checkout feature/my-feature
git fetch origin
git rebase origin/main

# If conflicts occur, resolve them, then:
git add .
git rebase --continue

# To abort if things go wrong:
git rebase --abort
```

### 2. Before opening a pull request

Clean up your branch history before submitting for review. Use interactive rebase to squash fixup commits, reword commit messages, and reorder changes.

```bash
# Rebase last 4 commits interactively
git rebase -i HEAD~4
```

The interactive editor opens:

```
pick a1b2c3d Fix login bug
pick e4f5a6b WIP
pick b7c8d9e Fix typo
pick f0a1b2c Add tests

# Commands:
# p, pick = use commit
# r, reword = change commit message
# s, squash = meld into previous commit
# f, fixup = squash, discard commit message
# d, drop = remove commit
```

Change to:

```
pick a1b2c3d Fix login bug
fixup e4f5a6b WIP
fixup b7c8d9e Fix typo
reword f0a1b2c Add tests for login bug fix
```

Result: 2 clean commits instead of 4 messy ones.

### 3. Maintaining linear history

Some teams enforce linear history (`--no-ff` off, squash merges required). Rebase supports this by keeping the main branch free of merge commits.

---

## The Golden Rule of Rebase

> **Never rebase commits that have been pushed to a shared branch.**

Rebase rewrites commit SHAs. If someone else has pulled those commits and you force-push a rebased version, their local history diverges. They'll have to do awkward `git pull --rebase` or reset operations.

**Safe to rebase:** Local commits you haven't pushed. Or commits on a personal feature branch that only you work on.

**Unsafe to rebase:** Anything on `main`, `develop`, or any branch multiple people share.

---

## Conflict Resolution

### Merge Conflicts

You resolve conflicts once, when the merge happens.

```bash
git merge feature
# Conflict in src/auth.js
# Edit file to resolve
git add src/auth.js
git commit
```

### Rebase Conflicts

You resolve conflicts commit-by-commit as each is replayed. More frequent interruptions, but each conflict is smaller and more focused.

```bash
git rebase main
# Conflict during applying commit D
# Edit file to resolve
git add src/auth.js
git rebase --continue
# Conflict during applying commit E
# Resolve again...
git add src/auth.js
git rebase --continue
```

Rebase conflicts feel more tedious but are actually easier to reason about — you're always looking at one commit's changes in isolation.

---

## Interactive Rebase Recipes

### Squash all feature commits into one before merging

```bash
# On feature branch, squash everything since branching from main
git rebase -i $(git merge-base HEAD main)
# Change all lines except first from 'pick' to 'squash'
```

### Edit an old commit message

```bash
git rebase -i HEAD~5
# Change 'pick' to 'reword' on the target commit
# Save → editor opens for the commit message
```

### Remove a commit entirely

```bash
git rebase -i HEAD~4
# Change 'pick' to 'drop' on the target commit
```

### Split a commit into two

```bash
git rebase -i HEAD~3
# Change 'pick' to 'edit' on the target commit
# When rebase pauses:
git reset HEAD^       # Unstage the commit's changes
git add -p            # Stage partial changes
git commit -m "First part"
git add -p            # Stage rest
git commit -m "Second part"
git rebase --continue
```

---

## Team Workflow Recommendations

### GitHub Flow (Simple Teams)

```
main: always deployable
feature branches: short-lived, squash-merged into main

Workflow:
1. Branch from main
2. Rebase onto main frequently
3. Squash merge back to main
4. Delete branch
```

### Git Flow (Release-Driven Teams)

```
main: production code only
develop: integration branch
feature/*: branched from develop, merged back
release/*: branched from develop, merged to main + develop

Use merge (not rebase) for all integration points.
```

---

## Quick Reference

| Scenario | Use |
|----------|-----|
| Integrating finished feature to main | Merge (or squash merge) |
| Updating feature branch with latest main | Rebase |
| Cleaning up commits before PR | Interactive rebase |
| Shared/public branch | Never rebase |
| Preserving full history | Merge |
| Linear history requirement | Rebase + fast-forward |

---

## Summary

- **Merge** = safe, honest, non-destructive. Use for integrating to shared branches.
- **Rebase** = clean, linear, powerful. Use for local cleanup and staying current.
- **Interactive rebase** = surgical history editing before sharing your work.
- **Never rebase published commits** — it breaks everyone else's workflow.

The "rebase vs merge" debate often comes down to team preference. Either approach works; consistency matters more than the choice. Pick one for integration (merge) and one for local cleanup (rebase), and stick to it.

---

For more developer tools and references, visit [devplaybook.cc](https://devplaybook.cc).
