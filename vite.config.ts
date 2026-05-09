import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      include: ['src/**/*'],
      outDir: 'dist',
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        cli: resolve(__dirname, 'src/cli.ts'),
      },
      formats: ['es'],
      fileName: (format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: [
        'child_process',
        'fs',
        'fs/promises',
        'module',
        'path',
        'readline',
        'util',
        'chalk',
        'commander',
        /^node:/,
      ],
      output: {
        preserveModules: false,
        banner: (chunk) => {
          if (chunk.name === 'cli') {
            return '#!/usr/bin/env node\n';
          }
          return '';
        },
      },
    },
    target: 'node18',
    minify: false,
    sourcemap: true,
    ssr: true,
  },
});
