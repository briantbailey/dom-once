/**
 * dom-once — Simple utilities to manipulate DOM elements only once.
 *
 * Public API:
 * - querySelectorOnce: query and mark elements with a once id
 * - doOnce: run a callback once per element
 * - removeOnce: remove a once id from elements
 * - findOnce: find elements marked with a once id
 * - version: current library version
 *
 * @file src/dom-once.ts
 * @package dom-once
 * @author Brian T. Bailey
 * @license MIT
 * @see https://github.com/briantbailey/dom-once
 */

// =============================================================================
// TYPES — 🧩
// =============================================================================
// #region TYPES
// PUBLIC
/**
 * Data attribute must start with "data-" and can contain alphanumeric characters, underscores, and hyphens.
 */
export type DataAttribute = `data-${string}`;

/**
 * Once ID must be alphanumeric and can contain underscores and hyphens.
 */
export type OnceId = string;

// PRIVATE
// #endregion TYPES

// =============================================================================
// CONSTANTS — 📌
// =============================================================================
// #region CONSTANTS
// PUBLIC
export { version } from './version';

// PRIVATE
/**
 * Name of the HTML attribute containing an element's once ids.
 */
const ONCE_ATTRIBUTE_NAME: DataAttribute = 'data-dom-once';

/**
 * Regular expression to match whitespace.
 */
const WHITESPACE_PATTERN: RegExp = /\s+/;

/**
 * Regular expression to match a valid once id.
 *
 * Once ids must be alphanumeric and can contain underscores and hyphens.
 */
const ONCE_ID_PATTERN: RegExp = /^[a-zA-Z0-9_-]+$/;

/**
 * Regular expression to match a valid data attribute.
 *
 * Data attributes must start with "data-" and can contain alphanumeric characters, underscores, and hyphens.
 */
const DATA_ATTRIBUTE_PATTERN: RegExp = /^data-[a-z0-9.:-]+$/;
// #endregion CONSTANTS

// =============================================================================
// PRIVATE_HELPERS — 🔒
// =============================================================================
// #region PRIVATE_HELPERS
/**
 * Assertion function to validate that a string is a valid data attribute.
 * Throws an error if the string doesn't match the data attribute pattern.
 */
function assertDataAttribute(value: string): asserts value is DataAttribute {
  if (!DATA_ATTRIBUTE_PATTERN.test(value)) {
    throw new Error(
      `Invalid data attribute: "${value}". Must match pattern: /^data-[a-z0-9.:-]+$/`,
    );
  }
}

/**
 * Assertion function to validate that a string is a valid once ID.
 * Throws an error if the string doesn't match the once ID pattern.
 */
function assertOnceId(value: string): asserts value is OnceId {
  if (value == null || value === '') {
    throw new Error('Once ID cannot be null, undefined, or empty');
  }
  if (!ONCE_ID_PATTERN.test(value)) {
    throw new Error(
      `Invalid once ID: "${value}". Must contain only letters, numbers, underscores, and hyphens`,
    );
  }
}

/**
 * Assertion function to validate that a selector is one of the accepted types:
 * string, Element, Iterable<Element>, or ArrayLike<Element>.
 * Throws a TypeError if the selector doesn't match any of these types.
 */
function assertValidSelectorTypes(
  selector: unknown,
): asserts selector is
  | string
  | Element
  | Iterable<Element>
  | ArrayLike<Element> {
  if (
    typeof selector !== 'string' &&
    !(selector instanceof Element) &&
    !isIterable(selector) &&
    !isArrayLike(selector)
  ) {
    throw new TypeError(
      'selector must be a string, an Element, an Iterable<Element>, or an array-like collection',
    );
  }
}

/**
 * Assertion function to validate that a context is a valid query context.
 * Throws a TypeError if the context is not a Document, DocumentFragment, or Element.
 */
function assertValidContext(
  context: unknown,
): asserts context is Document | DocumentFragment | Element {
  if (
    !context ||
    typeof context !== 'object' ||
    !('querySelectorAll' in context) ||
    typeof context.querySelectorAll !== 'function'
  ) {
    throw new TypeError(
      'context must be a Document, DocumentFragment, or Element',
    );
  }
}

/**
 * Adds a once ID to an element's data attribute value.
 * If the ID already exists, no changes are made.
 */
function addOnceAttributeValue(
  element: Element,
  onceId: string,
  onceAttribute: DataAttribute,
): void {
  const value = element.getAttribute(onceAttribute);
  const ids = value
    ? value
        .trim()
        .split(WHITESPACE_PATTERN)
        .filter((s) => s.length > 0)
    : [];
  if (ids.includes(onceId)) return;
  ids.push(onceId);
  element.setAttribute(onceAttribute, ids.join(' '));
}

/**
 * Removes a once ID from an element's data attribute value.
 * If the ID does not exist, no changes are made.
 */
function removeOnceAttributeValue(
  element: Element,
  onceId: string,
  onceAttribute: DataAttribute,
): void {
  const value = element.getAttribute(onceAttribute);
  if (!value) return;

  const onceIdList = value
    .trim()
    .split(WHITESPACE_PATTERN)
    .filter((s) => s.length > 0);
  const filtered = onceIdList.filter((id) => id !== onceId);

  if (filtered.length === 0) {
    element.removeAttribute(onceAttribute);
  } else {
    element.setAttribute(onceAttribute, filtered.join(' '));
  }
}

/**
 * Checks if the element has the once attribute value.
 */
function hasOnceAttributeValue(
  element: Element,
  onceId: string,
  onceAttribute: DataAttribute,
): boolean {
  const value = element.getAttribute(onceAttribute);
  if (!value) return false;

  // Use CSS selector matching for better performance
  return element.matches(`[${onceAttribute}~="${onceId}"]`);
}

/**
 * Checks if a value is iterable.
 */
function isIterable(value: unknown): value is Iterable<unknown> {
  if (typeof Symbol === 'undefined' || typeof Symbol.iterator === 'undefined') {
    return false;
  }

  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as { [Symbol.iterator]?: unknown })[Symbol.iterator] ===
      'function'
  );
}

/**
 * Checks if a value is array-like.
 */
function isArrayLike(value: unknown): value is ArrayLike<unknown> {
  if (value === null || typeof value !== 'object') return false;
  const maybe = value as { length?: unknown };
  const len = maybe.length;
  return (
    typeof len === 'number' &&
    Number.isFinite(len) &&
    len >= 0 &&
    Math.floor(len) === len
  );
}
// #endregion PRIVATE_HELPERS

// =============================================================================
// PUBLIC_API — 🌐
// =============================================================================
// #region PUBLIC_API
/**
 * Queries for elements using a CSS selector and marks them with a once id.
 *
 * Accepted selector types:
 * - string: a CSS selector (queried with `context.querySelectorAll`)
 *
 * Behavior:
 * - Only returns elements that don't already have the once id.
 * - Adds the once id to each returned element's data attribute.
 * - Multiple once ids can be added to the same element (space-separated).
 * - Empty selector string returns empty array (consistent with querySelectorAll).
 * - Throws TypeError if selector is not a string.
 * - Throws TypeError if context is invalid.
 *
 * Returns: an array of Elements that were newly marked with the once id.
 */
export function querySelectorOnce<T extends Element>(
  onceId: OnceId,
  selector: string,
  options: {
    onceAttribute?: DataAttribute;
    context?: Document | DocumentFragment | Element;
  } = {},
): T[] {
  const { onceAttribute = ONCE_ATTRIBUTE_NAME, context = document } = options;

  assertOnceId(onceId);
  assertDataAttribute(onceAttribute);

  if (typeof selector !== 'string') {
    throw new TypeError('selector must be a string');
  }

  // If selector is empty, return empty array (consistent with CSS querySelectorAll behavior)
  if (selector === '') {
    return [];
  }

  assertValidContext(context);

  const elements: T[] = [];
  const queryResults = context.querySelectorAll<T>(selector);

  for (let i = 0; i < queryResults.length; i++) {
    const element = queryResults[i];
    if (!hasOnceAttributeValue(element, onceId, onceAttribute)) {
      addOnceAttributeValue(element, onceId, onceAttribute);
      elements.push(element);
    }
  }

  return elements;
}

/**
 * Removes a once id from elements.
 *
 * Accepted selector types:
 * - string: a CSS selector (queried with `context.querySelectorAll`)
 * - Element: a single element
 * - Iterable<Element>: any iterable of Elements (NodeList, generator, etc.)
 * - ArrayLike<Element>: array-like collections (Array, HTMLCollection, etc.)
 *
 * Behavior:
 * - Only elements that actually had the once id removed are returned.
 * - When the last once id is removed from an element, the data attribute is removed entirely.
 * - Throws TypeError for unsupported selector shapes (important for IIFE / runtime consumers).
 *
 * Returns: an array of Elements that were modified.
 */
export function removeOnce<T extends Element>(
  onceId: OnceId,
  selector: string | Element | Iterable<Element> | ArrayLike<Element>,
  options: {
    onceAttribute?: DataAttribute;
    context?: Document | DocumentFragment | Element;
  } = {},
): T[] {
  const { onceAttribute = ONCE_ATTRIBUTE_NAME, context = document } = options;

  assertOnceId(onceId);
  assertDataAttribute(onceAttribute);
  assertValidSelectorTypes(selector);

  // Quick early return for empty selector string
  if (typeof selector === 'string' && selector === '') {
    return [];
  }

  // string selector branch
  if (typeof selector === 'string') {
    assertValidContext(context);

    const elements: T[] = [];
    const results = context.querySelectorAll<T>(selector);
    for (let i = 0; i < results.length; i++) {
      const el = results[i];
      if (hasOnceAttributeValue(el, onceId, onceAttribute)) {
        removeOnceAttributeValue(el, onceId, onceAttribute);
        elements.push(el);
      }
    }
    return elements;
  }

  const elements: T[] = [];

  // single Element
  if (selector instanceof Element) {
    if (hasOnceAttributeValue(selector, onceId, onceAttribute)) {
      removeOnceAttributeValue(selector, onceId, onceAttribute);
      elements.push(selector as T);
    }
    return elements;
  }

  // iterable (NodeList, generator, etc.) — iterate with for..of
  if (isIterable(selector)) {
    for (const maybeEl of selector as Iterable<unknown>) {
      if (
        maybeEl instanceof Element &&
        hasOnceAttributeValue(maybeEl, onceId, onceAttribute)
      ) {
        removeOnceAttributeValue(maybeEl, onceId, onceAttribute);
        elements.push(maybeEl as T);
      }
    }
    return elements;
  }

  // array-like (HTMLCollection, etc.) — iterate by index
  if (isArrayLike(selector)) {
    const list = selector as ArrayLike<unknown>;
    for (let i = 0, len = list.length; i < len; i++) {
      const maybeEl = list[i] as unknown;
      if (
        maybeEl instanceof Element &&
        hasOnceAttributeValue(maybeEl, onceId, onceAttribute)
      ) {
        removeOnceAttributeValue(maybeEl, onceId, onceAttribute);
        elements.push(maybeEl as T);
      }
    }
    return elements;
  }

  return elements; // defensive (should be unreachable)
}

/**
 * Executes a callback once per element, marking elements with a once id to prevent re-execution.
 *
 * Accepted selector types:
 * - string: a CSS selector (queried with `context.querySelectorAll`)
 * - Element: a single element
 * - Iterable<Element>: any iterable of Elements (NodeList, generator, etc.)
 * - ArrayLike<Element>: array-like collections (Array, HTMLCollection, etc.)
 *
 * Behavior:
 * - Only executes callback for elements that don't already have the once id.
 * - Adds the once id to each element after the callback executes.
 * - Multiple once ids can be added to the same element (space-separated).
 * - Throws TypeError for unsupported selector shapes (important for IIFE / runtime consumers).
 * - Throws TypeError if callback is not a function.
 *
 * Returns: an array of Elements that were processed (had callback executed and once id added).
 */
export function doOnce<T extends Element>(
  onceId: OnceId,
  selector: string | Element | Iterable<Element> | ArrayLike<Element>,
  callback: (element: T) => void,
  options: {
    onceAttribute?: DataAttribute;
    context?: Document | DocumentFragment | Element;
  } = {},
): T[] {
  const { onceAttribute = ONCE_ATTRIBUTE_NAME, context = document } = options;

  assertOnceId(onceId);
  assertDataAttribute(onceAttribute);
  assertValidSelectorTypes(selector);

  if (typeof callback !== 'function') {
    throw new TypeError('callback must be a function');
  }

  // Quick early return for empty selector string
  if (typeof selector === 'string' && selector === '') {
    return [];
  }

  // string selector branch
  if (typeof selector === 'string') {
    const elements = querySelectorOnce<T>(onceId, selector, {
      onceAttribute,
      context,
    });
    for (const element of elements) {
      callback(element);
    }
    return elements;
  }

  const elements: T[] = [];

  // single Element
  if (selector instanceof Element) {
    if (hasOnceAttributeValue(selector, onceId, onceAttribute)) return elements;
    callback(selector as T);
    addOnceAttributeValue(selector, onceId, onceAttribute);
    elements.push(selector as T);
    return elements;
  }

  // iterable (NodeList, generator, etc.) — iterate with for..of
  if (isIterable(selector)) {
    for (const maybeEl of selector as Iterable<unknown>) {
      if (
        maybeEl instanceof Element &&
        !hasOnceAttributeValue(maybeEl, onceId, onceAttribute)
      ) {
        callback(maybeEl as T);
        addOnceAttributeValue(maybeEl, onceId, onceAttribute);
        elements.push(maybeEl as T);
      }
    }
    return elements;
  }

  // array-like (HTMLCollection, etc.) — iterate by index
  if (isArrayLike(selector)) {
    const list = selector as ArrayLike<unknown>;
    for (let i = 0, len = list.length; i < len; i++) {
      const maybeEl = list[i] as unknown;
      if (
        maybeEl instanceof Element &&
        !hasOnceAttributeValue(maybeEl, onceId, onceAttribute)
      ) {
        callback(maybeEl as T);
        addOnceAttributeValue(maybeEl, onceId, onceAttribute);
        elements.push(maybeEl as T);
      }
    }
    return elements;
  }

  return []; // defensive (should be unreachable)
}

/**
 * Finds all elements that have been marked with a specific once id.
 *
 * This function searches for elements that have a specific once id,
 * allowing you to retrieve previously processed elements.
 *
 * Behavior:
 * - Returns all elements that have the specified once id.
 * - Does not modify elements (read-only operation).
 * - Elements can have multiple once ids (space-separated).
 * - Returns empty array if no elements are found.
 * - Uses CSS attribute selector with ~= for exact token matching.
 * - Throws TypeError if onceId is invalid.
 * - Throws TypeError if onceAttribute is invalid.
 * - Throws TypeError if context is invalid.
 *
 * Returns: an array of Elements that have been marked with the once id.
 */
export function findOnce<T extends Element>(
  onceId: OnceId,
  options: {
    onceAttribute?: DataAttribute;
    context?: Document | DocumentFragment | Element;
  } = {},
): T[] {
  const { onceAttribute = ONCE_ATTRIBUTE_NAME, context = document } = options;

  assertOnceId(onceId);
  assertDataAttribute(onceAttribute);
  assertValidContext(context);

  return Array.from(
    context.querySelectorAll<T>(`[${onceAttribute}~="${onceId}"]`),
  );
}
// #endregion PUBLIC_API
