# Deployment Guide - MVP 0 Production

**Date:** 2026-10-11  
**Target:** Vercel + Supabase (Production)

---

## Prerequisites

1. ✅ **Supabase Account** - You should already have this with your development database
2. ✅ **GitHub Account** - Repository is at `jonas-pettersson/reading-canon`
3. 🔜 **Vercel Account** - Sign up at https://vercel.com (free for personal projects)

---

## Step 1: Prepare Supabase for Production

### 1.1 Check Your Current Supabase Project

Your `.env.local` already has Supabase credentials. We need to verify:

**Option A: Use Existing Project for Production (Simplest)**
- Your current Supabase project already has the schema and data
- Just use it for production (fine for single-user MVP 0)

**Option B: Create Separate Production Project (Cleaner)**
- Create new Supabase project for production
- Run migration to set up schema
- Create curator account

**Recommendation:** Option A for now (you can migrate to separate project later)

### 1.2 Get Your Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy these values (you'll need them for Vercel):
   - **Project URL:** `https://your-project-id.supabase.co`
   - **anon/public key:** The long string under "Project API keys" → "anon public"

---

## Step 2: Deploy to Vercel

### 2.1 Connect GitHub Repository to Vercel

1. Go to https://vercel.com/signup
2. Sign up with GitHub
3. Click **"Add New Project"**
4. Find `jonas-pettersson/reading-canon` in the list
5. Click **"Import"**

### 2.2 Configure Build Settings

Vercel should auto-detect the settings, but verify:

**Framework Preset:** Vite  
**Build Command:** `npm run build`  
**Output Directory:** `dist`  
**Install Command:** `npm install`

### 2.3 Add Environment Variables

Before deploying, click **"Environment Variables"** and add:

**Variable 1:**
- **Name:** `VITE_SUPABASE_URL`
- **Value:** Your Supabase Project URL (from Step 1.2)
- **Environment:** Production

**Variable 2:**
- **Name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** Your Supabase anon key (from Step 1.2)
- **Environment:** Production

### 2.4 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://reading-canon.vercel.app`

---

## Step 3: Configure Supabase for Production Domain

### 3.1 Add Vercel Domain to Supabase

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Site URL:** `https://reading-canon.vercel.app`
3. Add to **Redirect URLs:**
   - `https://reading-canon.vercel.app`
   - `https://reading-canon.vercel.app/**`
   - `https://*.vercel.app/**` (for preview deployments)

### 3.2 Verify Email Settings

1. Go to **Authentication** → **Email Templates**
2. Verify "Confirm signup" template is enabled
3. For now, keep "Enable email confirmations" **OFF** (easier for single curator)

---

## Step 4: Create Curator Account (if needed)

If you're using a new Supabase project, create the curator account:

```bash
# Run locally with production Supabase credentials
VITE_SUPABASE_URL=https://your-prod.supabase.co \
VITE_SUPABASE_ANON_KEY=your-prod-anon-key \
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key \
npm run create-curator
```

Or create manually in Supabase Dashboard:
1. **Authentication** → **Users** → **Add user**
2. Enter your email and password
3. Disable "Auto Confirm User" if you want to test email confirmation

---

## Step 5: Test Production Deployment

1. Visit your Vercel URL: `https://reading-canon.vercel.app`
2. Login with curator credentials
3. Test core workflows:
   - ✅ Browse collection
   - ✅ Search and filter books
   - ✅ View book details
   - ✅ Update reading status
   - ✅ Add/edit books (curator only)

---

## Step 6: Optional - Custom Domain

If you want a custom domain instead of `.vercel.app`:

1. In Vercel project → **Settings** → **Domains**
2. Add your domain (e.g., `readingcanon.com`)
3. Follow DNS configuration instructions
4. Update Supabase redirect URLs with custom domain

---

## Troubleshooting

### Build Fails on Vercel

**Error:** "Command failed: npm run build"
- Check CI is passing on GitHub first
- Verify all dependencies are in `package.json` (not just devDependencies)

### Can't Login After Deployment

**Issue:** Redirects back to login after entering credentials
- Check Supabase → Authentication → URL Configuration
- Ensure Vercel URL is in Site URL and Redirect URLs
- Clear browser cache and try again

### Environment Variables Not Working

**Issue:** "Supabase client is not configured"
- Verify environment variables in Vercel → Settings → Environment Variables
- Both variables must start with `VITE_` prefix
- Redeploy after adding/changing environment variables

### Database Connection Issues

**Issue:** "Failed to fetch" or CORS errors
- Check Supabase project is active (not paused)
- Verify RLS policies are enabled (they should be from development)
- Check Supabase logs: Dashboard → Logs → Postgres Logs

---

## Post-Deployment

### Update Acceptance Test

Mark deployment as complete in `tests/curator-acceptance-test.md`:
- ✅ Deployment complete
- Production URL: `https://reading-canon.vercel.app`
- Ready for final curator acceptance sign-off

### Monitor Usage

Vercel provides analytics:
- **Analytics** tab shows page views, load times
- **Logs** tab shows function invocations and errors

Supabase provides metrics:
- **Database** → **Usage** shows queries, connections
- **Authentication** → **Logs** shows login attempts

---

## Continuous Deployment

Good news: **Already set up!**

Every push to `master` branch will:
1. Trigger GitHub Actions CI (tests and lint)
2. If CI passes, Vercel auto-deploys to production
3. You get a deployment notification

You can disable auto-deploy in Vercel → Settings → Git if you prefer manual deploys.

---

## Cost Estimate

**Vercel Free Tier:**
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Custom domains
- ✅ Automatic HTTPS
- ✅ More than enough for personal use

**Supabase Free Tier:**
- ✅ 500 MB database
- ✅ 2 GB file storage
- ✅ 50 MB file uploads
- ✅ Social OAuth providers
- ✅ More than enough for 643 books + personal data

**Total Cost:** $0/month 🎉

---

## Next Steps After Deployment

1. **Update STATUS.md** - Mark MVP 0 as deployed
2. **Final Acceptance Test** - Use the app in production for 1-2 weeks
3. **Gather Feedback** - What works? What's missing?
4. **Decide on MVP 1** - Is multi-user support worth the effort?

---

**Need Help?** 
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- This repo's issues: https://github.com/jonas-pettersson/reading-canon/issues
