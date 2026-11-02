import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

// Routes are lazy-loaded (React.lazy); the first render of a route has to import its chunk,
// which can take longer than the 1 s default when the whole suite runs in parallel.
configure({ asyncUtilTimeout: 10000 })

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
