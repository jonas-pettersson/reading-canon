import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import { toHaveNoViolations } from 'jest-axe'
import { expect } from 'vitest'

// Add jest-axe matchers
expect.extend(toHaveNoViolations)

// Cleanup after each test
afterEach(() => {
  cleanup()
})
