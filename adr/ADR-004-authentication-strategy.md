# ADR-004: Authentication Strategy

## Status

**ACCEPTED** - 2026-10-02

Determined by ADR-002 (Backend Architecture Approach).

## Context

The Reading Canon application requires authentication and authorization for both MVP 0 (single curator) and MVP 1 (multi-user with roles).

### Requirements from Specification v1.4:

**Authentication Requirements:**
- **FR-042**: Email/password authentication
- **NFR-020**: Authentication required for all access
- **NFR-023**: Passwords must not be stored in recoverable form (hashed)
- **NFR-024**: HTTPS required (production)

**Authorization Requirements:**
- **FR-043**: Role-based permissions (Curator vs Reader)
- **NFR-021**: Users can only access their own personal data
- **NFR-022**: Only curator can modify canonical collection

**User Management:**
- **FR-040**: Generate invitation tokens (curator only)
- **FR-041**: Register via invitation link only (private application)

### Open Question from Specification:

**Q1: Authentication Strategy**
> Should we use a managed authentication service or build custom?
> 
> Options:
> 1. Managed Service (Supabase Auth, Auth0, Clerk)
> 2. Custom JWT-based Authentication

The specification recommended managed service for security and time-to-market.

## Decision

**Supabase Auth (Managed Authentication Service)**

As determined in ADR-002, authentication will be handled by Supabase Auth.

## Rationale

Supabase Auth is the recommended choice because:

1. **Security**: Authentication is notoriously difficult to implement correctly. Supabase Auth is battle-tested and handles:
   - Password hashing (bcrypt) - satisfies NFR-023
   - Token generation and refresh
   - Session management
   - HTTPS enforcement - satisfies NFR-024
   - Protection against common attacks (timing attacks, brute force)

2. **Email/Password Support**: Built-in email/password authentication satisfies FR-042.

3. **Invitation Workflow**: Supabase supports invitation tokens natively, which can be used for FR-040/FR-041 requirements.

4. **Role Management**: User metadata can store roles (curator vs reader) for FR-043.

5. **Row-Level Security Integration**: Supabase Auth integrates seamlessly with PostgreSQL RLS policies, making authorization (NFR-021, NFR-022) database-enforced and more secure.

6. **Zero Backend Code**: No need to write authentication logic, reducing security risk and development time.

7. **Developer Experience**: Built-in UI components, client SDK, and session management.

8. **Future Flexibility**: Supports magic links, OAuth providers (Google, GitHub, etc.) if needed later.

## Alternatives Considered

Since this decision was made as part of ADR-002 (Supabase), alternatives were evaluated at the backend architecture level. See ADR-002 for full analysis.

### Custom JWT Authentication (Rejected)

**Pros:**
- Full control over implementation
- Learning opportunity

**Cons:**
- High security risk if implemented incorrectly
- Must implement: password hashing, salt generation, token signing, refresh logic, session management, rate limiting
- Time-consuming (estimated 10-20 hours minimum)
- Ongoing maintenance and security updates

**Verdict:** Not worth the risk or time investment for this project. Security is too critical to build from scratch as a learning exercise.

### Other Managed Services (Not Evaluated)

Auth0, Clerk, and other services were not evaluated in detail because:
- Supabase Auth is included with Supabase (already chosen for backend)
- No additional cost or integration complexity
- Tight integration with PostgreSQL RLS

## Consequences

### Positive

- Secure authentication out of the box (NFR-023, NFR-024)
- Email/password registration and login (FR-042)
- Invitation workflow support (FR-040, FR-041)
- Session management handled automatically
- Integration with PostgreSQL RLS for authorization
- No backend authentication code to write or maintain
- Protection against common attacks (brute force, timing attacks)
- Future OAuth support available if needed

### Negative

- Vendor dependency on Supabase (mitigated: Auth is based on GoTrue, which is open-source)
- Less learning about auth internals
- Must learn Supabase Auth API and patterns

### Neutral

- Supabase Auth uses GoTrue (open-source) under the hood
- Migration path exists if needed (export users, implement custom auth later)

## Implementation Details

### MVP 0 Curator Bootstrap Mechanism

**Requirement:** FR-043 states "first user in system is automatically curator." For MVP 0, this requires a secure, repeatable mechanism to provision the initial curator account.

**Selected Approach:** Manual curator creation via Supabase dashboard with documented procedure

**Procedure:**

1. **Create Supabase project** (development or production)
2. **Enable email/password authentication** in Supabase Auth settings
3. **Manually create curator user:**
   - Navigate to Supabase dashboard → Authentication → Users
   - Click "Add User"
   - Enter curator's email and secure password
   - Confirm email (or use auto-confirm for development)
4. **(If using profiles table)** Insert curator profile:
   ```sql
   INSERT INTO public.profiles (id, display_name, role, created_at)
   VALUES (
     '<auth-user-id-from-dashboard>',
     'Curator Name',
     'curator',
     NOW()
   );
   ```
5. **Store credentials securely** (password manager, not in source control)

**For Development/Test Environments:**

Use a seed migration or documented script for repeatable setup:

```sql
-- Development seed (NOT for production)
-- Assumes curator auth user already exists with known ID
INSERT INTO public.profiles (id, display_name, role, created_at)
VALUES (
  '<dev-curator-auth-id>',
  'Dev Curator',
  'curator',
  NOW()
)
ON CONFLICT (id) DO NOTHING;
```

**Rationale:**

This approach:
- Avoids an insecure "first registration wins" public flow
- Provides clear administrative control over curator identity
- Is repeatable for local development and test environments
- Does not embed credentials in source control
- Aligns with spec requirement: the initially provisioned user is the curator

**Clarification of FR-043:** The specification statement "first user is automatically curator" is interpreted as "the initially provisioned user is the curator," not "the first person to register through a public form becomes curator." The latter would be a security vulnerability for an invitation-only application.

### MVP 0 Implementation Scope

**What Must Be Implemented:**
1. Supabase project with email/password authentication enabled
2. Basic login/logout UI in React
3. Curator account provisioned via procedure above
4. Session management using Supabase client
5. Authenticated route protection

**What Is Deferred:**
- Public registration UI (no self-service registration in MVP 0 or MVP 1)
- Invitation generation and validation (MVP 1)
- Multi-user support (MVP 1)
- Profile table (optional for MVP 0, required for MVP 1)
- Role-based UI variations (single user is implicitly curator)

### MVP 1: Multi-User with Invitation-Based Registration

**Specification Requirements (FR-040, FR-041):**

Invitations must be:
- Generated by curator only (privileged operation)
- Time-limited with configurable expiration
- Revocable by curator before use
- Single-use (consumed on registration)
- Optionally tied to a specific email address
- Visible as "pending invitations" to curator
- Validated before account creation

**Implementation Architecture:**

1. **Application-Level `invitation_tokens` Table**

   The specification's `InvitationTokens` entity must be implemented as an application-managed table:
   
   ```sql
   CREATE TABLE public.invitation_tokens (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     token TEXT UNIQUE NOT NULL, -- cryptographically random
     created_by_user_id UUID REFERENCES auth.users(id) NOT NULL,
     invited_email TEXT, -- optional pre-fill
     expires_at TIMESTAMPTZ NOT NULL,
     used_at TIMESTAMPTZ,
     used_by_user_id UUID REFERENCES auth.users(id),
     revoked_at TIMESTAMPTZ,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

2. **Invitation Generation (Server-Side)**

   Token generation must occur in a trusted server-side context to prevent unauthorized invitation creation. Options:

   - **Supabase Edge Function** (recommended): Curator calls Edge Function which validates curator role, generates cryptographically secure token, and inserts record
   - **Database Function**: `SECURITY DEFINER` function that checks caller is curator
   - **Administrative Script**: Manual CLI script for curator (acceptable for small scale)

   **Important:** Invitation generation MUST NOT occur in browser JavaScript. The Supabase service role key required for privileged operations must never be exposed to the frontend.

3. **Registration Flow**

   New user registration:
   1. User receives invitation URL with token
   2. Frontend validates token is unused, not expired, not revoked (query `invitation_tokens`)
   3. If valid, show registration form (email optionally pre-filled)
   4. On submit, call Supabase `signUp()` with email/password
   5. After account creation, mark token as used and create profile with role='reader'

4. **Supabase Auth Invitation Features**

   Supabase Auth provides `inviteUserByEmail()` which:
   - Sends an email with a magic link
   - Creates a pending user account
   - Allows user to set password via link

   **Limitation:** This built-in feature does NOT satisfy all application requirements:
   - Tokens are not stored in an application-queryable table
   - No curator-visible pending invitation list
   - Revocation is not straightforward
   - Cannot enforce application-specific single-use semantics
   - Limited customization of invitation metadata

   **Decision:** Use application-level `invitation_tokens` table for full control. Supabase Auth's native invitation is insufficient for the specification's requirements. The application manages its own invitation lifecycle and uses standard Supabase `signUp()` after token validation.

**Edge Function Necessity:**

For MVP 1, an Edge Function (or equivalent trusted server function) is required for:
- Secure invitation token generation (curator-only operation)
- Preventing service-role key exposure in browser

This is a departure from "zero backend code" but necessary for secure invitation management. The Edge Function is a small, focused piece of logic, not a general-purpose backend.

### Edge Function Development Workflow (MVP 1)

**Repository Structure:**
```
supabase/
├── migrations/
│   └── ...
└── functions/
    └── generate-invitation/
        ├── index.ts          # Main function
        └── index.test.ts     # Unit tests (optional)
```

**Local Development:**
```bash
# Serve function locally
supabase functions serve generate-invitation

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/generate-invitation' \
  --header 'Authorization: Bearer <anon-key>' \
  --header 'Content-Type: application/json' \
  --data '{"invited_email":"user@example.com","expires_in_days":7}'
```

**Function Implementation:**
```typescript
// supabase/functions/generate-invitation/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Service role for privileged access
    { auth: { persistSession: false } }
  )

  // Verify caller is curator
  const authHeader = req.headers.get('Authorization')!
  const jwt = authHeader.replace('Bearer ', '')
  const { data: { user } } = await supabaseClient.auth.getUser(jwt)
  
  if (!user) return new Response('Unauthorized', { status: 401 })
  
  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'curator') {
    return new Response('Forbidden: Curator access required', { status: 403 })
  }

  // Generate secure random token
  const token = crypto.randomUUID()
  const { invited_email, expires_in_days = 7 } = await req.json()
  
  // Insert invitation token
  const { data, error } = await supabaseClient
    .from('invitation_tokens')
    .insert({
      token,
      created_by_user_id: user.id,
      invited_email,
      expires_at: new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000).toISOString()
    })
    .select()
    .single()
  
  if (error) return new Response(JSON.stringify({ error }), { status: 500 })
  
  const invitationUrl = `${Deno.env.get('APP_URL')}/register?token=${token}`
  return new Response(JSON.stringify({ invitation_url: invitationUrl, ...data }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

**Deployment:**
```bash
# Deploy to Supabase
supabase functions deploy generate-invitation

# Set environment variables in Supabase dashboard
# - SUPABASE_URL (auto-set)
# - SUPABASE_SERVICE_ROLE_KEY (auto-set)
# - APP_URL (manually set to your Vercel deployment URL)
```

**Testing:**
- **Unit tests**: Test function logic with mocked Supabase client
- **Integration tests**: Test deployed function with staging database
- **Manual testing**: Use Supabase dashboard function logs for debugging

**When to Use Edge Functions:**
- Operations requiring service-role access (invitation generation, role changes)
- Operations that must not expose logic to browser (rate limiting, privileged queries)
- Background jobs (future: email notifications, data aggregation)

### User Profile and Role Storage Model

**Decision:** Two-table model separating authentication from application profiles

**Specification Mapping:**

The specification (section 2.1) defines a "Users" entity with email, password_hash, display_name, role, invited_by_user_id, and timestamps. This is implemented using a two-table pattern:
- `auth.users` (Supabase-managed) stores email and password_hash
- `public.profiles` (application-managed) stores display_name, role, invited_by_user_id, and timestamps

This separation follows Supabase's architecture where authentication data is managed by the auth service, while application-specific user data lives in application tables. The two tables are linked by user ID (foreign key from profiles.id to auth.users.id).

**Source of Truth:**

1. **Authentication Identity:** `auth.users` (Supabase-managed)
   - Email, password hash, authentication tokens
   - Managed by Supabase Auth, never accessed directly by application
   - Provides `auth.uid()` for RLS policies

2. **Application Profile:** `public.profiles` table (application-managed)
   - User ID (foreign key to `auth.users.id`)
   - `display_name` (user's name shown in UI)
   - `role` (enumerated: 'curator' | 'reader')
   - `invited_by_user_id` (optional, tracks invitation chain)
   - `created_at`, `last_login_at` (audit timestamps)

**Role Authorization:**

Roles are stored in the `profiles` table, not in JWT metadata. RLS policies query the `profiles` table to obtain trusted role information:

```sql
-- Example: Check if current user is curator
CREATE FUNCTION is_curator() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'curator'
  );
$$ LANGUAGE SQL SECURITY DEFINER;
```

**Rationale for Table-Based Roles:**

- Roles can be changed without re-authentication
- Role updates take effect immediately
- Database enforces role integrity
- No client-accessible metadata can grant curator access
- Simpler than JWT claims management for this application's scale

**Profile Record Creation:**

- Triggered automatically on user signup via database trigger or Edge Function
- Initial curator created manually during MVP 0 setup (see bootstrap mechanism below)
- Subsequent users created through invitation flow (MVP 1)

**Password Security:**

Password hashes are managed exclusively by Supabase Auth in `auth.users`. The application never accesses, stores, or handles password hashes. This satisfies NFR-023 (passwords stored in hashed form).

**MVP 0 Simplification:**

For single-user MVP 0, the `profiles` table is optional. The application can rely on `auth.users` alone with simplified RLS policies that don't check roles. The `profiles` table should be added before MVP 1 to establish the role model.

### Authorization (Row-Level Security)

Supabase Auth provides `auth.uid()` for identifying the current user. Role checks query the `profiles` table.

**Example RLS Policies (MVP 1 - role-aware):**

```sql
-- Books: Readable by all authenticated users, writable by curator only
CREATE POLICY "books_select_authenticated"
  ON books FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "books_insert_curator"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'curator'
    )
  );

CREATE POLICY "books_update_curator"
  ON books FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'curator'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'curator'
    )
  );

CREATE POLICY "books_delete_curator"
  ON books FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'curator'
    )
  );

-- UserReadingStatus: Users can only access their own data
CREATE POLICY "user_reading_status_select"
  ON user_reading_status FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_reading_status_insert"
  ON user_reading_status FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_reading_status_update"
  ON user_reading_status FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_reading_status_delete"
  ON user_reading_status FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ExternalReferences: Readable by all authenticated users, writable by curator only
CREATE POLICY "external_references_select_authenticated"
  ON external_references FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "external_references_insert_curator"
  ON external_references FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'curator'
    )
  );

CREATE POLICY "external_references_update_curator"
  ON external_references FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'curator'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'curator'
    )
  );

CREATE POLICY "external_references_delete_curator"
  ON external_references FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'curator'
    )
  );

-- Profiles: Readable by all authenticated users, writable only by owner (display_name only, not role)
CREATE POLICY "profiles_select_authenticated"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Only triggered/service-role (created during signup)
-- No policy needed - INSERT restricted to trigger or service role

CREATE POLICY "profiles_update_own_display_name"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() 
    AND role = (SELECT role FROM profiles WHERE id = auth.uid()) -- Prevent role change
  );

-- DELETE: No one can delete profiles (permanent records)
-- No policy needed

-- InvitationTokens (MVP 1): Curator can manage, anon can validate during registration
CREATE POLICY "invitation_tokens_select"
  ON invitation_tokens FOR SELECT
  TO authenticated, anon
  USING (
    -- Curator can see all tokens
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'curator'
    )
    OR
    -- Anonymous users validating registration can see tokens
    (auth.uid() IS NULL)
  );

-- INSERT: Only via Edge Function (service role)
-- No RLS policy - controlled by Edge Function

CREATE POLICY "invitation_tokens_update_revoke"
  ON invitation_tokens FOR UPDATE
  TO authenticated
  USING (
    -- Curator can revoke unused tokens
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'curator'
    )
    AND used_at IS NULL
  )
  WITH CHECK (
    -- Can only set revoked_at
    revoked_at IS NOT NULL
  );

-- Separate policy for marking token as used (during registration)
-- This would typically be done via a service-role Edge Function or trigger
-- If done client-side during registration, needs careful constraint

-- DELETE: No one can delete tokens (audit trail)
-- No policy needed
```

**Note:** These policies separate INSERT, UPDATE, DELETE, and SELECT operations with appropriate `USING` and `WITH CHECK` clauses. This prevents users from inserting or updating records with another user's ID and ensures only curators can modify canonical book data. The `profiles` table UPDATE policy prevents users from changing their own role (privilege escalation). The `invitation_tokens` policies allow anonymous access for validation during registration but restrict management to curators.

### React Integration

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Register (via invitation)
const { data, error } = await supabase.auth.signUp({
  email: 'newuser@example.com',
  password: 'password123'
})

// Get current user
const { data: { user } } = await supabase.auth.getUser()

// Logout
await supabase.auth.signOut()
```

### Security Considerations

- Passwords are hashed with bcrypt (satisfies NFR-023)
- Sessions use JWT tokens (short-lived access tokens + refresh tokens)
- HTTPS enforced in production (satisfies NFR-024)
- Rate limiting on authentication endpoints (Supabase default)
- CSRF protection built-in
- Email verification available (optional)

## References

- [ADR-002: Backend Architecture Approach](./ADR-002-backend-architecture-approach.md) - Primary decision document
- [Requirements Specification v1.4](../artifacts/spec.md) - Section 1.5 (User Management & Authentication), Q1
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [GoTrue (Open-Source Auth Engine)](https://github.com/netlify/gotrue)

## Decision Date

2026-10-02

## Decision Makers

- Jonas Pettersson (Curator/Developer)
- Claude Sonnet 4.5 (AI Assistant)
