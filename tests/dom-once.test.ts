// @vitest-environment happy-dom

import { expect, test, describe, beforeEach } from 'vitest';
import { querySelectorOnce } from '../src/dom-once';
import { Window } from 'happy-dom';

const window = new Window({url: 'https://localhost:8080'});
const document = window.document;

describe('querySelectorOnce', () => {
  beforeEach(() => {
    // Clear the document before each test
    document.body.innerHTML = '';
  });

  describe('onceId validation', () => {
    test('Once ID cannot be null, undefined, or empty', () => {
      // @ts-expect-error - Testing null input
      expect(() => querySelectorOnce(null, 'div')).toThrow('Once ID cannot be null, undefined, or empty');
      // @ts-expect-error - Testing undefined input
      expect(() => querySelectorOnce(undefined, 'div')).toThrow('Once ID cannot be null, undefined, or empty');
      expect(() => querySelectorOnce('', 'div')).toThrow('Once ID cannot be null, undefined, or empty');
    });

    test('Once ID must contain only valid characters', () => {
      expect(() => querySelectorOnce('abc 123', 'div')).toThrow('Invalid once ID: "abc 123". Must contain only letters, numbers, underscores, and hyphens');
      expect(() => querySelectorOnce('abc@123', 'div')).toThrow('Invalid once ID: "abc@123". Must contain only letters, numbers, underscores, and hyphens');
      expect(() => querySelectorOnce('abc#123', 'div')).toThrow('Invalid once ID: "abc#123". Must contain only letters, numbers, underscores, and hyphens');
    });

    test('Valid once IDs should pass validation', () => {
      document.body.innerHTML = '<div></div>';
      expect(() => querySelectorOnce('valid-id', 'div')).not.toThrow();
      expect(() => querySelectorOnce('valid_id', 'div')).not.toThrow();
      expect(() => querySelectorOnce('valid123', 'div')).not.toThrow();
      expect(() => querySelectorOnce('valid-id_123', 'div')).not.toThrow();
    });
  });

  describe('selector validation', () => {
    test('selector must be a string', () => {
      // @ts-expect-error - Testing non-string input
      expect(() => querySelectorOnce('id', null)).toThrow('selector must be a string');
      // @ts-expect-error - Testing non-string input
      expect(() => querySelectorOnce('id', undefined)).toThrow('selector must be a string');
      // @ts-expect-error - Testing non-string input
      expect(() => querySelectorOnce('id', 123)).toThrow('selector must be a string');
    });

    test('empty selector returns empty array', () => {
      const result = querySelectorOnce('id', '');
      expect(result).toEqual([]);
    });
  });

  describe('onceAttribute validation', () => {
    test('invalid data attribute throws error', () => {
      // @ts-expect-error - Testing invalid data attribute
      expect(() => querySelectorOnce('id', 'div', { onceAttribute: 'invalid-attr' })).toThrow('Invalid data attribute: "invalid-attr". Must match pattern: /^data-[a-z0-9.:-]+$/');
      expect(() => querySelectorOnce('id', 'div', { onceAttribute: 'data-@invalid' })).toThrow('Invalid data attribute: "data-@invalid". Must match pattern: /^data-[a-z0-9.:-]+$/');
    });

    test('valid data attributes should pass', () => {
      document.body.innerHTML = '<div></div>';
      expect(() => querySelectorOnce('id', 'div', { onceAttribute: 'data-custom' })).not.toThrow();
      expect(() => querySelectorOnce('id', 'div', { onceAttribute: 'data-custom-attr' })).not.toThrow();
      expect(() => querySelectorOnce('id', 'div', { onceAttribute: 'data-custom.attr' })).not.toThrow();
    });
  });

  describe('context validation', () => {
    test('invalid context throws error', () => {
      // @ts-expect-error - Testing invalid context
      expect(() => querySelectorOnce('id', 'div', { context: null })).toThrow('context must be a Document, DocumentFragment, or Element');
      // @ts-expect-error - Testing invalid context
      expect(() => querySelectorOnce('id', 'div', { context: 'string' })).toThrow('context must be a Document, DocumentFragment, or Element');
    });

    test('valid contexts should pass', () => {
      document.body.innerHTML = '<div></div>';
      const div = document.querySelector('div')!;
      const fragment = document.createDocumentFragment();

      expect(() => querySelectorOnce('id', 'div', { context: document as unknown as Document })).not.toThrow();
      expect(() => querySelectorOnce('id', 'div', { context: fragment as unknown as DocumentFragment })).not.toThrow();
      expect(() => querySelectorOnce('id', 'div', { context: div as unknown as Element })).not.toThrow();
    });
  });

  describe('basic functionality', () => {
    test('adds once attribute to matching elements', () => {
      document.body.innerHTML = '<div class="test"></div><div class="test"></div>';

      const elements = querySelectorOnce('my-id', '.test', { context: document as unknown as Document });

      expect(elements).toHaveLength(2);
      expect(elements[0].getAttribute('data-dom-once')).toBe('my-id');
      expect(elements[1].getAttribute('data-dom-once')).toBe('my-id');
    });

    test('does not add once attribute to elements that already have it', () => {
      document.body.innerHTML = '<div class="test" data-dom-once="my-id"></div><div class="test"></div>';

      const elements = querySelectorOnce('my-id', '.test', { context: document as unknown as Document });

      expect(elements).toHaveLength(1);
      expect(elements[0].getAttribute('data-dom-once')).toBe('my-id');
    });

    test('returns empty array when no elements match', () => {
      document.body.innerHTML = '<div class="other"></div>';

      const elements = querySelectorOnce('my-id', '.test', { context: document as unknown as Document });

      expect(elements).toEqual([]);
    });
  });

  describe('options parameter', () => {
    test('uses default onceAttribute when not provided', () => {
      document.body.innerHTML = '<div class="test"></div>';

      querySelectorOnce('my-id', '.test', { context: document as unknown as Document });

      const div = document.querySelector('.test')!;
      expect(div.getAttribute('data-dom-once')).toBe('my-id');
    });

    test('uses custom onceAttribute when provided', () => {
      document.body.innerHTML = '<div class="test"></div>';

      querySelectorOnce('my-id', '.test', { onceAttribute: 'data-custom', context: document as unknown as Document });

      const div = document.querySelector('.test')!;
      expect(div.getAttribute('data-custom')).toBe('my-id');
      expect(div.getAttribute('data-dom-once')).toBeNull();
    });

    test('uses default context when not provided', () => {
      document.body.innerHTML = '<div class="test"></div>';

      const elements = querySelectorOnce('my-id', '.test', { context: document as unknown as Document });

      expect(elements).toHaveLength(1);
    });

    test('uses custom context when provided', () => {
      const fragment = document.createDocumentFragment();
      const div = document.createElement('div');
      div.className = 'test';
      fragment.appendChild(div);

      const elements = querySelectorOnce('my-id', '.test', { context: fragment as unknown as DocumentFragment });

      expect(elements).toHaveLength(1);
      expect(div.getAttribute('data-dom-once')).toBe('my-id');
    });

    test('partial options object works correctly', () => {
      document.body.innerHTML = '<div class="test"></div>';

      // Only provide context, use default onceAttribute
      const elements = querySelectorOnce('my-id', '.test', { context: document as unknown as Document });
      expect(elements).toHaveLength(1);

      // Only provide onceAttribute, use default context
      const elements2 = querySelectorOnce('my-id-2', '.test', { onceAttribute: 'data-custom', context: document as unknown as Document });
      expect(elements2).toHaveLength(1);
    });
  });

  describe('multiple once IDs', () => {
    test('adds multiple once IDs to same element', () => {
      document.body.innerHTML = '<div class="test"></div>';

      querySelectorOnce('first-id', '.test', { context: document as unknown as Document });
      querySelectorOnce('second-id', '.test', { context: document as unknown as Document });

      const div = document.querySelector('.test')!;
      const onceAttr = div.getAttribute('data-dom-once');
      expect(onceAttr).toContain('first-id');
      expect(onceAttr).toContain('second-id');
    });

    test('does not duplicate existing once IDs', () => {
      document.body.innerHTML = '<div class="test"></div>';

      querySelectorOnce('my-id', '.test', { context: document as unknown as Document });
      querySelectorOnce('my-id', '.test', { context: document as unknown as Document }); // Same ID again

      const div = document.querySelector('.test')!;
      expect(div.getAttribute('data-dom-once')).toBe('my-id');
    });
  });

  describe('edge cases', () => {
    test('works with complex selectors', () => {
      document.body.innerHTML = '<div class="parent"><span class="child active"></span></div>';

      const elements = querySelectorOnce('complex-id', '.parent .child.active', { context: document as unknown as Document });

      expect(elements).toHaveLength(1);
      expect(elements[0].getAttribute('data-dom-once')).toBe('complex-id');
    });

    test('works with attribute selectors', () => {
      document.body.innerHTML = '<input type="text" data-test="value">';

      const elements = querySelectorOnce('input-id', 'input[data-test="value"]', { context: document as unknown as Document });

      expect(elements).toHaveLength(1);
      expect(elements[0].getAttribute('data-dom-once')).toBe('input-id');
    });

    test('handles whitespace in once attribute values', () => {
      document.body.innerHTML = '<div class="test" data-dom-once="existing-id"></div>';

      querySelectorOnce('new-id', '.test', { context: document as unknown as Document });

      const div = document.querySelector('.test')!;
      const onceAttr = div.getAttribute('data-dom-once');
      expect(onceAttr).toContain('existing-id');
      expect(onceAttr).toContain('new-id');
    });
  });
});
