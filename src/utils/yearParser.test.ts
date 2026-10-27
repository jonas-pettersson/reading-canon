import { describe, it, expect } from 'vitest'
import { parseYearSort } from './yearParser'

describe('parseYearSort', () => {
  it('parses simple 4-digit years', () => {
    expect(parseYearSort('1984')).toBe(1984)
    expect(parseYearSort('2020')).toBe(2020)
    expect(parseYearSort('1850')).toBe(1850)
  })

  it('parses years with "circa" prefix', () => {
    expect(parseYearSort('c. 1850')).toBe(1850)
    expect(parseYearSort('c.1850')).toBe(1850)
    expect(parseYearSort('ca. 1800')).toBe(1800)
  })

  it('parses year ranges by taking the first year', () => {
    expect(parseYearSort('1850-1860')).toBe(1850)
    expect(parseYearSort('1920-21')).toBe(1920)
  })

  it('parses BCE/BC years as negative numbers', () => {
    expect(parseYearSort('800 BCE')).toBe(-800)
    expect(parseYearSort('750 BC')).toBe(-750)
    expect(parseYearSort('44 BCE')).toBe(-44)
    expect(parseYearSort('BCE 800')).toBe(-800)
  })

  it('handles short years (1-3 digits)', () => {
    expect(parseYearSort('44')).toBe(44)
    expect(parseYearSort('100')).toBe(100)
    expect(parseYearSort('8')).toBe(8)
  })

  it('returns null for empty or invalid input', () => {
    expect(parseYearSort('')).toBeNull()
    expect(parseYearSort('  ')).toBeNull()
    expect(parseYearSort(null)).toBeNull()
    expect(parseYearSort(undefined)).toBeNull()
    expect(parseYearSort('Unknown')).toBeNull()
    expect(parseYearSort('No date')).toBeNull()
  })

  it('handles whitespace', () => {
    expect(parseYearSort('  1984  ')).toBe(1984)
    expect(parseYearSort('  800 BCE  ')).toBe(-800)
  })

  it('extracts year from text with additional content', () => {
    expect(parseYearSort('Published in 1984')).toBe(1984)
    expect(parseYearSort('Between 1850 and 1860')).toBe(1850)
  })
})
