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
        // Thresholds start at current coverage level during infrastructure phase
        // Will increase as we build features and UI components
        // Goal: 70%+ by MVP 0 completion
        lines: 50,
        functions: 100,
        branches: 0,
        statements: 50,
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
