# Scripts

This directory contains Node.js scripts for administrative tasks.

## create-curator.ts

Creates the initial curator account for Reading Canon using Supabase Admin API.

### Prerequisites

1. Add your Supabase Service Role Key to `.env.local`:

   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

   Find it in: **Supabase Dashboard → Settings → API → service_role**

   ⚠️ **Warning:** This key has admin privileges. Never commit it or expose it to client code.

2. Ensure `VITE_SUPABASE_URL` is set in `.env.local`

### Usage

**Interactive mode** (will prompt for email and password):

```bash
npm run create-curator
```

**Environment variable mode** (no prompts):

```bash
CURATOR_EMAIL=curator@example.com CURATOR_PASSWORD=SecurePass123 npm run create-curator
```

Or add to `.env.local`:

```bash
CURATOR_EMAIL=curator@example.com
CURATOR_PASSWORD=SecurePass123
```

Then run:

```bash
npm run create-curator
```

### What it does

1. Validates environment variables
2. Checks if curator already exists (safe to run multiple times)
3. Creates curator account with email verification pre-confirmed
4. Sets `email_confirm: true` (no verification email needed for MVP 0)
5. Adds user metadata: `{ role: 'curator', created_by: 'admin_script' }`

### After running

1. Start the dev server: `npm run dev`
2. Visit: http://localhost:5173/login
3. Log in with your curator credentials

### Troubleshooting

**Error: SUPABASE_SERVICE_ROLE_KEY is not set**
- Add the service role key to `.env.local`
- Get it from Supabase Dashboard → Settings → API → service_role

**Error: Invalid email address**
- Email must be in valid format (e.g., `user@example.com`)

**Error: Password must be at least 6 characters**
- Use a password with 6+ characters

**User already exists**
- The script is safe to run multiple times
- If user exists, it will show the existing user details
- You can log in with the existing credentials
