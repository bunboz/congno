import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// IIFE + base './' để scripts/inline.mjs nhét JS vào một file HTML mở được bằng file://.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5173 },
  build: { rollupOptions: { output: { format: 'iife', inlineDynamicImports: true } } },
});
