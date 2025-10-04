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

  if (!value) {
    // ID doesn't exist, add it
    element.setAttribute(onceAttribute, onceId);
    return;
  }

  if (element.matches(`[${onceAttribute}~="${onceId}"]`)) {
    // Check if the ID already exists using CSS selector matching and return if it does
    return;
  }

  // Add the new ID to the existing value with string concatenation
  element.setAttribute(onceAttribute, `${value} ${onceId}`);
}

/**
 * Removes a once ID from an element's data attribute value.
 * If the ID does not exist, no changes are made.
 */
// @ts-expect-error TS6133
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function removeOnceAttributeValue(
  element: Element,
  onceId: string,
  onceAttribute: DataAttribute,
): void {
  const value = element.getAttribute(onceAttribute);

  if (!value) return;

  const onceIdList = value.split(WHITESPACE_PATTERN);
  if (!onceIdList.includes(onceId)) return;

  // Remove the ID from the existing value with the filter method
  element.setAttribute(
    onceAttribute,
    onceIdList.filter((id) => id !== onceId).join(' '),
  );
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
 * Removes a once id from an element's once data attribute value.
 */
// export function removeOnce<T extends Element>(
//   id: string,
//   selector: string,
//   context: Document | DocumentFragment | Element = document,
//   options: {
//     attribute: DataAttribute;
//   } = {
//     attribute: onceAttrName,
//   },
// ): T[] {
//   const elements = context.querySelectorAll<T>(selector);
//   console.debug('removeOnce', elements);

//   return Array.from(elements);
// }
// #endregion PUBLIC_API
