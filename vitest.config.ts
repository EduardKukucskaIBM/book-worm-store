import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    // Form tests type key by key; the 5 s default is too tight when all files run in parallel
    testTimeout: 20000,
    hookTimeout: 20000,
    setupFiles: ['./src/test/setup.ts'],
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
  },
})
