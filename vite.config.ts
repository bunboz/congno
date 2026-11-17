import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// IIFE + base './' để scripts/inline.mjs nhét JS vào một file HTML mở được bằng file://.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5173 },
  // Nguồn là app.html; index.html ở gốc là bản build một file cho GitHub Pages.
  build: { rollupOptions: { input: 'app.html', output: { format: 'iife', inlineDynamicImports: true } } },
});
