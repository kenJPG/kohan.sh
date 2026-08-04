import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Rollup >= 4.60 misclassifies the injected modulepreload polyfill import
    // as a source-phase import and fails the build. Every browser that
    // supports ES modules also supports modulepreload natively, so the
    // polyfill is unnecessary — skip the injection.
    modulePreload: { polyfill: false },
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
})
