/**
 * @file dom-once.ts
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

// PRIVATE
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

/**
 * Checks if a value is iterable and contains only Element instances.
 */
function isIterableElements(value: unknown): value is Iterable<Element> {
  return isIterable(value);
}

/**
 * Checks if a value is array-like and contains only Element instances.
 */
function isArrayLikeElements(value: unknown): value is ArrayLike<Element> {
  return isArrayLike(value);
}
// #endregion PRIVATE_HELPERS

// =============================================================================
// PUBLIC_API — 🌐
// =============================================================================
// #region PUBLIC_API
/**
 * Queries for elements and adds the once id to the element's once data attribute value.
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

  // Validate the onceId parameter is a valid once ID.
  assertOnceId(onceId);

  // Validate the onceAttribute parameter is a valid data attribute.
  assertDataAttribute(onceAttribute);

  // Validate the selector parameter is a string.
  if (typeof selector !== 'string') {
    throw new TypeError('selector must be a string');
  }

  // If selector is empty, return empty array (consistent with CSS querySelectorAll behavior)
  if (selector === '') {
    return [];
  }

  // Validate the context parameter is a valid context.
  if (!context || typeof context.querySelectorAll !== 'function') {
    throw new TypeError(
      'context must be a Document, DocumentFragment, or Element',
    );
  }

  // Single-pass processing for optimal performance
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

  // Validate the onceId parameter is a valid once ID.
  assertOnceId(onceId);

  // Validate the onceAttribute parameter is a valid data attribute.
  assertDataAttribute(onceAttribute);

  // runtime validation: accept string | Element | Iterable<Element> | ArrayLike<Element>
  if (
    typeof selector !== 'string' &&
    !(selector instanceof Element) &&
    !isIterableElements(selector) &&
    !isArrayLikeElements(selector)
  ) {
    throw new TypeError(
      'selector must be a string, an Element, an Iterable<Element>, or an array-like collection',
    );
  }

  // Quick early return for empty selector string
  if (typeof selector === 'string' && selector === '') {
    return [];
  }

  // string selector branch
  if (typeof selector === 'string') {
    if (!context || typeof context.querySelectorAll !== 'function') {
      throw new TypeError(
        'context must be a Document, DocumentFragment, or Element',
      );
    }
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
  if (isIterableElements(selector)) {
    for (const maybeEl of selector) {
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
  if (isArrayLikeElements(selector)) {
    const list = selector;
    for (let i = 0, len = list.length; i < len; i++) {
      const maybeEl = list[i];
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
 *
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

  // Validate the onceId parameter is a valid once ID.
  assertOnceId(onceId);

  // Validate the onceAttribute parameter is a valid data attribute.
  assertDataAttribute(onceAttribute);

  // runtime validation: accept string | Element | Iterable<Element> | ArrayLike<Element>
  if (
    typeof selector !== 'string' &&
    !(selector instanceof Element) &&
    !isIterableElements(selector) &&
    !isArrayLikeElements(selector)
  ) {
    throw new TypeError(
      'selector must be a string, an Element, an Iterable<Element>, or an array-like collection',
    );
  }

  // Validate the callback parameter is a function.
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
  if (isIterableElements(selector)) {
    for (const maybeEl of selector) {
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
  if (isArrayLikeElements(selector)) {
    const list = selector;
    for (let i = 0, len = list.length; i < len; i++) {
      const maybeEl = list[i];
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
// #endregion PUBLIC_API
