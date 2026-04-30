import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    exclude: [
      '.worktrees/**',
      '**/node_modules/**',
      'e2e/**',
      'tests/**',
      'src/app/teacher/assignments/[id]/__tests__/page.test.tsx',
      'src/app/student/assignment/[linkId]/__tests__/page.test.tsx',
      'src/components/__tests__/ProfileForm.test.tsx',
      'src/components/__tests__/QuestionCard.test.tsx',
      'src/components/__tests__/StudentAssignmentForm.test.tsx',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        '.next/**',
        '.worktrees/**',
        'vitest.config.ts',
        'vitest.setup.ts',
        'tailwind.config.ts',
        '**/layout.tsx'
      ]
    }
  }
})
