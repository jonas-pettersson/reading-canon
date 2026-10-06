import { describe, it, expect } from 'vitest'
import { getLanguageDisplayName } from './constants'

describe('getLanguageDisplayName', () => {
  it('should return display names for known languages', () => {
    expect(getLanguageDisplayName('EN')).toBe('English')
    expect(getLanguageDisplayName('DE')).toBe('German')
    expect(getLanguageDisplayName('FR')).toBe('French')
    expect(getLanguageDisplayName('SV')).toBe('Swedish')
    expect(getLanguageDisplayName('LA')).toBe('Latin')
  })

  it('should return the code itself for unknown/exotic languages', () => {
    expect(getLanguageDisplayName('XYZ')).toBe('XYZ')
    expect(getLanguageDisplayName('QQ')).toBe('QQ')
    expect(getLanguageDisplayName('EXOTIC')).toBe('EXOTIC')
  })

  it('should handle non-standard codes in the database', () => {
    // These are non-standard codes that exist in the database
    expect(getLanguageDisplayName('GR')).toBe('Greek') // Should be EL
    expect(getLanguageDisplayName('TU')).toBe('Turkish') // Should be TR
    expect(getLanguageDisplayName('DK')).toBe('Danish') // Should be DA
  })
})
