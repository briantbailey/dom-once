import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: ['./src/dom-once.ts'],
    platform: 'neutral',
    dts: true,
    target: 'esnext',
  },
  {
    entry: ['./src/dom-once.ts'],
    format: 'iife',
    platform: 'browser',
    globalName: 'domOnce',
    minify: true,
    sourcemap: true,
    dts: false,
    target: 'es2015',
    outExtensions: () => ({ js: '.min.js' }),
  },
]);
