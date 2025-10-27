/**
 * Simple utilities to select and manipulate DOM elements only once.
 *
 * @module @briantbailey/dom-once
 *
 * Public API:
 * - querySelectorOnce: query and mark elements with a once id
 * - doOnce: run a callback once per element and mark with a once id
 * - removeOnce: remove a once id from elements
 * - findOnce: find elements marked with a once id
 * - version: current library version
 */

/** Library version (e.g., "1.0.0"). */
export { version } from './version';

// #region TYPES
// =============================================================================
// TYPES — 🧩
// =============================================================================
/** Data attribute name starting with 'data-' (alphanumeric, dot, colon, hyphen allowed). */
export type DataAttribute = `data-${string}`;

/** Once ID string (alphanumeric, underscore, hyphen allowed). */
export type OnceId = string;
// #endregion TYPES

// #region CONSTANTS
// =============================================================================
// CONSTANTS — 📌
// =============================================================================
/** Default data attribute name for tracking once IDs. */
const ONCE_ATTRIBUTE_NAME: DataAttribute = 'data-dom-once';

/** Regular expression to match whitespace. */
const WHITESPACE_PATTERN: RegExp = /\s+/;

/** Regular expression to match a valid once ID (alphanumeric, underscore, hyphen). */
const ONCE_ID_PATTERN: RegExp = /^[a-zA-Z0-9_-]+$/;

/** Regular expression to match a valid data attribute (starts with 'data-', allows alphanumeric, dot, colon, hyphen). */
const DATA_ATTRIBUTE_PATTERN: RegExp = /^data-[a-z0-9.:-]+$/;
// #endregion CONSTANTS

// #region PRIVATE_HELPERS
// =============================================================================
// PRIVATE_HELPERS — 🔒
// =============================================================================
/** Validates that a string is a valid data attribute (starts with 'data-'). */
function assertValidDataAttribute(
  value: string,
): asserts value is DataAttribute {
  if (!DATA_ATTRIBUTE_PATTERN.test(value)) {
    throw new Error(
      `Invalid data attribute: "${value}". Must match pattern: /^data-[a-z0-9.:-]+$/`,
    );
  }
}

/** Validates that a string is a valid once ID (alphanumeric, underscore, hyphen). */
function assertValidOnceId(value: string): asserts value is OnceId {
  if (value == null || value === '') {
    throw new Error('Once ID cannot be null, undefined, or empty');
  }
  if (!ONCE_ID_PATTERN.test(value)) {
    throw new Error(
      `Invalid once ID: "${value}". Must contain only letters, numbers, underscores, and hyphens`,
    );
  }
}

/** Validates that a selector is a supported type (string, Element, Iterable, or ArrayLike). */
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

/** Validates that a context has a querySelectorAll method. */
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

/** Adds a once ID to an element's data attribute (space-separated). */
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

/** Removes a once ID from an element's data attribute (removes attribute if empty). */
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

/** Checks if an element is marked with a specific once ID. */
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

/** Checks if a value is iterable (has Symbol.iterator). */
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

/** Checks if a value is array-like (has numeric length property). */
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

// #region PUBLIC_API
// =============================================================================
// PUBLIC_API — 🌐
// =============================================================================
/**
 * Queries for elements using a CSS selector and marks them with a once id.
 *
 * This function finds elements matching a CSS selector and marks them with a once id
 * to track that they've been processed, returning only elements that weren't already marked.
 *
 * @template T - The type of Element to query for
 * @param {string} onceId - Unique identifier to mark elements with (alphanumeric, underscore, hyphen)
 * @param {string} selector - CSS selector string to query elements
 * @param {Object} [options] - Configuration options
 * @param {string} [options.onceAttribute='data-dom-once'] - Data attribute name for tracking (must start with 'data-')
 * @param {Document | DocumentFragment | Element} [options.context=document] - Context to query within
 * @returns {Element[]} Elements that were newly marked with the once id
 *
 * @example
 * // Mark all buttons
 * const buttons = querySelectorOnce('init', 'button');
 *
 * @example
 * // With custom attribute and context
 * const items = querySelectorOnce('processed', '.item', {
 *   onceAttribute: 'data-my-tracker',
 *   context: document.querySelector('#container')
 * });
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

  assertValidOnceId(onceId);
  assertValidDataAttribute(onceAttribute);

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
 * This function removes a once id from elements, allowing them to be processed again.
 * When the last once id is removed from an element, the data attribute is removed entirely.
 *
 * @template T - The type of Element to process
 * @param {string} onceId - Unique identifier to remove from elements
 * @param {string | Element | Iterable<Element> | ArrayLike<Element>} selector - Elements to process (CSS selector, Element, NodeList, Array, etc.)
 * @param {Object} [options] - Configuration options
 * @param {string} [options.onceAttribute='data-dom-once'] - Data attribute name for tracking (must start with 'data-')
 * @param {Document | DocumentFragment | Element} [options.context=document] - Context to query within (when selector is a string)
 * @returns {Element[]} Elements that had the once id removed
 *
 * @example
 * // Remove from all matching elements
 * const removed = removeOnce('init', '.processed');
 *
 * @example
 * // Remove from a NodeList
 * const elements = document.querySelectorAll('.item');
 * removeOnce('processed', elements);
 *
 * @example
 * // Remove from a single element
 * const button = document.querySelector('button');
 * removeOnce('clicked', button);
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

  assertValidOnceId(onceId);
  assertValidDataAttribute(onceAttribute);
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
 * This function executes a callback on elements that haven't been marked with a once id yet,
 * then marks them to prevent future executions with the same once id.
 *
 * @template T - The type of Element to process
 * @param {string} onceId - Unique identifier to mark elements with
 * @param {string | Element | Iterable<Element> | ArrayLike<Element>} selector - Elements to process (CSS selector, Element, NodeList, Array, etc.)
 * @param {Function} callback - Function to execute on each unmarked element
 * @param {Object} [options] - Configuration options
 * @param {string} [options.onceAttribute='data-dom-once'] - Data attribute name for tracking (must start with 'data-')
 * @param {Document | DocumentFragment | Element} [options.context=document] - Context to query within (when selector is a string)
 * @returns {Element[]} Elements that were processed (had callback executed and once id added)
 *
 * @example
 * // Initialize all buttons once
 * doOnce('init', 'button', (btn) => {
 *   btn.addEventListener('click', handleClick);
 * });
 *
 * @example
 * // Process a NodeList
 * const items = document.querySelectorAll('.item');
 * doOnce('animate', items, (item) => {
 *   item.classList.add('animated');
 * });
 *
 * @example
 * // With custom tracking attribute
 * doOnce('setup', '.widget', setupWidget, {
 *   onceAttribute: 'data-initialized'
 * });
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

  assertValidOnceId(onceId);
  assertValidDataAttribute(onceAttribute);
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
 * allowing you to retrieve previously processed elements. This is a read-only
 * operation that does not modify any elements.
 *
 * @template T - The type of Element to find
 * @param {string} onceId - Unique identifier to search for
 * @param {Object} [options] - Configuration options
 * @param {string} [options.onceAttribute='data-dom-once'] - Data attribute name for tracking (must start with 'data-')
 * @param {Document | DocumentFragment | Element} [options.context=document] - Context to search within
 * @returns {Element[]} Elements that have been marked with the once id
 *
 * @example
 * // Find all initialized buttons
 * const initializedButtons = findOnce('init');
 *
 * @example
 * // Find within a specific container
 * const processedItems = findOnce('processed', {
 *   context: document.querySelector('#container')
 * });
 *
 * @example
 * // With custom tracking attribute
 * const setupWidgets = findOnce('setup', {
 *   onceAttribute: 'data-initialized'
 * });
 */
export function findOnce<T extends Element>(
  onceId: OnceId,
  options: {
    onceAttribute?: DataAttribute;
    context?: Document | DocumentFragment | Element;
  } = {},
): T[] {
  const { onceAttribute = ONCE_ATTRIBUTE_NAME, context = document } = options;

  assertValidOnceId(onceId);
  assertValidDataAttribute(onceAttribute);
  assertValidContext(context);

  return Array.from(
    context.querySelectorAll<T>(`[${onceAttribute}~="${onceId}"]`),
  );
}
// #endregion PUBLIC_API
