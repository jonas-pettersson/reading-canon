# ADR-005: Hosting and Deployment Approach

## Status

**ACCEPTED** - 2026-10-02

## Context

The Reading Canon application requires hosting infrastructure for the React frontend (ADR-001). The backend is hosted by Supabase (ADR-002), so this decision focuses on frontend deployment only.

### Requirements from Specification v1.4:

**Deployment Requirements:**
- **NFR-024**: HTTPS required (production - MVP 1)
- **NFR-001**: Book list load < 2 seconds for 1000 books
- **NFR-002**: Search results < 1 second
- **NFR-011**: Modern browser support (desktop + mobile)

**MVP Scope:**
- **MVP 0**: Local development (localhost via `npm run dev`) is the default starting point for validation. Optional early Vercel deployment if remote access is useful.
- **MVP 1**: Production deployment on Vercel required (HTTPS, custom domain, multi-user support)

**Cost Considerations:**
- Small user base (1-10 users)
- Learning exercise (minimal ongoing costs preferred)
- Single developer (simple operational model)

### Technical Context

**Frontend Stack (from ADR-001):**
- React 18 + TypeScript
- Vite (build tool)
- Static site after build (no server-side rendering for MVP)

**Backend (from ADR-002):**
- Supabase (hosted separately)
- Communication via HTTPS API calls
- No server-side rendering required

**Deployment Characteristics:**
- Static site (HTML, CSS, JS bundles)
- No backend server needed for frontend
- Environment variables for Supabase connection
- Automatic deployment on Git push preferred

## Decision Drivers

1. **Cost**: Free or very low cost for expected scale
2. **HTTPS**: Built-in SSL/TLS certificate (NFR-024)
3. **Performance**: Fast global CDN for good load times (NFR-001)
4. **Developer Experience**: Easy setup, automatic deployments from Git
5. **Operational Simplicity**: Minimal configuration and maintenance
6. **Build Tool Support**: Vite support out of the box
7. **Custom Domain**: Ability to use custom domain (optional)
8. **Environment Variables**: Secure way to inject Supabase credentials
9. **Preview Deployments**: Test branches before merging
10. **Monitoring**: Basic analytics and error tracking

## Options Considered

### Option 1: Vercel

**Description:** Vercel's frontend hosting platform with global CDN

**Pros:**
- ✅ Excellent Vite/React support (built by Next.js creators)
- ✅ Automatic deployments from Git (GitHub, GitLab, Bitbucket)
- ✅ Free tier available with sufficient bandwidth for expected scale (verify current limits before deployment)
- ✅ HTTPS automatic (Let's Encrypt)
- ✅ Global CDN (fast worldwide)
- ✅ Preview deployments for branches
- ✅ Environment variables management
- ✅ Custom domains (free SSL)
- ✅ Web Analytics available
- ✅ Excellent documentation and DX
- ✅ Zero configuration for Vite projects
- ✅ Serverless functions available if needed later

**Cons:**
- ❌ Free tier has some limitations (bandwidth, build minutes)
- ❌ Vendor lock-in (though static site is portable)
- ❌ Requires Vercel account

**Fit for Project:**
- Cost: ⭐⭐⭐⭐⭐ (Free tier more than sufficient)
- HTTPS: ⭐⭐⭐⭐⭐ (Automatic, zero config)
- Performance: ⭐⭐⭐⭐⭐ (Global CDN, excellent)
- DX: ⭐⭐⭐⭐⭐ (Best-in-class)
- Operational: ⭐⭐⭐⭐⭐ (Zero maintenance)
- Vite Support: ⭐⭐⭐⭐⭐ (Native, zero config)

**Estimated Setup Time:** 10-20 minutes (connect Git repo, auto-detect Vite, deploy)

---

### Option 2: Netlify

**Description:** Netlify's hosting platform with continuous deployment

**Pros:**
- ✅ Excellent static site hosting
- ✅ Automatic deployments from Git
- ✅ Free tier: 100GB bandwidth, 300 build minutes/month
- ✅ HTTPS automatic (Let's Encrypt)
- ✅ Global CDN
- ✅ Preview deployments (Deploy Previews)
- ✅ Environment variables management
- ✅ Custom domains (free SSL)
- ✅ Forms and Functions available if needed
- ✅ Good Vite support
- ✅ Excellent documentation

**Cons:**
- ❌ Free tier build minutes limited (300/month)
- ❌ Slightly less integrated with Vite than Vercel
- ❌ Vendor lock-in (though static site is portable)

**Fit for Project:**
- Cost: ⭐⭐⭐⭐⭐ (Free tier sufficient)
- HTTPS: ⭐⭐⭐⭐⭐ (Automatic, zero config)
- Performance: ⭐⭐⭐⭐⭐ (Global CDN, excellent)
- DX: ⭐⭐⭐⭐⭐ (Excellent)
- Operational: ⭐⭐⭐⭐⭐ (Zero maintenance)
- Vite Support: ⭐⭐⭐⭐ (Good support)

**Estimated Setup Time:** 10-20 minutes (connect Git repo, configure build, deploy)

---

### Option 3: Cloudflare Pages

**Description:** Cloudflare's JAMstack hosting platform with global CDN

**Pros:**
- ✅ Unlimited bandwidth (free tier)
- ✅ Unlimited requests (free tier)
- ✅ 500 builds/month (free tier)
- ✅ Automatic deployments from Git
- ✅ HTTPS automatic
- ✅ Cloudflare's CDN (one of the fastest)
- ✅ Preview deployments
- ✅ Environment variables
- ✅ Custom domains (free SSL)
- ✅ Cloudflare Workers available if needed
- ✅ Good Vite support

**Cons:**
- ❌ Less mature than Vercel/Netlify
- ❌ Documentation not as comprehensive
- ❌ Fewer integrations and features
- ❌ Build system less polished

**Fit for Project:**
- Cost: ⭐⭐⭐⭐⭐ (Unlimited bandwidth!)
- HTTPS: ⭐⭐⭐⭐⭐ (Automatic)
- Performance: ⭐⭐⭐⭐⭐ (Excellent CDN)
- DX: ⭐⭐⭐⭐ (Good but less polished)
- Operational: ⭐⭐⭐⭐⭐ (Zero maintenance)
- Vite Support: ⭐⭐⭐⭐ (Good support)

**Estimated Setup Time:** 15-25 minutes (connect Git, configure build)

---

### Option 4: GitHub Pages

**Description:** Free static site hosting from GitHub

**Pros:**
- ✅ Completely free
- ✅ Integrated with GitHub (if using GitHub)
- ✅ HTTPS automatic (for github.io domain)
- ✅ Custom domain support
- ✅ Simple deployment (gh-pages branch or GitHub Actions)

**Cons:**
- ❌ No automatic preview deployments
- ❌ No environment variable management (must build locally or in Actions)
- ❌ No CDN (single region)
- ❌ Manual deployment workflow or GitHub Actions setup required
- ❌ Less suitable for dynamic SPAs (routing issues)
- ❌ No built-in build pipeline
- ❌ 100GB bandwidth soft limit

**Fit for Project:**
- Cost: ⭐⭐⭐⭐⭐ (Completely free)
- HTTPS: ⭐⭐⭐⭐ (Yes, for github.io)
- Performance: ⭐⭐⭐ (Adequate but no CDN)
- DX: ⭐⭐ (Manual deployment, no preview)
- Operational: ⭐⭐⭐ (Simple but manual)
- Vite Support: ⭐⭐⭐ (Requires manual build setup)

**Estimated Setup Time:** 1-2 hours (GitHub Actions setup + deployment config)

---

### Option 5: Traditional VPS (Nginx)

**Description:** Self-hosted on VPS (DigitalOcean, Hetzner, etc.) with Nginx serving static files

**Pros:**
- ✅ Full control over hosting environment
- ✅ Can host frontend and other services on same VPS
- ✅ Learning opportunity (server administration, Nginx)
- ✅ Predictable monthly cost (~$5-12/month)
- ✅ Can add backend services later if needed

**Cons:**
- ❌ Must manage server (updates, security, monitoring)
- ❌ Must configure Nginx manually
- ❌ Must set up SSL certificate (Let's Encrypt + certbot)
- ❌ Must configure automatic deployment (GitHub Actions or manual)
- ❌ No CDN (single region unless configured)
- ❌ Higher operational overhead
- ❌ Ongoing monthly cost
- ❌ Must handle server downtime and backups

**Fit for Project:**
- Cost: ⭐⭐⭐ (Low monthly cost but not free)
- HTTPS: ⭐⭐⭐ (Possible with Let's Encrypt but manual setup)
- Performance: ⭐⭐⭐ (Adequate, single region)
- DX: ⭐⭐ (Manual deployment setup)
- Operational: ⭐ (High overhead - server maintenance)
- Vite Support: ⭐⭐⭐⭐ (Just serve static files)

**Estimated Setup Time:** 3-6 hours (VPS setup + Nginx + SSL + deployment pipeline)

---

### Option 6: Supabase Storage (Static Hosting)

**Description:** Host static site using Supabase Storage's static hosting feature

**Pros:**
- ✅ Already using Supabase (backend in same platform)
- ✅ Simple deployment (upload build folder)
- ✅ No additional account needed

**Cons:**
- ❌ Not optimized for static site hosting
- ❌ No CDN
- ❌ No automatic deployments from Git
- ❌ Manual upload process
- ❌ No preview deployments
- ❌ Documentation sparse for static hosting use case

**Fit for Project:**
- Cost: ⭐⭐⭐⭐⭐ (Included with Supabase)
- HTTPS: ⭐⭐⭐⭐ (Yes, automatic)
- Performance: ⭐⭐ (No CDN)
- DX: ⭐⭐ (Manual deployment)
- Operational: ⭐⭐⭐ (Simple but manual)
- Vite Support: ⭐⭐⭐ (Just upload build output)

**Estimated Setup Time:** 30-60 minutes (upload script + configuration)

---

## Decision Matrix

| Criteria (Weight)               | Vercel | Netlify | CF Pages | GitHub Pages | VPS | Supabase |
|---------------------------------|--------|---------|----------|--------------|-----|----------|
| Cost (8)                        | 10     | 10      | 10       | 10           | 6   | 10       |
| HTTPS Built-in (9)              | 10     | 10      | 10       | 8            | 5   | 8        |
| Performance/CDN (8)             | 10     | 10      | 10       | 5            | 6   | 4        |
| Developer Experience (10)       | 10     | 10      | 8        | 4            | 3   | 3        |
| Operational Simplicity (9)      | 10     | 10      | 10       | 6            | 2   | 6        |
| Vite Support (7)                | 10     | 9       | 9        | 6            | 8   | 6        |
| Auto Deploy (8)                 | 10     | 10      | 10       | 3            | 3   | 2        |
| Preview Deployments (6)         | 10     | 10      | 10       | 2            | 2   | 0        |
| Environment Variables (7)       | 10     | 10      | 10       | 4            | 8   | 6        |
| Custom Domain (5)               | 10     | 10      | 10       | 7            | 10  | 5        |
| **Weighted Total**              | **760**| **749** | **723**  | **456**      | **383** | **425** |

### Scoring Notes:
- Vercel edges out Netlify slightly due to better Vite integration and DX
- Cloudflare Pages strong contender with unlimited bandwidth
- GitHub Pages and VPS lack modern deployment features
- Supabase Storage not optimized for this use case

## Decision

**Vercel**

### Rationale

Vercel is the recommended choice for frontend hosting because:

1. **Best Developer Experience**: Zero-config deployment for Vite projects. Connect Git repo, Vercel auto-detects Vite, and deploys. This is the fastest path to production.

2. **Automatic Deployments**: Every Git push to main deploys to production automatically. Preview deployments for pull requests enable testing before merge.

3. **Performance**: Global CDN ensures fast load times worldwide (NFR-001, NFR-002). Edge network optimized for React/Vite applications.

4. **HTTPS Automatic**: SSL certificate provisioned automatically (NFR-024). Zero configuration required.

5. **Free Tier Sufficient**: As of decision date (2026-10-02), Vercel's free tier provided sufficient bandwidth for 1-10 users. Verify current plan limits before relying on free tier for production use.

6. **Environment Variables**: Secure management of Supabase credentials (URL, anon key) per environment (preview, production).

7. **Monitoring**: Built-in analytics and error tracking help identify issues.

8. **Future-Proof**: If server-side rendering is needed later, can migrate to Next.js on same platform with minimal disruption.

9. **Community**: Large community, excellent documentation, many Vite + React examples.

### Vercel vs Netlify vs Cloudflare Pages

All three are excellent choices. Vercel is recommended because:
- Best Vite integration (created by Vite's sister company)
- Slightly better DX and documentation
- More examples and community resources for React + Vite

**Netlify** would be equally viable - choose if you prefer Netlify's ecosystem or features like Netlify Forms.

**Cloudflare Pages** is compelling for unlimited bandwidth but slightly less polished DX.

### Trade-offs Accepted

- **Vendor Lock-In**: Mitigated by the fact that the built application is just static files. Can export and deploy elsewhere if needed.
- **Free Tier Limits**: 100GB bandwidth should be sufficient, but may need paid tier if usage grows significantly (unlikely for 1-10 users).

## Consequences

### Positive

- Fastest deployment setup (10-20 minutes)
- HTTPS automatic (NFR-024)
- Global CDN for performance (NFR-001, NFR-002)
- Zero operational overhead (no servers to manage)
- Automatic deployments from Git (efficient workflow)
- Preview deployments for testing PRs
- Free for expected scale
- Excellent documentation and support
- Monitoring and analytics built-in

### Negative

- Vendor dependency on Vercel
- Free tier bandwidth limit (100GB/month)
- Must have Vercel account

### Neutral

- Static site is portable (can move to Netlify, Cloudflare, or VPS if needed)
- Environment variables managed in Vercel dashboard
- Build logs and deployment history in Vercel UI

## Implementation Notes

### Deployment Setup

1. **Connect GitHub Repository**
   - Sign up for Vercel account
   - Import GitHub repository
   - Vercel auto-detects Vite project

2. **Configure Build Settings** (usually auto-detected)
   ```
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Configure Environment Variables**
   - `VITE_SUPABASE_URL`: Supabase project URL (browser-visible configuration)
   - `VITE_SUPABASE_ANON_KEY`: Supabase public/anonymous key (browser-visible, RLS-protected)
   - Set separately for Preview and Production environments

**Environment Variable Security Clarification:**

The Supabase URL and anon key are *browser-visible configuration values*, not secrets. They appear in the built JavaScript bundle. The anon key is designed to be public — it grants limited access controlled by RLS policies.

**Do NOT expose:**
- `SUPABASE_SERVICE_ROLE_KEY`: This is a server secret, never for browsers. Use only in Edge Functions or trusted server environments.

Vite environment variables prefixed with `VITE_` are explicitly included in the browser bundle. This is intentional for the anon key but would be catastrophic for the service role key.

4. **Configure Custom Domain** (optional)
   - Add custom domain in Vercel dashboard
   - Update DNS records (CNAME or A record)
   - SSL certificate provisioned automatically

### Deployment Workflow

**Automatic Deployment:**
- Push to `main` branch → Production deployment
- Open Pull Request → Preview deployment (unique URL for testing)
- Merge PR → Preview deployment becomes production

**Manual Deployment:**
- Use Vercel CLI: `vercel --prod`
- Or trigger deployment from Vercel dashboard

### Local Development

```bash
# Install dependencies
npm install

# Run development server (connects to Supabase)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### MVP 0 Deployment Strategy

**Default Approach:**
1. Start with local development (`npm run dev` connecting to cloud Supabase instance)
2. Validate core functionality on localhost
3. Optionally deploy to Vercel when remote access becomes useful (testing on mobile, sharing with stakeholder)

**Rationale:** The specification explicitly permits localhost deployment for MVP 0 validation. Deploying to Vercel before validating core functionality adds unnecessary complexity.

**When to Deploy MVP 0 to Vercel:**
- Curator needs to access application from multiple devices
- Testing mobile browser workflows in real environments
- Demonstrating to stakeholders without local setup

### MVP 1 Deployment Requirements

**Production Deployment:**
1. Deploy to Vercel with custom domain (optional but recommended)
2. HTTPS enforced (automatic with Vercel, satisfies NFR-024)
3. Separate preview deployments for feature testing
4. Appropriate environment variables per environment

**Why MVP 1 Requires Production Hosting:**
- Multi-user requires stable, accessible URL for invitation links
- HTTPS required for secure authentication (NFR-024)
- Global CDN improves multi-user experience

## Alternative: Netlify Implementation

If Netlify is preferred, setup is nearly identical:

1. Connect GitHub repository to Netlify
2. Netlify auto-detects Vite project
3. Configure environment variables
4. Automatic deployments from Git

Same benefits, same ease of use.

## References

- [ADR-001: Frontend Framework Selection](./ADR-001-frontend-framework-selection.md) - React + Vite
- [ADR-002: Backend Architecture Approach](./ADR-002-backend-architecture-approach.md) - Supabase backend
- [Requirements Specification v1.4](../artifacts/spec.md) - NFR-024 (HTTPS), MVP deployment requirements
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

## Decision Date

2026-10-02

## Decision Makers

- Jonas Pettersson (Curator/Developer)
- Claude Sonnet 4.5 (AI Assistant)

## Review Date

To be reviewed after MVP 0 deployment or if free tier limits are reached.
