import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: ['./src/dom-once.ts'],
    platform: 'neutral',
    dts: true,
  },
  {
    entry: ['./src/dom-once.ts'],
    format: 'iife',
    platform: 'browser',
    globalName: 'domOnce',
    minify: true,
    dts: false,
    outExtensions: () => ({ js: '.min.js' }),
  },
]);
