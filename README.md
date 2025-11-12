# @briantbailey/dom-once

[![npm version](https://img.shields.io/npm/v/@briantbailey/dom-once.svg)](https://www.npmjs.com/package/@briantbailey/dom-once)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@briantbailey/dom-once)](https://bundlephobia.com/package/@briantbailey/dom-once)
[![JSR](https://jsr.io/badges/@briantbailey/dom-once)](https://jsr.io/@briantbailey/dom-once)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Simple utilities to select and manipulate DOM elements only once.

Run your DOM initialization code safely, even when called multiple times. Ideal for SPAs, HTMX, and dynamic content.

```ts
// Initialize buttons only once, even if called multiple times
doOnce('btn-init', '.btn', (btn) => btn.classList.add('ready'));
```

> Status: API stable, pre-1.0. The public API is finalized and will not change before 1.0.

## How It Works

Tracks processed elements using a data attribute (default: `data-dom-once`) with space-delimited tokens:

```html
<button data-dom-once="btn-init tooltip analytics">Click me</button>
```

Each once id marks that a specific operation has been performed, preventing duplicate initialization even when your code runs multiple times.

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
