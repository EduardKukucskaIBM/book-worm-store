import { describe, expect, it } from 'vitest'
import { getSafeRedirect } from './redirect'

describe('getSafeRedirect', () => {
  it('accepts same-origin paths', () => {
    expect(getSafeRedirect('/orders')).toBe('/orders')
    expect(getSafeRedirect('/books/b1?x=1')).toBe('/books/b1?x=1')
  })

  it('falls back for missing or unsafe values', () => {
    expect(getSafeRedirect(null)).toBe('/')
    expect(getSafeRedirect('')).toBe('/')
    expect(getSafeRedirect('https://evil.example')).toBe('/')
    expect(getSafeRedirect('//evil.example')).toBe('/')
    expect(getSafeRedirect('/\\evil.example')).toBe('/')
    expect(getSafeRedirect('orders', '/home')).toBe('/home')
  })
})
