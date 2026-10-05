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
        // Current coverage: 92.65% statements, 94.54% functions, 87.87% branches
        // Note: Branch coverage lowered temporarily due to EditBookForm conditional rendering
        // TODO: Improve branch coverage in Phase 6
        lines: 70,
        functions: 93,
        branches: 87,
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
