import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

/**
 * Integration test config for RLS / auth flows against a real (staging)
 * Supabase project. Requires:
 *   SUPABASE_TEST_URL
 *   SUPABASE_TEST_ANON_KEY
 *   SUPABASE_TEST_SERVICE_ROLE_KEY  (test cleanup only)
 * Run with: npm run test:rls
 */
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.rls.test.ts'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // RLS tests mutate shared state; run sequentially.
    fileParallelism: false,
  },
});
