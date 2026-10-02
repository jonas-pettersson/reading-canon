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

### MVP 0: Single User (Curator)

Simple authentication setup:
1. Create Supabase project
2. Enable email/password authentication
3. Manually create curator user in Supabase dashboard
4. Implement login UI in React
5. Use Supabase client for session management

**No invitation workflow needed** - single user can be created manually.

### MVP 1: Multi-User with Invitations

Enhanced authentication:
1. Implement invitation token generation (curator only)
2. Store invitation tokens in `invitation_tokens` table
3. Registration flow validates token before allowing signup
4. Assign role (curator vs reader) based on invitation or user position
5. First user is automatically curator, subsequent users are readers

### Authorization (Row-Level Security)

Supabase Auth provides `auth.uid()` function in RLS policies:

**Example RLS Policies:**

```sql
-- Books: Readable by all authenticated users, writable by curator only
CREATE POLICY "Books are readable by authenticated users"
  ON books FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Books are writable by curator only"
  ON books FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'curator'
    )
  );

-- UserReadingStatus: Users can only access their own data
CREATE POLICY "Users can view their own reading status"
  ON user_reading_status FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can modify their own reading status"
  ON user_reading_status FOR ALL
  USING (user_id = auth.uid());
```

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
