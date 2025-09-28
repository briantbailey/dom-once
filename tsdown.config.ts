import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: ['./src/dom-once.ts'],
    platform: 'neutral',
    dts: true,
  },
]);
