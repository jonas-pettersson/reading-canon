# ADR-007: Testing Strategy

## Status

**ACCEPTED** - 2026-10-02

## Context

The Reading Canon application requires a testing strategy to ensure quality, maintainability, and confidence in changes. This is especially important as a learning exercise demonstrating modern development practices.

### Requirements from Specification v1.4:

**Quality Requirements:**
- **NFR-040**: Well-documented code (Must Have)
- **NFR-041**: Architecture decisions documented in ADRs (Must Have)
- **NFR-042**: Traceable implementation to requirements (Must Have)

**Functional Requirements to Test:**
- Collection management: display, search, filter, sort (FR-001 to FR-005)
- Curation: add, edit, remove books (FR-010 to FR-012)
- Personal reading management: status, priority, notes, rating (FR-020 to FR-026)
- Statistics and insights (FR-030 to FR-033)
- User management and authentication (FR-040 to FR-043)

**UX Requirements to Test:**
- Accessibility (UX-007: WCAG 2.1 AA compliance)
- Keyboard navigation (UX-006)
- Responsive behavior (UX-008)
- Empty states and error handling (UX-004, UX-005)

### Project Context

- **Learning exercise**: Testing is part of learning modern development practices
- **Single developer initially**: Testing strategy should be practical and maintainable
- **MVP 0 scope**: Balance between comprehensive testing and rapid development
- **Type safety**: TypeScript provides some safety, tests catch runtime behavior

## Testing Philosophy

**Guiding Principles:**

1. **Test behavior, not implementation**: Focus on what users see and do, not internal details
2. **Confidence over coverage**: Aim for confidence in critical flows, not 100% coverage
3. **Testing pyramid**: Many unit tests, fewer integration tests, few E2E tests
4. **Fast feedback**: Tests should run quickly in development
5. **Accessibility first**: Test accessibility as part of component testing

**Testing Priorities (MVP 0):**

- **High Priority**: Critical user flows (authentication, CRUD operations, data integrity)
- **Medium Priority**: Business logic (filtering, sorting, search)
- **Lower Priority**: UI edge cases, styling, animations
- **Deferred**: Performance testing, load testing (manual for MVP 0)

## Decision

**Multi-Layer Testing Strategy:**

1. **Unit/Component Testing**: Vitest + React Testing Library
2. **Integration Testing**: React Testing Library with mocked Supabase
3. **E2E Testing**: Playwright (deferred to post-MVP 0 validation)
4. **Type Checking**: TypeScript strict mode
5. **Accessibility Testing**: jest-axe + manual testing

## Test Layers

### Layer 1: Unit/Component Tests (Vitest + React Testing Library)

**Tool**: Vitest with React Testing Library

**Purpose**: Test individual components and utility functions in isolation

**What to Test:**
- Component rendering with various props
- User interactions (clicks, form inputs, keyboard navigation)
- Conditional rendering (empty states, loading states, error states)
- Accessibility (ARIA attributes, semantic HTML)
- Business logic functions (data transformations, validation)

**Example:**
```typescript
// BookCard.test.tsx
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { BookCard } from './BookCard'

describe('BookCard', () => {
  const mockBook = {
    id: '1',
    title: 'The Iliad',
    author_display_name: 'Homer',
    year_published: '8th century BC'
  }

  it('renders book information', () => {
    render(<BookCard book={mockBook} />)
    
    expect(screen.getByText('The Iliad')).toBeInTheDocument()
    expect(screen.getByText('Homer')).toBeInTheDocument()
    expect(screen.getByText('8th century BC')).toBeInTheDocument()
  })

  it('calls onStatusChange when status is updated', async () => {
    const onStatusChange = vi.fn()
    render(<BookCard book={mockBook} onStatusChange={onStatusChange} />)
    
    const statusButton = screen.getByRole('button', { name: /change status/i })
    await userEvent.click(statusButton)
    
    const readingOption = screen.getByRole('menuitem', { name: /reading/i })
    await userEvent.click(readingOption)
    
    expect(onStatusChange).toHaveBeenCalledWith(mockBook.id, 'reading')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<BookCard book={mockBook} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
  
  // Note: Run axe checks on representative components and interaction-heavy components,
  // not mechanically on every component. Prioritize forms, modals, navigation, and
  // complex interactive elements.

  it('supports keyboard navigation', async () => {
    render(<BookCard book={mockBook} />)
    
    const statusButton = screen.getByRole('button', { name: /change status/i })
    statusButton.focus()
    
    expect(statusButton).toHaveFocus()
    
    await userEvent.keyboard('{Enter}')
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })
})
```

**Coverage Philosophy:**

Coverage targets are *guidance*, not absolute quality gates. Confidence in critical behavior takes precedence over coverage percentages.

- **Target guidelines:** 70-80% for components, 90%+ for utility functions
- **What matters more than coverage:**
  - Critical user journeys are tested (authentication, CRUD, status updates, search)
  - Risky logic is tested (data transformations, validation, authorization checks)
  - Accessibility is verified (automated checks + manual testing)
  - Edge cases in complex components are covered
- **Acceptable gaps:**
  - Trivial pass-through components
  - Static content rendering
  - Styling-only variations
  - Third-party library wrappers with minimal logic

**Accessibility Testing Approach:**

Run jest-axe on:
- Representative components from each category (form, list, detail, navigation)
- Interaction-heavy components (dropdowns, modals, dialogs, multi-step flows)
- Custom accessible patterns

Do NOT mechanically run jest-axe on every component. Focus automated checks where they add value. Complement with manual testing (see Finding 22 below).

**Requirements Traceability:** Test names and metadata should reference requirement IDs where applicable to support NFR-042 (traceable implementation). Example:

```typescript
describe('Book Search (FR-002)', () => {
  it('should search title case-insensitively (FR-002)', () => { ... })
  it('should search author_display_name (FR-002)', () => { ... })
  it('should search inclusion_rationale (FR-002)', () => { ... })
  it('should return results within 1 second (NFR-002)', () => { ... })
})
```

Requirement IDs in test names create a lightweight traceability mechanism without administrative overhead.

---

### Layer 2: Integration Tests (React Testing Library + MSW)

**Tool**: React Testing Library with Mock Service Worker (MSW) for API mocking

**Purpose**: Test multiple components working together with simulated backend

**What to Test:**
- User flows across multiple components
- Data fetching and mutations (with mocked Supabase)
- Form submission and validation
- Error handling and retry logic
- Authorization checks (RLS behavior)

**Example:**
```typescript
// AddBookFlow.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { AddBookPage } from './AddBookPage'

const server = setupServer(
  http.post('/rest/v1/books', () => {
    return HttpResponse.json({
      id: '123',
      title: 'New Book',
      author_display_name: 'New Author'
    })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Add Book Flow', () => {
  it('allows curator to add a book', async () => {
    render(<AddBookPage />)
    
    // Fill in required fields
    await userEvent.type(screen.getByLabelText(/title/i), 'New Book')
    await userEvent.type(screen.getByLabelText(/author/i), 'New Author')
    
    // Submit form
    await userEvent.click(screen.getByRole('button', { name: /add book/i }))
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/book added successfully/i)).toBeInTheDocument()
    })
  })

  it('shows validation errors for missing required fields', async () => {
    render(<AddBookPage />)
    
    // Submit without filling fields
    await userEvent.click(screen.getByRole('button', { name: /add book/i }))
    
    expect(await screen.findByText(/title is required/i)).toBeInTheDocument()
    expect(screen.getByText(/author is required/i)).toBeInTheDocument()
  })
})
```

**Coverage Target**: Major user flows covered

**Critical Requirements Verification:** Integration tests should map to high-priority use cases:
- UC-001: Browse and discover books → `BookList.integration.test.tsx`
- UC-002: Search and filter collection → `SearchFlow.integration.test.tsx`
- UC-003: Update reading status → `ReadingStatus.integration.test.tsx`
- UC-004: Excel migration → Manual verification + migration report

Each critical requirement should have at least one verification method (automated test, manual test, or documented validation procedure).

---

### Layer 3: End-to-End Tests (Playwright)

**Tool**: Playwright

**Purpose**: Test full application in real browser with real Supabase test instance

**What to Test:**
- Critical user journeys (login → add book → update status → search → logout)
- Cross-browser compatibility (Chromium at minimum, Firefox/WebKit if time permits)
- Mobile viewport smoke tests for essential workflows (UX-011)
- Authentication flows

**MVP 0 E2E Testing Decision:**

**Option 1: Minimal Smoke Test Suite (Recommended)**

Implement 3-5 critical smoke tests before considering MVP 0 complete:

1. **Authentication:** Login → verify dashboard → logout
2. **Add Book:** Login → add book with required fields → verify appears in list
3. **Update Status:** Login → change book status to "Reading" → verify in Reading list
4. **Search:** Login → search by title → verify results
5. **Mobile Essential:** Login on mobile viewport (375px) → view reading list → mark as finished

**Rationale for Inclusion:**
- MVP 0 includes integrated workflows (login → CRUD → search → status updates)
- Manual testing of these flows is tedious and error-prone
- Migration validation benefits from repeatable E2E tests
- Mobile testing on real viewports catches responsive issues
- Small test count (5 tests) is maintainable for single developer

**Option 2: Manual Acceptance Testing with Documented Checklist (Alternative)**

If E2E automation proves too time-consuming, defer Playwright and use documented manual testing:

Create `ACCEPTANCE_TESTS.md` checklist:
- [ ] Login with valid credentials succeeds
- [ ] Login with invalid credentials shows error
- [ ] Add book with required fields (title, author) saves successfully
- [ ] Book appears in collection list after creation
- [ ] Editing book metadata persists changes
- [ ] Deleting book removes it from collection (with confirmation)
- [ ] Changing reading status to "Reading" updates status indicator
- [ ] Book appears in "Currently Reading" filtered view
- [ ] Marking book as "Finished" records completion
- [ ] Search finds books by title (partial, case-insensitive)
- [ ] Search finds books by author (partial, case-insensitive)
- [ ] Filter by category shows only matching books
- [ ] Filter by tag shows only books with that tag
- [ ] Sort by year (oldest first) orders chronologically
- [ ] Mobile (375px width): Can view reading list, update status, mark as finished
- [ ] Logout clears session and returns to login

Execute checklist before each MVP 0 validation milestone.

**Recommended Approach:** Start with Option 2 (manual checklist) during initial development. Add Option 1 (minimal smoke tests) once core features stabilize and before final MVP 0 validation. This balances rapid iteration with quality assurance.

**Full E2E Suite:** Defer comprehensive cross-browser and extensive E2E testing until after MVP 0 validation and before MVP 1 (multi-user).

---

### Layer 4: Type Checking (TypeScript)

**Tool**: TypeScript with strict mode

**Purpose**: Catch type errors at compile time

**Configuration**:
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**What it Catches**:
- Type mismatches
- Null/undefined errors
- Missing properties
- Invalid function arguments

**Run**: `npm run type-check` (part of CI pipeline)

---

### Layer 5: Accessibility Testing

**Tools**: 
- jest-axe (automated accessibility checks)
- Manual keyboard-only navigation testing
- Manual screen reader testing (NVDA/JAWS/VoiceOver)
- Browser DevTools accessibility audits

**Specification Requirements:**
- UX-006: Keyboard navigation support
- UX-007: Screen reader accessibility (WCAG 2.1 AA)
- UX-008, UX-011: Responsive and mobile-essential workflows

**MVP 0 Accessibility Verification Strategy**

The application must meet basic accessibility compliance before MVP 0 is considered complete. This section defines the minimum verification required for release.

#### Automated Checks (Integrated into Development)

**jest-axe in Component Tests:**
- Run on representative components: forms, navigation, interactive lists, modals/dialogs, dropdowns
- Run on new accessibility patterns (custom controls, complex interactions)
- Do NOT run mechanically on every component

**Continuous:**
- TypeScript enforces semantic HTML through component props
- ESLint with jsx-a11y plugin catches common issues

#### Manual Checks (Before MVP 0 Release)

**Keyboard Navigation (Required):**
- [ ] Tab key navigates through all interactive elements in logical order
- [ ] Enter/Space activates buttons and links
- [ ] Escape closes modals and dropdowns
- [ ] Focus indicators clearly visible on all interactive elements
- [ ] No keyboard traps (can navigate away from any element)
- [ ] Modal dialogs trap focus appropriately and restore focus on close

Test on:
- Login flow
- Add/edit book form
- Book list with status controls
- Search and filter controls
- Reading status dropdown/selector

**Screen Reader (Critical Flows):**
- [ ] Login form announces labels, errors, and success
- [ ] Book list announces book count and list structure
- [ ] Status change announces new status
- [ ] Form validation errors announced and associated with fields
- [ ] Modal/dialog open/close announced appropriately
- [ ] Search results count announced

Test with:
- **Windows:** NVDA (free) with Chrome/Firefox
- **macOS:** VoiceOver (built-in) with Safari
- **Mobile:** VoiceOver on iOS or TalkBack on Android for essential workflows (UX-011)

**Visual and Color (Before Release):**
- [ ] Color contrast meets WCAG 2.1 AA minimum (4.5:1 for normal text, 3:1 for large text)
- [ ] Information not conveyed by color alone (e.g., error states have icons + text)
- [ ] Focus indicators meet 3:1 contrast against background

Use browser DevTools accessibility audit or [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

**Mobile Accessibility (UX-011 Essential Workflows):**
- [ ] Touch targets minimum 44x44 pixels for interactive elements
- [ ] Essential workflows navigable with screen reader on mobile viewport
- [ ] No horizontal scrolling required
- [ ] Pinch-to-zoom not disabled

#### MVP 0 Release Gate

Before MVP 0 is considered complete:

1. **Automated checks pass** on representative components
2. **Keyboard navigation works** for all critical flows (checklist above)
3. **Screen reader testing completed** for critical flows (checklist above)
4. **Color contrast verified** for text and interactive elements
5. **Mobile essential workflows verified** with screen reader on phone-sized viewport

#### Deferred to Post-MVP 0

- Comprehensive screen reader testing across all features
- Exhaustive keyboard shortcut support
- Advanced ARIA patterns (unless required for specific feature)
- Third-party accessibility audit
- Accessibility conformance report (VPAT)

#### Accessibility Testing Schedule During Development

- **Weekly:** Keyboard navigation smoke test of new features
- **Per Feature:** Targeted screen reader test of new interactive patterns
- **Before Release:** Complete manual checklist above
- **Continuous:** jest-axe in component tests, linting

This approach ensures MVP 0 meets WCAG 2.1 AA basics without requiring exhaustive manual testing during rapid development.

---

## Testing Tools Stack

**Primary Tools:**
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "jest-axe": "^8.0.0",
    "msw": "^2.0.0",
    "@vitest/ui": "^1.0.0"
  }
}
```

**Optional (Post-MVP 0):**
- Playwright (E2E)
- @playwright/test
- Storybook (component documentation and visual testing)

## Test Organization

**Directory Structure:**
```
src/
├── components/
│   ├── BookCard/
│   │   ├── BookCard.tsx
│   │   ├── BookCard.test.tsx
│   │   └── BookCard.stories.tsx (future)
├── hooks/
│   ├── useBooks.ts
│   └── useBooks.test.ts
├── utils/
│   ├── validation.ts
│   └── validation.test.ts
└── test/
    ├── setup.ts
    ├── mocks/
    │   ├── handlers.ts (MSW handlers)
    │   └── supabase.ts (Supabase mock)
    └── utils/
        └── test-utils.tsx (custom render, providers)
```

## Test Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "type-check": "tsc --noEmit"
  }
}
```

## CI/CD Integration

**GitHub Actions Workflow:**
```yaml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run type-check
      - run: npm run test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

**Quality Gates:**
- All tests must pass
- Type check must pass
- Coverage > 70% for new code (enforced via codecov)

## Testing Best Practices

1. **AAA Pattern**: Arrange → Act → Assert
2. **Clear test names**: Describe behavior, not implementation
3. **One assertion per concept**: Focus each test
4. **Use data-testid sparingly**: Prefer accessible queries (role, label, text)
5. **Avoid implementation details**: Test user behavior, not internal state
6. **Mock external dependencies**: Supabase, third-party APIs
7. **Test error states**: Network errors, validation failures, empty states
8. **Keep tests independent**: No shared state between tests

## What NOT to Test

- Third-party library internals (React, Supabase, React Query)
- Styling and CSS (unless critical to functionality)
- Static content (unless generated dynamically)
- Trivial code (simple getters, pass-through props)

## MVP 0 Testing Scope

**Must Test:**
- ✅ Authentication (login/logout)
- ✅ Add/edit/delete book (curator CRUD)
- ✅ Update reading status
- ✅ Search and filter
- ✅ Form validation
- ✅ Accessibility (automated checks)

**Nice to Test (Lower Priority):**
- Advanced filtering combinations
- Edge cases in date formatting
- Empty state variations
- Error recovery flows

**Deferred:**
- E2E tests (manual testing for MVP 0)
- Performance testing
- Visual regression testing
- Load testing

## Consequences

### Positive

- Confidence in core functionality
- Catch bugs early in development
- Accessibility built-in from start
- Regression protection for refactoring
- Documentation via tests (examples of usage)
- Fast feedback loop (Vitest is fast)

### Negative

- Time investment in writing tests (balanced against rapid development)
- Tests require maintenance when code changes
- Learning curve for Testing Library patterns

### Neutral

- Coverage targets are guidelines, not absolute requirements
- Manual testing still needed for UX validation
- Tests document expected behavior

## References

- [Requirements Specification v1.4](../artifacts/spec.md) - Functional requirements
- [ADR-001: Frontend Framework Selection](./ADR-001-frontend-framework-selection.md) - React + Vitest
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library Documentation](https://testing-library.com/react)
- [jest-axe Documentation](https://github.com/nickcolley/jest-axe)
- [MSW Documentation](https://mswjs.io/)

## Decision Date

2026-10-02

## Decision Makers

- Jonas Pettersson (Curator/Developer)
- Claude Sonnet 4.5 (AI Assistant)

## Review Date

To be reviewed after MVP 0 implementation. E2E testing to be added before MVP 1.
