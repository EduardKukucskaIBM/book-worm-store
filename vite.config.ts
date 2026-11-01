import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // Silence deprecation warnings from Carbon's internal Sass
        quietDeps: true,
        silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin'],
      },
    },
  },
})
