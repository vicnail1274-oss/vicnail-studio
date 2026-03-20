# VicNail Studio — Vercel Deployment Checklist

## Status: Build Passing ✅
- **Build**: `npm run build` — passes clean (93 static pages)
- **Articles**: nail-news 16/16, nail-knowledge 16/16, ai 10/10 (zh-TW + en balanced)
- **Last verified**: 2026-03-20

---

## Step 1: Connect GitHub to Vercel (VIC does this)

1. Go to https://vercel.com → **Add New Project**
2. Select **Import Git Repository**
3. Connect your GitHub account if not connected
4. Select `vicnail1274-oss/vicnail-studio`
5. Click **Import**

---

## Step 2: Configure Build Settings (auto-detected, verify these)

Vercel should auto-detect Next.js. Confirm these settings:

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |
| Root Directory | `/` (leave empty) |

---

## Step 3: Set Environment Variables (REQUIRED before deploying)

In Vercel dashboard → **Settings → Environment Variables**, add:

### Required
| Variable | Value | Notes |
|----------|-------|-------|
| `ARTICLE_API_KEY` | `vicnail-api-key-production-2026` | Change from default! Protects auto-publish API |

### Optional (add when ready)
| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` | Google Analytics — add after site is live |
| `NEXT_PUBLIC_ADSENSE_ID` | `ca-pub-XXXXXXXXXXXXXXXX` | AdSense — add after AdSense approval |
| `NEXT_PUBLIC_NEWSLETTER_WEBHOOK` | your webhook URL | Newsletter signup — add when ready |

> **Note**: The site builds and works fine without the Optional vars. Only `ARTICLE_API_KEY` is truly required.

---

## Step 4: Deploy

1. Click **Deploy** in Vercel dashboard
2. Wait ~2-3 minutes for build to complete
3. Vercel will give you a URL like `vicnail-studio.vercel.app`

---

## Step 5: Post-Deploy Verification

After deployment, check these URLs (replace `YOUR-DOMAIN` with your Vercel URL):

- [ ] Homepage: `https://YOUR-DOMAIN/zh-TW`
- [ ] English homepage: `https://YOUR-DOMAIN/en`
- [ ] Nail news list: `https://YOUR-DOMAIN/zh-TW/nail/news`
- [ ] Sample article: `https://YOUR-DOMAIN/zh-TW/nail/news/02-summer-nail-guide-2026`
- [ ] Sitemap: `https://YOUR-DOMAIN/sitemap.xml`
- [ ] Privacy policy: `https://YOUR-DOMAIN/zh-TW/privacy`
- [ ] About page: `https://YOUR-DOMAIN/zh-TW/about`
- [ ] API health: `https://YOUR-DOMAIN/api/articles` (should return 401 without key)

---

## Step 6: Custom Domain (optional)

1. Vercel dashboard → **Settings → Domains**
2. Add your custom domain
3. Follow DNS instructions from Vercel

---

## Step 7: After Deployment — AdSense Application

Once site is live at a public URL:
1. Go to https://adsense.google.com
2. Click **Get started**
3. Add your site URL (Vercel URL or custom domain)
4. Copy the AdSense code snippet
5. Tell DevOps agent the `ca-pub-XXXXXXXXXXXXXXXX` ID → will add to Vercel env vars
6. Wait 1–14 days for review

---

## Notes for DevOps Agent

- `vercel.json` already configured correctly (framework, build, output)
- No custom headers or rewrites needed (Next.js handles i18n routing via middleware)
- `.env.local` is gitignored — env vars must be set in Vercel dashboard
- Node.js version: not pinned, Vercel will use latest LTS (18.x or 20.x) — compatible

---

## Quick Deploy via CLI (alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# From vicnail-studio directory
cd C:/OpenClaw_Pro/vicnail-studio

# Login and deploy
vercel login
vercel --prod
```
