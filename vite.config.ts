import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/main.ts'),
      output: {
        format: 'es',
        entryFileNames: 'bundle.js'
      }
    }
  }
});
