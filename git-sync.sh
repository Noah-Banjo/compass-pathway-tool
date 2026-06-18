#!/usr/bin/env bash
# Usage: bash git-sync.sh "your commit message"
# Stages all changes, commits, and pushes to main.
# Vercel auto-deploys on push — no separate deploy step needed.

set -e

if [ -z "$1" ]; then
  echo "Error: commit message required"
  echo "Usage: bash git-sync.sh \"your commit message\""
  exit 1
fi

git add -A
git commit -m "$1"
git push origin main
echo "Pushed to main — Vercel deploy triggered."
