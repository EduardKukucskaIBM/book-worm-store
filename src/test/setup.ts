import '@testing-library/jest-dom'
import { preloadRoutes } from '../router/lazyPages'

await preloadRoutes()

if (typeof window !== 'undefined' && !window.ResizeObserver) {
  const MockResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = MockResizeObserver as unknown as typeof window.ResizeObserver
  globalThis.ResizeObserver = MockResizeObserver as unknown as typeof globalThis.ResizeObserver
}

if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}
