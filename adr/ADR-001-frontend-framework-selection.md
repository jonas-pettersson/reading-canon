# ADR-001: Frontend Framework Selection

## Status

**ACCEPTED** - 2026-10-02

## Context

The Reading Canon application requires a frontend framework to implement the user interface specified in the requirements specification v1.4. The application has specific technical and non-technical requirements that influence this decision.

### Requirements Summary

**From Specification v1.4:**

**Functional Requirements:**
- Collection management: display, search, filter, sort books (FR-001 to FR-005)
- CRUD operations for curator: add, edit, remove books (FR-010 to FR-012)
- Personal reading management: forms for status, priority, ownership, notes, rating (FR-020 to FR-026)
- Statistics displays with counts and filters (FR-030 to FR-032)
- Multi-user authentication and role-based UI (FR-040 to FR-043) - MVP 1

**Non-Functional Requirements:**
- **NFR-001**: Book list load time < 2 seconds for 1000 books
- **NFR-002**: Search results < 1 second
- **NFR-043**: Type safety with compile-time type checking (Should Have)
- **NFR-011**: Modern browser support (desktop + mobile)
- **NFR-012**: Intuitive interface for non-technical users

**UX Requirements:**
- **UX-008**: Responsive design (desktop-first for curation, mobile-essential for reading workflows)
- **UX-011**: Mobile-optimized essential workflows on phone screens (≥375px width)
- **UX-006**: Keyboard navigation support
- **UX-007**: Screen reader accessibility (WCAG 2.1 AA)
- **UX-009**: Loading states and performance perception

**Context of Use:**
- **CU-001**: Desktop context for curator (forms, metadata entry, extended sessions)
- **CU-002**: Mobile context for readers (brief sessions, touch input, one-handed use)

### Project Context

- **Learning exercise**: AI-native SDLC, modern development practices (intent.md)
- **Single developer initially**: Curator is the primary developer
- **Long-term maintainability**: Well-documented, traceable code (NFR-040 to NFR-042)
- **MVP 0 scope**: Single user, collection management, personal reading tracking
- **MVP 1 scope**: Multi-user, authentication, role-based access

### Technical Considerations

1. **Forms and CRUD**: Extensive form handling for book metadata, personal data
2. **Interactive UI**: Real-time search, filtering, sorting
3. **Responsive layouts**: Desktop tables → mobile cards
4. **State management**: User session, reading status, filters
5. **Accessibility**: Semantic HTML, ARIA, keyboard navigation
6. **Performance**: Client-side filtering/sorting for < 1000 books

## Decision Drivers

1. **TypeScript Support**: Strong typing for maintainability (NFR-043)
2. **Learning Curve**: Reasonable learning curve for single developer
3. **Developer Experience**: Good tooling, documentation, error messages
4. **Component Ecosystem**: Form libraries, UI components, accessibility tools
5. **Performance**: Fast rendering, efficient updates for search/filter
6. **Responsive Design**: Easy to implement desktop + mobile layouts
7. **Accessibility**: Good a11y support and tooling
8. **Community & Longevity**: Active community, stable future
9. **Build Tooling**: Modern dev experience, fast builds
10. **Testing**: Good testing story for quality assurance

## Options Considered

### Option 1: React + TypeScript

**Description:** React with TypeScript, using Vite as build tool

**Pros:**
- ✅ Excellent TypeScript support (first-class)
- ✅ Huge ecosystem: forms (React Hook Form, Formik), UI libraries (Radix, Headless UI, shadcn/ui)
- ✅ Best-in-class developer tools and documentation
- ✅ Largest community, most Stack Overflow answers
- ✅ Most job-relevant skill (career value)
- ✅ Multiple CSS solutions (Tailwind, CSS Modules, styled-components)
- ✅ Excellent accessibility libraries (React Aria, Reach UI)
- ✅ Testing ecosystem mature (Testing Library, Vitest)
- ✅ Server-side rendering options if needed later (Next.js, Remix)

**Cons:**
- ❌ More complex than simpler frameworks (hooks, reconciliation)
- ❌ JSX learning curve for those unfamiliar
- ❌ Bundle size larger than some alternatives
- ❌ More boilerplate for forms/state management
- ❌ Requires understanding of hooks, effects, memoization for optimal performance

**Fit for Project:**
- Forms: ⭐⭐⭐⭐⭐ (Excellent - React Hook Form is best-in-class)
- Responsive: ⭐⭐⭐⭐⭐ (Excellent - CSS-in-JS or Tailwind work well)
- Performance: ⭐⭐⭐⭐ (Good - more than adequate for <1000 items)
- A11y: ⭐⭐⭐⭐⭐ (Excellent - React Aria, testing-library)
- Learning: ⭐⭐⭐ (Moderate - concepts take time but documentation is excellent)
- DX: ⭐⭐⭐⭐⭐ (Excellent - best tooling, error messages, IDE support)

**Estimated Setup Time:** 2-4 hours (Vite + React + TypeScript + basic structure)

---

### Option 2: Vue 3 + TypeScript (Composition API)

**Description:** Vue 3 with TypeScript, using Vite

**Pros:**
- ✅ Good TypeScript support (improved significantly in Vue 3)
- ✅ Gentler learning curve than React
- ✅ Single-file components (template + script + style) are intuitive
- ✅ Excellent official libraries (Vue Router, Pinia for state)
- ✅ Great documentation, official style guide
- ✅ Composition API similar to React hooks
- ✅ Good form libraries (VeeValidate, FormKit)
- ✅ Built-in directives for common patterns (v-if, v-for, v-model)

**Cons:**
- ❌ Smaller ecosystem than React (fewer UI component libraries)
- ❌ TypeScript support not as mature as React (some edge cases)
- ❌ Less Stack Overflow content
- ❌ Composition API vs Options API can be confusing initially
- ❌ Fewer accessibility-focused libraries

**Fit for Project:**
- Forms: ⭐⭐⭐⭐ (Good - v-model is elegant, VeeValidate is solid)
- Responsive: ⭐⭐⭐⭐⭐ (Excellent - Scoped CSS in SFCs works well)
- Performance: ⭐⭐⭐⭐⭐ (Excellent - faster than React in benchmarks)
- A11y: ⭐⭐⭐⭐ (Good - community plugins, but less tooling than React)
- Learning: ⭐⭐⭐⭐⭐ (Excellent - gentlest learning curve)
- DX: ⭐⭐⭐⭐ (Good - Volar extension for VS Code is excellent)

**Estimated Setup Time:** 2-3 hours (Vite + Vue + TypeScript + basic structure)

---

### Option 3: Svelte + TypeScript

**Description:** Svelte with TypeScript, using Vite or SvelteKit

**Pros:**
- ✅ Simplest mental model (no virtual DOM, reactive by default)
- ✅ Least boilerplate code (no hooks, no component lifecycle complexity)
- ✅ Excellent TypeScript support
- ✅ Smallest bundle sizes (compiles to vanilla JS)
- ✅ Best performance in benchmarks
- ✅ Two-way binding makes forms trivial
- ✅ Scoped styles by default
- ✅ Growing ecosystem and community
- ✅ Very pleasant developer experience

**Cons:**
- ❌ Smallest ecosystem (fewer component libraries, fewer form libraries)
- ❌ Less mature tooling compared to React/Vue
- ❌ Smaller community, less Stack Overflow content
- ❌ Fewer developers familiar with it (less common skill)
- ❌ Some TypeScript edge cases still being worked out
- ❌ Fewer accessibility libraries/resources

**Fit for Project:**
- Forms: ⭐⭐⭐⭐ (Good - built-in binding is great, but fewer form libraries)
- Responsive: ⭐⭐⭐⭐⭐ (Excellent - scoped CSS works well)
- Performance: ⭐⭐⭐⭐⭐ (Excellent - fastest option)
- A11y: ⭐⭐⭐ (Adequate - less tooling, manual implementation)
- Learning: ⭐⭐⭐⭐⭐ (Excellent - simplest to learn)
- DX: ⭐⭐⭐⭐ (Good - pleasant but less mature tooling)

**Estimated Setup Time:** 2-3 hours (Vite + Svelte + TypeScript + basic structure)

---

### Option 4: Solid + TypeScript

**Description:** SolidJS with TypeScript, using Vite

**Pros:**
- ✅ React-like API (JSX, components) but with fine-grained reactivity
- ✅ Excellent performance (faster than React)
- ✅ First-class TypeScript support
- ✅ No virtual DOM overhead
- ✅ Small bundle sizes
- ✅ Good documentation
- ✅ Growing ecosystem

**Cons:**
- ❌ Very small ecosystem (limited component libraries)
- ❌ Small community, minimal Stack Overflow content
- ❌ Newer framework, less battle-tested
- ❌ Fewer learning resources
- ❌ Almost no pre-built UI component libraries
- ❌ Minimal accessibility tooling

**Fit for Project:**
- Forms: ⭐⭐⭐ (Adequate - manual implementation mostly)
- Responsive: ⭐⭐⭐⭐ (Good - standard CSS approaches work)
- Performance: ⭐⭐⭐⭐⭐ (Excellent - best performance)
- A11y: ⭐⭐⭐ (Adequate - manual implementation)
- Learning: ⭐⭐⭐⭐ (Good - similar to React but different reactivity model)
- DX: ⭐⭐⭐⭐ (Good - pleasant but limited tooling)

**Estimated Setup Time:** 2-4 hours (Vite + Solid + TypeScript + basic structure)

---

### Option 5: Plain TypeScript (No Framework)

**Description:** Vanilla TypeScript with Vite, no framework

**Pros:**
- ✅ No framework lock-in, maximum control
- ✅ Smallest possible bundle size
- ✅ No framework concepts to learn (just DOM APIs)
- ✅ Best performance (no framework overhead)
- ✅ TypeScript support is direct

**Cons:**
- ❌ Manual DOM manipulation is tedious and error-prone
- ❌ No component model (must build from scratch)
- ❌ Forms require manual state management
- ❌ Routing requires manual implementation or library
- ❌ State management entirely manual
- ❌ High development time for features
- ❌ Accessibility requires manual ARIA implementation
- ❌ Code reuse requires custom patterns

**Fit for Project:**
- Forms: ⭐⭐ (Poor - very tedious manual implementation)
- Responsive: ⭐⭐⭐⭐ (Good - standard CSS works)
- Performance: ⭐⭐⭐⭐⭐ (Excellent - no framework overhead)
- A11y: ⭐⭐ (Poor - all manual, error-prone)
- Learning: ⭐⭐⭐ (Moderate - DOM APIs have quirks)
- DX: ⭐⭐ (Poor - no component model, verbose)

**Estimated Setup Time:** 1 hour (Vite + TypeScript), but much higher development time for features

---

## Decision Matrix

| Criteria (Weight)           | React | Vue | Svelte | Solid | Vanilla |
|-----------------------------|-------|-----|--------|-------|---------|
| TypeScript Support (10)     | 10    | 8   | 9      | 10    | 10      |
| Learning Curve (8)          | 6     | 9   | 10     | 7     | 6       |
| Developer Experience (9)    | 10    | 8   | 8      | 7     | 4       |
| Component Ecosystem (9)     | 10    | 7   | 5      | 3     | 1       |
| Performance (7)             | 8     | 9   | 10     | 10    | 10      |
| Responsive Design (8)       | 10    | 10  | 10     | 8     | 8       |
| Accessibility (8)           | 10    | 8   | 6      | 6     | 4       |
| Community/Docs (7)          | 10    | 8   | 6      | 4     | 8       |
| Build Tooling (6)           | 9     | 9   | 8      | 8     | 9       |
| Testing (6)                 | 10    | 8   | 7      | 6     | 6       |
| **Weighted Total**          | **656**| **590**| **562**| **476**| **432**|

### Scoring Notes:
- React scores highest due to ecosystem maturity, accessibility tooling, and comprehensive documentation
- Vue is competitive with better learning curve but slightly smaller ecosystem
- Svelte excels in simplicity and performance but lacks ecosystem depth
- Solid is promising but too new for this project's needs
- Vanilla is not practical for the extensive UI requirements

## Decision

**PROPOSED: React + TypeScript with Vite**

### Rationale

React with TypeScript is the recommended choice for the Reading Canon application because:

1. **Best Ecosystem Fit**: The extensive form requirements (book metadata, personal data) benefit significantly from React Hook Form and established validation libraries. The project needs robust form handling more than absolute simplicity.

2. **Accessibility First-Class**: React has the best accessibility tooling (React Aria, testing-library's accessibility queries, axe-core integration). Meeting WCAG 2.1 AA (UX-007) is significantly easier with these tools.

3. **Component Library Options**: Multiple high-quality, accessible component libraries (Radix UI, Headless UI, shadcn/ui) provide dropdown menus, modals, form controls that meet accessibility requirements out of the box.

4. **Type Safety**: First-class TypeScript support satisfies NFR-043 and improves maintainability for long-term project.

5. **Learning Value**: As a learning exercise, React is the most transferable skill and has the best documentation/resources for learning modern frontend development patterns.

6. **Future-Proofing**: If server-side rendering or more complex features are needed post-MVP, migration to Next.js or Remix is straightforward.

7. **Testing Story**: React Testing Library with Vitest provides excellent testing infrastructure for ensuring quality.

### Trade-offs Accepted

- **Complexity over Simplicity**: React is more complex than Svelte or Vue, but the ecosystem benefits outweigh the learning curve for this project's specific needs.
- **Bundle Size**: Larger bundle than Svelte/Solid, but well within performance requirements (< 2s load time for MVP).
- **Boilerplate**: More code than Svelte, but structure aids maintainability.

## Consequences

### Positive

- Strong type safety with TypeScript integration
- Large ecosystem of form, UI, and accessibility libraries
- Excellent developer tools (React DevTools, VS Code extensions)
- Best documentation and community resources for learning
- Well-established patterns for common problems (forms, routing, state)
- Career-relevant skill development
- Future flexibility (SSR, RSC, framework upgrades)

### Negative

- Steeper learning curve than simpler alternatives
- More boilerplate code for basic features
- Larger bundle size than compiled frameworks
- Need to choose and integrate additional libraries (form handling, UI components, state management)
- Hook rules and optimization patterns require understanding

### Neutral

- Need to decide on additional libraries:
  - Form handling: React Hook Form (recommended)
  - UI components: Radix UI + Tailwind (recommended) or shadcn/ui
  - Routing: React Router (when needed)
  - State management: React Context + hooks (MVP), potentially Zustand/Jotai later
- Testing: Vitest + React Testing Library

## Implementation Notes

### Recommended Tech Stack

```
Frontend Stack:
├── React 18+ (with TypeScript)
├── Vite (build tool)
├── React Hook Form (forms + validation)
├── Radix UI (accessible primitives)
├── Tailwind CSS (styling)
├── React Router (routing - MVP 1+)
└── Vitest + React Testing Library (testing)
```

### Initial Setup Steps

1. Create Vite project with React + TypeScript template
2. Configure TypeScript strict mode (for NFR-043)
3. Add React Hook Form for form handling
4. Set up Radix UI + Tailwind for accessible components
5. Configure ESLint with a11y plugin (eslint-plugin-jsx-a11y)
6. Set up Vitest + React Testing Library
7. Create basic project structure (routes, components, hooks, utils)

### Key Architectural Decisions Enabled

- **ADR-002**: Backend can be chosen independently (REST API or GraphQL)
- **ADR-004**: Authentication can use any approach (JWT, session, OAuth)
- **ADR-007**: Testing strategy can leverage React Testing Library

## References

- [Requirements Specification v1.4](../artifacts/spec.md)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vite Documentation](https://vitejs.dev/)
- [React Hook Form](https://react-hook-form.com/)
- [Radix UI](https://www.radix-ui.com/)
- [React Aria](https://react-spectrum.adobe.com/react-aria/)

## Decision Date

2026-10-02

## Decision Makers

- Jonas Pettersson (Curator/Developer)
- Claude Sonnet 4.5 (AI Assistant)

## Review Date

To be reviewed after MVP 0 implementation or if significant technical blockers are encountered.
