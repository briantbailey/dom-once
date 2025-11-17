# @briantbailey/dom-once

[![npm version](https://img.shields.io/npm/v/@briantbailey/dom-once.svg)](https://www.npmjs.com/package/@briantbailey/dom-once)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@briantbailey/dom-once)](https://bundlephobia.com/package/@briantbailey/dom-once)
[![JSR](https://jsr.io/badges/@briantbailey/dom-once)](https://jsr.io/@briantbailey/dom-once)
[![TypeScript](https://img.shields.io/badge/TypeScript-source-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Types](https://img.shields.io/npm/types/@briantbailey/dom-once)](https://www.npmjs.com/package/@briantbailey/dom-once)
[![ESM Only](https://img.shields.io/badge/ESM-only-3178c6?logo=javascript&logoColor=white)](https://nodejs.org/api/esm.html)
[![Tree Shakeable](https://img.shields.io/badge/tree-shakeable-success?logo=webpack)](https://webpack.js.org/guides/tree-shaking/)
[![CI](https://github.com/briantbailey/dom-once/workflows/CI/badge.svg)](https://github.com/briantbailey/dom-once/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Simple utilities to select and manipulate DOM elements only once.

Run your DOM initialization code safely, even when called multiple times. Ideal for SPAs and dynamic DOM updates. Framework-agnostic; safe after re-renders or partial updates.

```ts
// Initialize buttons only once, even if called multiple times
doOnce('btn-init', '.btn', (btn) => btn.classList.add('ready'));
```

>Status: API stable, pre-1.0. The public API is finalized and will not change before 1.0.

## Features

- **Zero dependencies** — Pure DOM utilities, no external libraries
- **Enforces idempotent initialization** — Prevents re-execution on already-processed elements
- **Flexible selectors** — Works with CSS strings, Elements, NodeLists, or arrays
- **Customizable tracking** — Use any data attribute name
- **Framework-agnostic** — Pure JavaScript, works anywhere the DOM exists
- **Full TypeScript support** — Complete type definitions included
- **Tree-shakeable ESM** — Modern bundlers can eliminate unused code
- **Tiny footprint** — [Check current bundle size](https://bundlephobia.com/package/@briantbailey/dom-once)

## How It Works

Tracks processed elements using a data attribute (default: `data-dom-once`) with space-delimited tokens:

```html
<button data-dom-once="btn-init tooltip analytics">Click me</button>
```

Each once id marks that a specific operation has been performed, preventing duplicate initialization even when your code runs multiple times.

**OnceId Rules:**
- Valid characters: letters, numbers, underscores (`_`), and hyphens (`-`)
- Examples: `btn-init`, `tooltip_setup`, `v2`
- Avoid spaces (tokens are space-delimited)
- Case-sensitive: `myId` and `myid` are different

## Installation

### Package Managers

**npm / pnpm / yarn:**

```bash
npm install @briantbailey/dom-once
```

**JSR (Node or Deno):**

```bash
npx jsr add @briantbailey/dom-once
# or
deno add @briantbailey/dom-once
```

### CDN

**esm.sh:**

Import directly as ESM in browsers or Deno:

```
https://esm.sh/@briantbailey/dom-once
```

**unpkg:**

Access package files directly:

```
https://unpkg.com/@briantbailey/dom-once@latest/dist/dom-once.js          (ESM)
https://unpkg.com/@briantbailey/dom-once@latest/dist/dom-once.iife.min.js (IIFE)
```

**GitHub Releases:**

Download the IIFE bundle directly from [releases](https://github.com/briantbailey/dom-once/releases).

## Usage

### Node / Deno (ESM)

```ts
import { doOnce, querySelectorOnce, removeOnce, findOnce, version } from '@briantbailey/dom-once';

doOnce('btn-init', '.btn', (btn) => {
  btn.classList.add('initialized');
});
```

Note: This package is ESM-only. Use `import` in Node and bundlers; `require()` is not supported.

### Browser (ESM via CDN)

**Static import:**

```html
<script type="module">
  import { doOnce } from 'https://esm.sh/@briantbailey/dom-once';
  
  doOnce('btn-init', '.btn', (btn) => btn.classList.add('ready'));
</script>
```

**Dynamic import:**

```html
<script>
  import('https://esm.sh/@briantbailey/dom-once')
    .then(({ doOnce }) => {
      doOnce('btn-init', '.btn', (btn) => btn.classList.add('ready'));
    });
</script>
```

### Browser (IIFE)

The IIFE bundle exposes everything on the global `domOnce` object:

```html
<script src="https://unpkg.com/@briantbailey/dom-once@latest/dist/dom-once.iife.min.js"></script>
<script>
  const { doOnce, querySelectorOnce, removeOnce, findOnce, version } = window.domOnce;
  
  doOnce('btn-init', '.btn', (btn) => btn.classList.add('ready'));
</script>
```

## API

### querySelectorOnce(onceId, selector[, options]) → Element[]

Queries for elements using a CSS selector and marks them with a once id.

- `onceId`: `string` — Unique identifier (alphanumeric, underscore, hyphen)
- `selector`: `string` — CSS selector string
- `options`: `object` (optional)
  - `onceAttribute`: `string` — Data attribute name (default: `'data-dom-once'`)
  - `context`: `Document | DocumentFragment | Element` — Query context (default: `document`)
- **Returns**: `Element[]` — Elements newly marked with the once id

---

### doOnce(onceId, selector, callback[, options]) → Element[]

Executes a callback once per element, marking elements to prevent re-execution.

- `onceId`: `string` — Unique identifier
- `selector`: `string | Element | Iterable<Element> | ArrayLike<Element>` — Elements to process
- `callback`: `(element: Element) => void` — Function to execute on each unmarked element
- `options`: `object` (optional)
  - `onceAttribute`: `string` — Data attribute name (default: `'data-dom-once'`)
  - `context`: `Document | DocumentFragment | Element` — Query context (default: `document`)
- **Returns**: `Element[]` — Elements that were processed

---

### removeOnce(onceId, selector[, options]) → Element[]

Removes a once id from elements.

- `onceId`: `string` — Unique identifier to remove
- `selector`: `string | Element | Iterable<Element> | ArrayLike<Element>` — Elements to process
- `options`: `object` (optional)
  - `onceAttribute`: `string` — Data attribute name (default: `'data-dom-once'`)
  - `context`: `Document | DocumentFragment | Element` — Query context (default: `document`)
- **Returns**: `Element[]` — Elements that had the once id removed

---

### findOnce(onceId[, options]) → Element[]

Finds all elements marked with a specific once id (read-only).

- `onceId`: `string` — Unique identifier to search for
- `options`: `object` (optional)
  - `onceAttribute`: `string` — Data attribute name (default: `'data-dom-once'`)
  - `context`: `Document | DocumentFragment | Element` — Search context (default: `document`)
- **Returns**: `Element[]` — Elements marked with the once id

---

### version

`string` — Library version (e.g., "1.0.0")

## Development

This project uses **pnpm** for package management.

```bash
pnpm install          # Install dependencies
pnpm run check        # Lint, typecheck, and test
pnpm run build        # Build for production
pnpm run test         # Run tests
```

## License

MIT © 2025 [Brian T. Bailey](https://github.com/briantbailey)
