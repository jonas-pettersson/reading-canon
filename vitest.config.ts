import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vitest.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: ['node_modules', 'dist', 'tests/**'], // Exclude Playwright tests
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
        // Thresholds aligned with ADR-007 Testing Strategy:
        // - Components: 70-80% coverage (most of our codebase)
        // - Utility functions: 90%+ coverage
        // - Overall: >70% coverage
        // Philosophy: "Confidence over coverage" - guidance, not absolute gates
        lines: 70,
        functions: 80,  // Components (70-80%), not utilities (90%+)
        branches: 80,   // Aligned with component target
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
