# @briantbailey/dom-once

Simple utilities to select and manipulate DOM elements only once.

> Status: Work in progress. The 0.x series may include breaking changes as the API settles.

## Install

Node (ESM):

```bash
pnpm add @briantbailey/dom-once
# or
npm install @briantbailey/dom-once
# or
yarn add @briantbailey/dom-once
```

Import:

```ts
import { doOnce, querySelectorOnce, removeOnce, findOnce, version } from '@briantbailey/dom-once';
```

Browser (IIFE):

The IIFE exports everything on the global `domOnce` object.

```html
<script src="/path/to/dom-once.iife.min.js"></script>
<script>
  const { doOnce, querySelectorOnce, removeOnce, findOnce, version } = window.domOnce;
  
  doOnce('init', '.btn', (btn) => btn.classList.add('ready'));
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

### doOnce(onceId, selector, callback[, options]) → Element[]

Executes a callback once per element, marking elements to prevent re-execution.

- `onceId`: `string` — Unique identifier
- `selector`: `string | Element | Iterable<Element> | ArrayLike<Element>` — Elements to process
  - `callback`: `(element: Element) => void` — Function to execute on each unmarked element
- `options`: `object` (optional)
  - `onceAttribute`: `string` — Data attribute name (default: `'data-dom-once'`)
  - `context`: `Document | DocumentFragment | Element` — Query context (default: `document`)
- **Returns**: `Element[]` — Elements that were processed

### removeOnce(onceId, selector[, options]) → Element[]

Removes a once id from elements.

- `onceId`: `string` — Unique identifier to remove
- `selector`: `string | Element | Iterable<Element> | ArrayLike<Element>` — Elements to process
- `options`: `object` (optional)
  - `onceAttribute`: `string` — Data attribute name (default: `'data-dom-once'`)
  - `context`: `Document | DocumentFragment | Element` — Query context (default: `document`)
- **Returns**: `Element[]` — Elements that had the once id removed

### findOnce(onceId[, options]) → Element[]

Finds all elements marked with a specific once id (read-only).

- `onceId`: `string` — Unique identifier to search for
- `options`: `object` (optional)
  - `onceAttribute`: `string` — Data attribute name (default: `'data-dom-once'`)
  - `context`: `Document | DocumentFragment | Element` — Search context (default: `document`)
- **Returns**: `Element[]` — Elements marked with the once id

### version

`string` — Library version (e.g., "1.0.0")

## Development

- Install dependencies:

```bash
pnpm install
```

- Run the unit tests:

```bash
pnpm run test
```

- Build the library:

```bash
pnpm run build
```

## License

MIT © 2025 [Brian T. Bailey](https://github.com/briantbailey)
