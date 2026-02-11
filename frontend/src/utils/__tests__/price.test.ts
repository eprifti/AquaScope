/**
 * Tests for price parsing and formatting utilities
 */
import { describe, it, expect } from 'vitest'
import { parsePrice, formatPrice } from '../price'

describe('parsePrice', () => {
  it('parses USD price with symbol', () => {
    expect(parsePrice('$249.99')).toBe(249.99)
  })

  it('parses EUR price with symbol', () => {
    expect(parsePrice('€120')).toBe(120)
  })

  it('parses EUR price with decimals', () => {
    expect(parsePrice('€29.95')).toBe(29.95)
  })

  it('parses American thousands format', () => {
    expect(parsePrice('1,250.00')).toBe(1250)
  })

  it('parses European thousands format', () => {
    expect(parsePrice('1.250,00')).toBe(1250)
  })

  it('parses European decimal only', () => {
    expect(parsePrice('250,50')).toBe(250.5)
  })

  it('returns null for null input', () => {
    expect(parsePrice(null)).toBeNull()
  })

  it('returns null for undefined input', () => {
    expect(parsePrice(undefined)).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(parsePrice('')).toBeNull()
  })

  it('returns null for non-numeric string', () => {
    expect(parsePrice('free')).toBeNull()
  })

  it('parses integer price', () => {
    expect(parsePrice('400')).toBe(400)
  })

  it('parses price with spaces and symbols', () => {
    expect(parsePrice('  €29.95  ')).toBe(29.95)
  })

  it('parses GBP price', () => {
    expect(parsePrice('£100.50')).toBe(100.5)
  })
})

describe('formatPrice', () => {
  it('formats EUR price by default', () => {
    const result = formatPrice(100)
    // Should contain 100 and some EUR formatting
    expect(result).toContain('100')
  })

  it('formats USD price when specified', () => {
    const result = formatPrice(249.99, 'USD')
    expect(result).toContain('249')
  })

  it('formats zero', () => {
    const result = formatPrice(0)
    expect(result).toContain('0')
  })

  it('formats large numbers', () => {
    const result = formatPrice(1250.50)
    expect(result).toContain('250')
  })

  it('handles invalid currency gracefully', () => {
    // Should not throw
    const result = formatPrice(100, 'INVALID')
    expect(result).toContain('100')
  })
})
