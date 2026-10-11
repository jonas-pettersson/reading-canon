# Deployment Checklist - Quick Reference

**Date:** 2026-10-11  
**Task:** Deploy MVP 0 to Vercel  
**Time Required:** ~30 minutes

---

## ✅ Pre-Deployment Checklist

- [x] All tests passing (520 tests ✅)
- [x] CI passing on GitHub
- [x] All acceptance test issues resolved
- [x] Supabase database has schema and data
- [ ] Supabase credentials ready (see below)
- [ ] Vercel account created

---

## 📋 Step-by-Step Deployment

### Step 1: Get Supabase Credentials (5 min)

1. Go to https://supabase.com/dashboard
2. Select your project
3. **Settings** → **API**
4. Copy and save:
   ```
   Project URL: https://______________.supabase.co
   Anon Key: eyJhbG________________
   ```

### Step 2: Deploy to Vercel (10 min)

1. Go to https://vercel.com/signup
2. **Sign up with GitHub**
3. Click **"Add New Project"**
4. Import `jonas-pettersson/reading-canon`
5. **Before clicking Deploy:**
   - Add Environment Variables:
     - `VITE_SUPABASE_URL` = (your Project URL from Step 1)
     - `VITE_SUPABASE_ANON_KEY` = (your Anon Key from Step 1)
6. Click **"Deploy"**
7. Wait ~2-3 minutes
8. Copy your deployment URL: `https://reading-canon-__________.vercel.app`

### Step 3: Configure Supabase (5 min)

1. Back in Supabase Dashboard
2. **Authentication** → **URL Configuration**
3. Set **Site URL:** (your Vercel URL from Step 2)
4. Add to **Redirect URLs:**
   - `https://reading-canon-__________.vercel.app`
   - `https://reading-canon-__________.vercel.app/**`
5. Click **Save**

### Step 4: Test Deployment (10 min)

1. Visit your Vercel URL
2. Login with your curator account
3. Test:
   - [ ] Can browse books
   - [ ] Can search and filter
   - [ ] Can view book details
   - [ ] Can click Wikipedia button
   - [ ] Can update reading status
   - [ ] Can add a new book
   - [ ] Can edit a book
4. Test on mobile device (optional but recommended)

---

## 🎉 Post-Deployment

- [ ] Update acceptance test document with production URL
- [ ] Commit deployment config files (vercel.json)
- [ ] Share production URL (if applicable)
- [ ] Start using the app for real!

---

## 🚨 If Something Goes Wrong

### "Can't login" or "Infinite redirect"
→ Check Supabase Redirect URLs include your exact Vercel URL

### "Blank page" or "Cannot find module"
→ Check Vercel build logs, might be a build error

### "Cannot connect to database"
→ Verify environment variables in Vercel Settings

### Need detailed troubleshooting?
→ See full `DEPLOYMENT.md` guide

---

## 📝 After Successful Deployment

**Your production app is at:** `https://_____________.vercel.app`

**Automatic deployments:** Every push to `master` → auto-deploys

**Next milestone:** Use app for 1-2 weeks, then decide on MVP 1

---

**Deployment started:** __________  
**Deployment completed:** __________  
**Production URL:** __________
