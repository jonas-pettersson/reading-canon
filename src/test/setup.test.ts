import { describe, expect, it } from 'vitest'

describe('Test Infrastructure', () => {
  it('should run basic tests', () => {
    expect(true).toBe(true)
  })

  it('should have access to DOM APIs', () => {
    const element = document.createElement('div')
    expect(element).toBeDefined()
    expect(element.tagName).toBe('DIV')
  })
})
