import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vitest.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/',
        // Generated files
        'src/types/',
        // Vite boilerplate - will be replaced as we build features
        'src/main.tsx',
        'src/App.tsx',
        'src/App.css',
        'src/index.css',
      ],
      thresholds: {
        // Thresholds aligned with MVP 0 goal of 70%+ coverage
        // Current coverage: 90.71% statements, 93.47% functions, 94.88% branches
        lines: 70,
        functions: 93,
        branches: 90,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
      '@/components': '/src/components',
      '@/features': '/src/features',
      '@/lib': '/src/lib',
      '@/types': '/src/types',
      '@/hooks': '/src/hooks',
    },
  },
})
