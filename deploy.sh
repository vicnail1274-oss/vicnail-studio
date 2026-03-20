#!/usr/bin/env bash
# VicNail Studio — One-click Vercel deployment script
# Usage: bash deploy.sh
# Prerequisites: vercel CLI installed (npm i -g vercel), logged in (vercel login)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== VicNail Studio Deployment ==="
echo ""

# 1. Verify build passes
echo "[1/4] Verifying build..."
npm run build > /tmp/vicnail_build.log 2>&1 && echo "  ✓ Build passed" || {
  echo "  ✗ Build FAILED — check /tmp/vicnail_build.log"
  tail -20 /tmp/vicnail_build.log
  exit 1
}

# 2. Check git is clean (warn if uncommitted changes)
echo "[2/4] Checking git status..."
if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
  echo "  ⚠ Warning: uncommitted changes detected"
  git status --short
  read -r -p "  Continue anyway? (y/N): " confirm
  [[ "$confirm" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 1; }
else
  echo "  ✓ Git working tree clean"
fi

# 3. Push to GitHub
echo "[3/4] Pushing to GitHub..."
git push origin main && echo "  ✓ Pushed to GitHub" || echo "  ⚠ Push failed or nothing to push"

# 4. Deploy to Vercel
echo "[4/4] Deploying to Vercel..."
if command -v vercel &> /dev/null; then
  vercel --prod --yes
  echo ""
  echo "=== Deployment complete ==="
  echo "Check your Vercel dashboard for the live URL."
else
  echo "  ✗ Vercel CLI not found."
  echo "  Install it: npm i -g vercel"
  echo "  Then login: vercel login"
  echo "  Then run:   vercel --prod"
  echo ""
  echo "  OR: Connect GitHub to Vercel dashboard at https://vercel.com"
  echo "  See DEPLOYMENT_CHECKLIST.md for step-by-step instructions."
fi
