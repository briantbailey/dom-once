// @vitest-environment happy-dom

import { expect, test, describe, beforeEach } from 'vitest';
import { querySelectorOnce } from '../src/dom-once';
import { removeOnce } from '../src/dom-once';
import { doOnce } from '../src/dom-once';
import { Window } from 'happy-dom';

const window = new Window({ url: 'https://localhost:8080' });
const document = window.document;

describe('querySelectorOnce', () => {
  beforeEach(() => {
    // Clear the document before each test
    document.body.innerHTML = '';
  });

  describe('onceId validation', () => {
    test('Once ID cannot be null, undefined, or empty', () => {
      // @ts-expect-error - Testing null input
      expect(() => querySelectorOnce(null, 'div')).toThrow(
        'Once ID cannot be null, undefined, or empty',
      );
      // @ts-expect-error - Testing undefined input
      expect(() => querySelectorOnce(undefined, 'div')).toThrow(
        'Once ID cannot be null, undefined, or empty',
      );
      expect(() => querySelectorOnce('', 'div')).toThrow(
        'Once ID cannot be null, undefined, or empty',
      );
    });

    test('Once ID must contain only valid characters', () => {
      expect(() => querySelectorOnce('abc 123', 'div')).toThrow(
        'Invalid once ID: "abc 123". Must contain only letters, numbers, underscores, and hyphens',
      );
      expect(() => querySelectorOnce('abc@123', 'div')).toThrow(
        'Invalid once ID: "abc@123". Must contain only letters, numbers, underscores, and hyphens',
      );
      expect(() => querySelectorOnce('abc#123', 'div')).toThrow(
        'Invalid once ID: "abc#123". Must contain only letters, numbers, underscores, and hyphens',
      );
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
      expect(() => querySelectorOnce('id', null)).toThrow(
        'selector must be a string',
      );
      // @ts-expect-error - Testing non-string input
      expect(() => querySelectorOnce('id', undefined)).toThrow(
        'selector must be a string',
      );
      // @ts-expect-error - Testing non-string input
      expect(() => querySelectorOnce('id', 123)).toThrow(
        'selector must be a string',
      );
    });

    test('empty selector returns empty array', () => {
      const result = querySelectorOnce('id', '');
      expect(result).toEqual([]);
    });
  });

  describe('onceAttribute validation', () => {
    test('invalid data attribute throws error', () => {
      expect(() =>
        // @ts-expect-error - Testing invalid data attribute
        querySelectorOnce('id', 'div', { onceAttribute: 'invalid-attr' }),
      ).toThrow(
        'Invalid data attribute: "invalid-attr". Must match pattern: /^data-[a-z0-9.:-]+$/',
      );
      expect(() =>
        querySelectorOnce('id', 'div', { onceAttribute: 'data-@invalid' }),
      ).toThrow(
        'Invalid data attribute: "data-@invalid". Must match pattern: /^data-[a-z0-9.:-]+$/',
      );
    });

    test('valid data attributes should pass', () => {
      document.body.innerHTML = '<div></div>';
      expect(() =>
        querySelectorOnce('id', 'div', { onceAttribute: 'data-custom' }),
      ).not.toThrow();
      expect(() =>
        querySelectorOnce('id', 'div', { onceAttribute: 'data-custom-attr' }),
      ).not.toThrow();
      expect(() =>
        querySelectorOnce('id', 'div', { onceAttribute: 'data-custom.attr' }),
      ).not.toThrow();
    });
  });

  describe('context validation', () => {
    test('invalid context throws error', () => {
      // @ts-expect-error - Testing invalid context
      expect(() => querySelectorOnce('id', 'div', { context: null })).toThrow(
        'context must be a Document, DocumentFragment, or Element',
      );
      expect(() =>
        // @ts-expect-error - Testing invalid context
        querySelectorOnce('id', 'div', { context: 'string' }),
      ).toThrow('context must be a Document, DocumentFragment, or Element');
    });

    test('valid contexts should pass', () => {
      document.body.innerHTML = '<div></div>';
      const div = document.querySelector('div')!;
      const fragment = document.createDocumentFragment();

      expect(() =>
        querySelectorOnce('id', 'div', {
          context: document as unknown as Document,
        }),
      ).not.toThrow();
      expect(() =>
        querySelectorOnce('id', 'div', {
          context: fragment as unknown as DocumentFragment,
        }),
      ).not.toThrow();
      expect(() =>
        querySelectorOnce('id', 'div', { context: div as unknown as Element }),
      ).not.toThrow();
    });
  });

  describe('basic functionality', () => {
    test('adds once attribute to matching elements', () => {
      document.body.innerHTML =
        '<div class="test"></div><div class="test"></div>';

      const elements = querySelectorOnce('my-id', '.test', {
        context: document as unknown as Document,
      });

      expect(elements).toHaveLength(2);
      expect(elements[0].getAttribute('data-dom-once')).toBe('my-id');
      expect(elements[1].getAttribute('data-dom-once')).toBe('my-id');
    });

    test('does not add once attribute to elements that already have it', () => {
      document.body.innerHTML =
        '<div class="test" data-dom-once="my-id"></div><div class="test"></div>';

      const elements = querySelectorOnce('my-id', '.test', {
        context: document as unknown as Document,
      });

      expect(elements).toHaveLength(1);
      expect(elements[0].getAttribute('data-dom-once')).toBe('my-id');
    });

    test('returns empty array when no elements match', () => {
      document.body.innerHTML = '<div class="other"></div>';

      const elements = querySelectorOnce('my-id', '.test', {
        context: document as unknown as Document,
      });

      expect(elements).toEqual([]);
    });
  });

  describe('options parameter', () => {
    test('uses default onceAttribute when not provided', () => {
      document.body.innerHTML = '<div class="test"></div>';

      querySelectorOnce('my-id', '.test', {
        context: document as unknown as Document,
      });

      const div = document.querySelector('.test')!;
      expect(div.getAttribute('data-dom-once')).toBe('my-id');
    });

    test('uses custom onceAttribute when provided', () => {
      document.body.innerHTML = '<div class="test"></div>';

      querySelectorOnce('my-id', '.test', {
        onceAttribute: 'data-custom',
        context: document as unknown as Document,
      });

      const div = document.querySelector('.test')!;
      expect(div.getAttribute('data-custom')).toBe('my-id');
      expect(div.getAttribute('data-dom-once')).toBeNull();
    });

    test('uses default context when not provided', () => {
      document.body.innerHTML = '<div class="test"></div>';

      const elements = querySelectorOnce('my-id', '.test', {
        context: document as unknown as Document,
      });

      expect(elements).toHaveLength(1);
    });

    test('uses custom context when provided', () => {
      const fragment = document.createDocumentFragment();
      const div = document.createElement('div');
      div.className = 'test';
      fragment.appendChild(div);

      const elements = querySelectorOnce('my-id', '.test', {
        context: fragment as unknown as DocumentFragment,
      });

      expect(elements).toHaveLength(1);
      expect(div.getAttribute('data-dom-once')).toBe('my-id');
    });

    test('partial options object works correctly', () => {
      document.body.innerHTML = '<div class="test"></div>';

      // Only provide context, use default onceAttribute
      const elements = querySelectorOnce('my-id', '.test', {
        context: document as unknown as Document,
      });
      expect(elements).toHaveLength(1);

      // Only provide onceAttribute, use default context
      const elements2 = querySelectorOnce('my-id-2', '.test', {
        onceAttribute: 'data-custom',
        context: document as unknown as Document,
      });
      expect(elements2).toHaveLength(1);
    });
  });

  describe('multiple once IDs', () => {
    test('adds multiple once IDs to same element', () => {
      document.body.innerHTML = '<div class="test"></div>';

      querySelectorOnce('first-id', '.test', {
        context: document as unknown as Document,
      });
      querySelectorOnce('second-id', '.test', {
        context: document as unknown as Document,
      });

      const div = document.querySelector('.test')!;
      const onceAttr = div.getAttribute('data-dom-once');
      expect(onceAttr).toContain('first-id');
      expect(onceAttr).toContain('second-id');
    });

    test('does not duplicate existing once IDs', () => {
      document.body.innerHTML = '<div class="test"></div>';

      querySelectorOnce('my-id', '.test', {
        context: document as unknown as Document,
      });
      querySelectorOnce('my-id', '.test', {
        context: document as unknown as Document,
      }); // Same ID again

      const div = document.querySelector('.test')!;
      expect(div.getAttribute('data-dom-once')).toBe('my-id');
    });
  });

  describe('edge cases', () => {
    test('works with complex selectors', () => {
      document.body.innerHTML =
        '<div class="parent"><span class="child active"></span></div>';

      const elements = querySelectorOnce(
        'complex-id',
        '.parent .child.active',
        { context: document as unknown as Document },
      );

      expect(elements).toHaveLength(1);
      expect(elements[0].getAttribute('data-dom-once')).toBe('complex-id');
    });

    test('works with attribute selectors', () => {
      document.body.innerHTML = '<input type="text" data-test="value">';

      const elements = querySelectorOnce(
        'input-id',
        'input[data-test="value"]',
        { context: document as unknown as Document },
      );

      expect(elements).toHaveLength(1);
      expect(elements[0].getAttribute('data-dom-once')).toBe('input-id');
    });

    test('handles whitespace in once attribute values', () => {
      document.body.innerHTML =
        '<div class="test" data-dom-once="existing-id"></div>';

      querySelectorOnce('new-id', '.test', {
        context: document as unknown as Document,
      });

      const div = document.querySelector('.test')!;
      const onceAttr = div.getAttribute('data-dom-once');
      expect(onceAttr).toContain('existing-id');
      expect(onceAttr).toContain('new-id');
    });
  });
});

describe('removeOnce', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('removeOnce(element) removes once id and returns element when present', () => {
    const el = document.createElement('div');
    el.setAttribute('data-dom-once', 'x');
    const removed = removeOnce('x', el as unknown as HTMLDivElement);
    expect(removed).toEqual([el]);
    expect(el.hasAttribute('data-dom-once')).toBe(false);
  });

  test('removeOnce(element) returns [] when element has no matching id', () => {
    const el = document.createElement('div');
    const removed = removeOnce('x', el as unknown as HTMLDivElement);
    expect(removed).toEqual([]);
    expect(el.hasAttribute('data-dom-once')).toBe(false);
  });

  test('removeOnce(array) returns only modified elements', () => {
    const a = document.createElement('div');
    const b = document.createElement('div');
    a.setAttribute('data-dom-once', 'keep x');
    b.setAttribute('data-dom-once', 'y x');
    const result = removeOnce('x', [
      a as unknown as HTMLDivElement,
      b as unknown as HTMLDivElement,
    ]);
    expect(result).toEqual([a, b]);
    expect(a.getAttribute('data-dom-once')).toContain('keep');
    expect(b.getAttribute('data-dom-once')).toContain('y');
  });

  test('removeOnce handles HTMLCollection (array-like) and caches length', () => {
    const container = document.createElement('div');
    const a = document.createElement('div');
    const b = document.createElement('div');
    a.setAttribute('data-dom-once', 'x');
    b.setAttribute('data-dom-once', 'z');
    container.appendChild(a);
    container.appendChild(b);
    const col = container.children;
    const result = removeOnce('x', col as unknown as HTMLCollection);
    expect(result).toEqual([a]);
    expect(a.hasAttribute('data-dom-once')).toBe(false);
    expect(b.getAttribute('data-dom-once')).toBe('z');
  });

  test('removeOnce handles NodeList iterable and returns modified elements', () => {
    const frag = document.createDocumentFragment();
    const a = document.createElement('div');
    const b = document.createElement('div');
    a.className = 't';
    b.className = 't';
    a.setAttribute('data-dom-once', 'x');
    frag.appendChild(a);
    frag.appendChild(b);
    const nodeList =
      (frag as unknown as Element).querySelectorAll?.('.t') ||
      frag.querySelectorAll('.t');
    const results = removeOnce('x', nodeList);
    expect(results).toEqual([a]);
  });

  test('removeOnce supports generator iterables', () => {
    const a = document.createElement('div');
    const b = document.createElement('div');
    a.setAttribute('data-dom-once', 'x');
    b.setAttribute('data-dom-once', 'y');

    function* gen() {
      yield a;
      yield b;
    }

    const result = removeOnce('x', gen() as unknown as Iterable<Element>);
    expect(result).toEqual([a]);
    expect(a.hasAttribute('data-dom-once')).toBe(false);
    expect(b.getAttribute('data-dom-once')).toBe('y');
  });

  test('removeOnce(selector, context) removes ids found via querySelectorAll in given context', () => {
    const frag = document.createDocumentFragment();
    const el = document.createElement('div');
    el.className = 'foo';
    el.setAttribute('data-dom-once', 'a');
    frag.appendChild(el);
    const removed = removeOnce('a', '.foo', {
      context: frag as unknown as DocumentFragment,
    });
    expect(removed).toEqual([el]);
    expect(el.hasAttribute('data-dom-once')).toBe(false);
  });

  test('removeOnce(empty selector) returns []', () => {
    expect(removeOnce('x', '')).toEqual([]);
  });

  test('removeOnce removes attribute entirely when last id removed', () => {
    const el = document.createElement('div');
    el.setAttribute('data-dom-once', 'x   ');
    const removed = removeOnce('x', el as unknown as HTMLDivElement);
    expect(removed).toEqual([el]);
    expect(el.hasAttribute('data-dom-once')).toBe(false);
  });

  test('removeOnce preserves other ids when removing one id', () => {
    const el = document.createElement('div');
    el.setAttribute('data-dom-once', 'a b c');
    const removed = removeOnce('b', el as unknown as HTMLDivElement);
    expect(removed).toEqual([el]);
    expect(el.getAttribute('data-dom-once')).toBe('a c');
  });

  test('removeOnce throws TypeError for unsupported selector shapes', () => {
    // @ts-expect-error runtime test
    expect(() => removeOnce('x', null)).toThrow(TypeError);
    // @ts-expect-error runtime test
    expect(() => removeOnce('x', 123)).toThrow(TypeError);
    // @ts-expect-error runtime test
    expect(() => removeOnce('x', {})).toThrow(TypeError);
  });

  test('removeOnce ignores non-Element items in iterable/array-like inputs', () => {
    const el = document.createElement('div');
    el.setAttribute('data-dom-once', 'x');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mixed: any[] = [el, null, {}, 'string'];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const removed = removeOnce('x', mixed as any);
    expect(removed).toEqual([el]);
    expect(el.hasAttribute('data-dom-once')).toBe(false);
  });

  test('removeOnce works with custom onceAttribute', () => {
    const el = document.createElement('div');
    el.setAttribute('data-custom-attr', 'test-id');
    const removed = removeOnce('test-id', el as unknown as HTMLDivElement, {
      onceAttribute: 'data-custom-attr',
    });
    expect(removed).toEqual([el]);
    expect(el.hasAttribute('data-custom-attr')).toBe(false);
  });

  test('removeOnce iterable with non-Element values in generator', () => {
    const el1 = document.createElement('div');
    const el2 = document.createElement('div');
    el1.setAttribute('data-dom-once', 'x');
    el2.setAttribute('data-dom-once', 'x');

    function* gen() {
      yield el1;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      yield null as any;
      yield el2;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      yield 'not an element' as any;
    }

    const result = removeOnce('x', gen() as unknown as Iterable<Element>);
    expect(result).toEqual([el1, el2]);
    expect(el1.hasAttribute('data-dom-once')).toBe(false);
    expect(el2.hasAttribute('data-dom-once')).toBe(false);
  });

  test('removeOnce array-like with non-Element values', () => {
    const el1 = document.createElement('div');
    const el2 = document.createElement('div');
    el1.setAttribute('data-dom-once', 'test');
    el2.setAttribute('data-dom-once', 'test');

    // Create array-like object with mixed values
    const arrayLike = {
      0: el1,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      1: null as any,
      2: el2,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      3: 'string' as any,
      length: 4,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = removeOnce('test', arrayLike as any);
    expect(result).toEqual([el1, el2]);
  });
});

describe('doOnce', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('parameter validation', () => {
    test('onceId cannot be null, undefined, or empty', () => {
      const callback = () => {};
      // @ts-expect-error - Testing null input
      expect(() => doOnce(null, 'div', callback)).toThrow(
        'Once ID cannot be null, undefined, or empty',
      );
      // @ts-expect-error - Testing undefined input
      expect(() => doOnce(undefined, 'div', callback)).toThrow(
        'Once ID cannot be null, undefined, or empty',
      );
      expect(() => doOnce('', 'div', callback)).toThrow(
        'Once ID cannot be null, undefined, or empty',
      );
    });

    test('onceId must contain only valid characters', () => {
      const callback = () => {};
      expect(() => doOnce('abc 123', 'div', callback)).toThrow(
        'Invalid once ID: "abc 123". Must contain only letters, numbers, underscores, and hyphens',
      );
      expect(() => doOnce('abc@123', 'div', callback)).toThrow(
        'Invalid once ID: "abc@123". Must contain only letters, numbers, underscores, and hyphens',
      );
      expect(() => doOnce('abc#123', 'div', callback)).toThrow(
        'Invalid once ID: "abc#123". Must contain only letters, numbers, underscores, and hyphens',
      );
    });

    test('selector must be string|Element|Iterable|ArrayLike', () => {
      const callback = () => {};
      // @ts-expect-error - Testing invalid input
      expect(() => doOnce('id', null, callback)).toThrow(TypeError);
      // @ts-expect-error - Testing invalid input
      expect(() => doOnce('id', 123, callback)).toThrow(TypeError);
      // @ts-expect-error - Testing invalid input
      expect(() => doOnce('id', {}, callback)).toThrow(TypeError);
    });

    test('callback must be a function', () => {
      document.body.innerHTML = '<div></div>';
      // @ts-expect-error - Testing invalid callback
      expect(() => doOnce('id', 'div', null)).toThrow(
        'callback must be a function',
      );
      // @ts-expect-error - Testing invalid callback
      expect(() => doOnce('id', 'div', 'not-a-function')).toThrow(
        'callback must be a function',
      );
      // @ts-expect-error - Testing invalid callback
      expect(() => doOnce('id', 'div', 123)).toThrow(
        'callback must be a function',
      );
    });

    test('invalid onceAttribute throws error', () => {
      const callback = () => {};
      expect(() =>
        // @ts-expect-error - Testing invalid data attribute
        doOnce('id', 'div', callback, { onceAttribute: 'invalid-attr' }),
      ).toThrow(
        'Invalid data attribute: "invalid-attr". Must match pattern: /^data-[a-z0-9.:-]+$/',
      );
      expect(() =>
        doOnce('id', 'div', callback, { onceAttribute: 'data-@invalid' }),
      ).toThrow(
        'Invalid data attribute: "data-@invalid". Must match pattern: /^data-[a-z0-9.:-]+$/',
      );
    });

    test('invalid context throws error for string selectors', () => {
      const callback = () => {};
      // @ts-expect-error - Testing invalid context
      expect(() => doOnce('id', 'div', callback, { context: null })).toThrow(
        'context must be a Document, DocumentFragment, or Element',
      );
      expect(() =>
        // @ts-expect-error - Testing invalid context
        doOnce('id', 'div', callback, { context: 'string' }),
      ).toThrow('context must be a Document, DocumentFragment, or Element');
    });
  });

  describe('string selector behavior', () => {
    test('finds elements via CSS selector and executes callback', () => {
      document.body.innerHTML =
        '<div class="test"></div><div class="test"></div>';
      const callbackOrder: Element[] = [];
      const callback = (el: Element) => callbackOrder.push(el);

      const elements = doOnce('my-id', '.test', callback, {
        context: document as unknown as Document,
      });

      expect(elements).toHaveLength(2);
      expect(callbackOrder).toHaveLength(2);
      expect(callbackOrder[0]).toBe(elements[0]);
      expect(callbackOrder[1]).toBe(elements[1]);
    });

    test('empty string selector returns []', () => {
      const callback = () => {};
      const result = doOnce('id', '', callback);
      expect(result).toEqual([]);
    });

    test('callback executes for each new element', () => {
      document.body.innerHTML =
        '<div class="test"></div><div class="test"></div>';
      let callbackCount = 0;
      const callback = () => {
        callbackCount++;
      };

      doOnce('my-id', '.test', callback, {
        context: document as unknown as Document,
      });

      expect(callbackCount).toBe(2);
    });

    test('callback NOT executed for elements already marked', () => {
      document.body.innerHTML =
        '<div class="test" data-dom-once="my-id"></div><div class="test"></div>';
      let callbackCount = 0;
      const callback = () => {
        callbackCount++;
      };

      const elements = doOnce('my-id', '.test', callback, {
        context: document as unknown as Document,
      });

      expect(callbackCount).toBe(1);
      expect(elements).toHaveLength(1);
    });

    test('adds once attribute after callback execution', () => {
      document.body.innerHTML = '<div class="test"></div>';

      // For string selectors, querySelectorOnce is called internally which adds
      // the attribute before callback execution. This is different from direct
      // element input where the attribute is added after.
      doOnce('my-id', '.test', () => {}, {
        context: document as unknown as Document,
      });

      // After doOnce completes, attribute should be set
      const div = document.querySelector('.test')!;
      expect(div.getAttribute('data-dom-once')).toBe('my-id');
    });

    test('returns only newly processed elements', () => {
      document.body.innerHTML =
        '<div class="test" data-dom-once="my-id"></div><div class="test"></div><div class="test"></div>';

      const elements = doOnce('my-id', '.test', () => {}, {
        context: document as unknown as Document,
      });

      expect(elements).toHaveLength(2);
      expect(elements[0].hasAttribute('data-dom-once')).toBe(true);
      expect(elements[1].hasAttribute('data-dom-once')).toBe(true);
    });

    test('uses custom context when provided', () => {
      const fragment = document.createDocumentFragment();
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      div1.className = 'test';
      div2.className = 'test';
      fragment.appendChild(div1);
      fragment.appendChild(div2);

      let callbackCount = 0;
      const callback = () => {
        callbackCount++;
      };

      const elements = doOnce('my-id', '.test', callback, {
        context: fragment as unknown as DocumentFragment,
      });

      expect(elements).toHaveLength(2);
      expect(callbackCount).toBe(2);
    });

    test('complex selectors work correctly', () => {
      document.body.innerHTML =
        '<div class="parent"><span class="child active"></span></div>';
      let callbackExecuted = false;
      const callback = () => {
        callbackExecuted = true;
      };

      const elements = doOnce('complex-id', '.parent .child.active', callback, {
        context: document as unknown as Document,
      });

      expect(elements).toHaveLength(1);
      expect(callbackExecuted).toBe(true);
      expect(elements[0].getAttribute('data-dom-once')).toBe('complex-id');
    });
  });

  describe('single Element input', () => {
    test('executes callback on unmarked element', () => {
      const el = document.createElement('div');
      let callbackExecuted = false;
      const callback = () => {
        callbackExecuted = true;
      };

      const result = doOnce('my-id', el as unknown as HTMLDivElement, callback);

      expect(result).toEqual([el]);
      expect(callbackExecuted).toBe(true);
    });

    test('skips callback on already marked element', () => {
      const el = document.createElement('div');
      el.setAttribute('data-dom-once', 'my-id');
      let callbackExecuted = false;
      const callback = () => {
        callbackExecuted = true;
      };

      const result = doOnce('my-id', el as unknown as HTMLDivElement, callback);

      expect(result).toEqual([]);
      expect(callbackExecuted).toBe(false);
    });

    test('returns [element] when processed', () => {
      const el = document.createElement('div');
      const callback = () => {};

      const result = doOnce('my-id', el as unknown as HTMLDivElement, callback);

      expect(result).toEqual([el]);
    });

    test('returns [] when element already marked', () => {
      const el = document.createElement('div');
      el.setAttribute('data-dom-once', 'my-id');
      const callback = () => {};

      const result = doOnce('my-id', el as unknown as HTMLDivElement, callback);

      expect(result).toEqual([]);
    });

    test('adds once attribute after callback', () => {
      const el = document.createElement('div');
      const callback = (element: Element) => {
        expect(element.hasAttribute('data-dom-once')).toBe(false);
      };

      doOnce('my-id', el as unknown as HTMLDivElement, callback);

      expect(el.getAttribute('data-dom-once')).toBe('my-id');
    });
  });

  describe('iterable inputs (NodeList, generators, arrays)', () => {
    test('processes NodeList elements', () => {
      const fragment = document.createDocumentFragment();
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      div1.className = 'test';
      div2.className = 'test';
      fragment.appendChild(div1);
      fragment.appendChild(div2);

      const nodeList =
        (fragment as unknown as Element).querySelectorAll?.('.test') ||
        fragment.querySelectorAll('.test');
      let callbackCount = 0;
      const callback = () => {
        callbackCount++;
      };

      const result = doOnce('my-id', nodeList, callback);

      expect(result).toHaveLength(2);
      expect(callbackCount).toBe(2);
    });

    test('handles generator functions', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');

      function* gen() {
        yield div1;
        yield div2;
      }

      let callbackCount = 0;
      const callback = () => {
        callbackCount++;
      };

      const result = doOnce(
        'my-id',
        gen() as unknown as Iterable<Element>,
        callback,
      );

      expect(result).toHaveLength(2);
      expect(callbackCount).toBe(2);
      expect(div1.getAttribute('data-dom-once')).toBe('my-id');
      expect(div2.getAttribute('data-dom-once')).toBe('my-id');
    });

    test('processes array of elements', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const elements = [div1, div2];

      let callbackCount = 0;
      const callback = () => {
        callbackCount++;
      };

      const result = doOnce(
        'my-id',
        elements as unknown as Element[],
        callback,
      );

      expect(result).toHaveLength(2);
      expect(callbackCount).toBe(2);
    });

    test('skips already marked elements in iterable', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const div3 = document.createElement('div');
      div2.setAttribute('data-dom-once', 'my-id');
      const elements = [div1, div2, div3];

      let callbackCount = 0;
      const callback = () => {
        callbackCount++;
      };

      const result = doOnce(
        'my-id',
        elements as unknown as Element[],
        callback,
      );

      expect(result).toHaveLength(2);
      expect(callbackCount).toBe(2);
      expect(result).toContain(div1);
      expect(result).toContain(div3);
      expect(result).not.toContain(div2);
    });

    test('returns only newly processed elements', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      div1.setAttribute('data-dom-once', 'my-id');
      const elements = [div1, div2];

      const result = doOnce(
        'my-id',
        elements as unknown as Element[],
        () => {},
      );

      expect(result).toEqual([div2]);
    });

    test('ignores non-Element items in iterable', () => {
      const div = document.createElement('div');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mixed: any[] = [div, null, {}, 'string', undefined];
      let callbackCount = 0;
      const callback = () => {
        callbackCount++;
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = doOnce('my-id', mixed as any, callback);

      expect(result).toEqual([div]);
      expect(callbackCount).toBe(1);
    });
  });

  describe('array-like inputs (HTMLCollection)', () => {
    test('processes HTMLCollection elements', () => {
      const container = document.createElement('div');
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      container.appendChild(div1);
      container.appendChild(div2);

      const collection = container.children;
      let callbackCount = 0;
      const callback = () => {
        callbackCount++;
      };

      const result = doOnce(
        'my-id',
        collection as unknown as HTMLCollection,
        callback,
      );

      expect(result).toHaveLength(2);
      expect(callbackCount).toBe(2);
    });

    test('processes array-like object with non-Element values', () => {
      const el1 = document.createElement('div');
      const el2 = document.createElement('div');

      // Create array-like object with mixed values
      const arrayLike = {
        0: el1,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        1: null as any,
        2: el2,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        3: 'string' as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        4: {} as any,
        length: 5,
      };

      let callbackCount = 0;
      const callback = () => {
        callbackCount++;
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = doOnce('my-id', arrayLike as any, callback);

      expect(result).toEqual([el1, el2]);
      expect(callbackCount).toBe(2);
      expect(el1.getAttribute('data-dom-once')).toBe('my-id');
      expect(el2.getAttribute('data-dom-once')).toBe('my-id');
    });

    test('caches length to handle live collections', () => {
      const container = document.createElement('div');
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      container.appendChild(div1);
      container.appendChild(div2);

      const collection = container.children;
      const callback = () => {};

      const result = doOnce(
        'my-id',
        collection as unknown as HTMLCollection,
        callback,
      );

      expect(result).toHaveLength(2);
    });

    test('skips already marked elements', () => {
      const container = document.createElement('div');
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      div1.setAttribute('data-dom-once', 'my-id');
      container.appendChild(div1);
      container.appendChild(div2);

      const collection = container.children;
      let callbackCount = 0;
      const callback = () => {
        callbackCount++;
      };

      const result = doOnce(
        'my-id',
        collection as unknown as HTMLCollection,
        callback,
      );

      expect(result).toHaveLength(1);
      expect(callbackCount).toBe(1);
      expect(result[0]).toBe(div2);
    });

    test('returns only newly processed elements', () => {
      const container = document.createElement('div');
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const div3 = document.createElement('div');
      div1.setAttribute('data-dom-once', 'my-id');
      div3.setAttribute('data-dom-once', 'my-id');
      container.appendChild(div1);
      container.appendChild(div2);
      container.appendChild(div3);

      const collection = container.children;

      const result = doOnce(
        'my-id',
        collection as unknown as HTMLCollection,
        () => {},
      );

      expect(result).toEqual([div2]);
    });
  });

  describe('callback execution behavior', () => {
    test('callback receives element as parameter', () => {
      const el = document.createElement('div');
      let receivedElement: Element | null = null;
      const callback = (element: Element) => {
        receivedElement = element;
      };

      doOnce('my-id', el as unknown as HTMLDivElement, callback);

      expect(receivedElement).toBe(el);
    });

    test('callback called exactly once per new element', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const elements = [div1, div2];
      const callbackElements: Element[] = [];
      const callback = (el: Element) => callbackElements.push(el);

      doOnce('my-id', elements as unknown as Element[], callback);

      expect(callbackElements).toEqual([div1, div2]);
    });

    test('callback NOT called for already marked elements', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      div1.setAttribute('data-dom-once', 'my-id');
      const elements = [div1, div2];
      const callbackElements: Element[] = [];
      const callback = (el: Element) => callbackElements.push(el);

      doOnce('my-id', elements as unknown as Element[], callback);

      expect(callbackElements).toEqual([div2]);
    });

    test('callback executes BEFORE attribute is added', () => {
      const el = document.createElement('div');
      let hadAttributeDuringCallback = false;
      const callback = (element: Element) => {
        hadAttributeDuringCallback = element.hasAttribute('data-dom-once');
      };

      doOnce('my-id', el as unknown as HTMLDivElement, callback);

      expect(hadAttributeDuringCallback).toBe(false);
      expect(el.hasAttribute('data-dom-once')).toBe(true);
    });

    test('callback execution order matches element order', () => {
      document.body.innerHTML =
        '<div id="first" class="test"></div><div id="second" class="test"></div><div id="third" class="test"></div>';
      const order: string[] = [];
      const callback = (el: Element) => order.push(el.id);

      doOnce('my-id', '.test', callback, {
        context: document as unknown as Document,
      });

      expect(order).toEqual(['first', 'second', 'third']);
    });

    test('callback can mutate element safely', () => {
      const el = document.createElement('div');
      const callback = (element: Element) => {
        element.setAttribute('data-modified', 'true');
        element.classList.add('processed');
      };

      doOnce('my-id', el as unknown as HTMLDivElement, callback);

      expect(el.getAttribute('data-modified')).toBe('true');
      expect(el.classList.contains('processed')).toBe(true);
      expect(el.getAttribute('data-dom-once')).toBe('my-id');
    });

    test('errors in callback are propagated', () => {
      const el = document.createElement('div');
      const callback = () => {
        throw new Error('Callback error');
      };

      expect(() =>
        doOnce('my-id', el as unknown as HTMLDivElement, callback),
      ).toThrow('Callback error');
    });
  });

  describe('return values', () => {
    test('returns array of processed elements', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const elements = [div1, div2];

      const result = doOnce(
        'my-id',
        elements as unknown as Element[],
        () => {},
      );

      expect(result).toEqual([div1, div2]);
      expect(Array.isArray(result)).toBe(true);
    });

    test('returns empty array when no new elements', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      div1.setAttribute('data-dom-once', 'my-id');
      div2.setAttribute('data-dom-once', 'my-id');
      const elements = [div1, div2];

      const result = doOnce(
        'my-id',
        elements as unknown as Element[],
        () => {},
      );

      expect(result).toEqual([]);
    });

    test('returns only elements where callback executed', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const div3 = document.createElement('div');
      div2.setAttribute('data-dom-once', 'my-id');
      const elements = [div1, div2, div3];
      const processedElements: Element[] = [];
      const callback = (el: Element) => processedElements.push(el);

      const result = doOnce(
        'my-id',
        elements as unknown as Element[],
        callback,
      );

      expect(result).toEqual(processedElements);
      expect(result).toEqual([div1, div3]);
    });

    test('returned elements have once attribute added', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const elements = [div1, div2];

      const result = doOnce(
        'my-id',
        elements as unknown as Element[],
        () => {},
      );

      expect(
        result.every((el) => el.getAttribute('data-dom-once') === 'my-id'),
      ).toBe(true);
    });
  });

  describe('custom options', () => {
    test('uses default onceAttribute when not provided', () => {
      const el = document.createElement('div');

      doOnce('my-id', el as unknown as HTMLDivElement, () => {});

      expect(el.getAttribute('data-dom-once')).toBe('my-id');
    });

    test('uses custom onceAttribute when provided', () => {
      const el = document.createElement('div');

      doOnce('my-id', el as unknown as HTMLDivElement, () => {}, {
        onceAttribute: 'data-custom',
      });

      expect(el.getAttribute('data-custom')).toBe('my-id');
      expect(el.hasAttribute('data-dom-once')).toBe(false);
    });

    test('respects custom context for string selectors', () => {
      const fragment = document.createDocumentFragment();
      const div = document.createElement('div');
      div.className = 'test';
      fragment.appendChild(div);

      let callbackExecuted = false;
      const callback = () => {
        callbackExecuted = true;
      };

      const result = doOnce('my-id', '.test', callback, {
        context: fragment as unknown as DocumentFragment,
      });

      expect(result).toHaveLength(1);
      expect(callbackExecuted).toBe(true);
    });

    test('partial options work correctly', () => {
      const el = document.createElement('div');

      // Only onceAttribute
      doOnce('id-1', el as unknown as HTMLDivElement, () => {}, {
        onceAttribute: 'data-custom',
      });
      expect(el.getAttribute('data-custom')).toBe('id-1');

      // Only context (for string selector)
      document.body.innerHTML = '<div class="test"></div>';
      const result = doOnce('id-2', '.test', () => {}, {
        context: document as unknown as Document,
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('multiple once IDs on same elements', () => {
    test('different onceIds can be added to same element', () => {
      const el = document.createElement('div');

      doOnce('first-id', el as unknown as HTMLDivElement, () => {});
      doOnce('second-id', el as unknown as HTMLDivElement, () => {});

      const onceAttr = el.getAttribute('data-dom-once');
      expect(onceAttr).toContain('first-id');
      expect(onceAttr).toContain('second-id');
    });

    test('callback executes for each new onceId', () => {
      const el = document.createElement('div');
      let callbackCount = 0;
      const callback = () => {
        callbackCount++;
      };

      doOnce('first-id', el as unknown as HTMLDivElement, callback);
      doOnce('second-id', el as unknown as HTMLDivElement, callback);

      expect(callbackCount).toBe(2);
    });

    test('same onceId prevents re-execution', () => {
      const el = document.createElement('div');
      let callbackCount = 0;
      const callback = () => {
        callbackCount++;
      };

      doOnce('my-id', el as unknown as HTMLDivElement, callback);
      doOnce('my-id', el as unknown as HTMLDivElement, callback);
      doOnce('my-id', el as unknown as HTMLDivElement, callback);

      expect(callbackCount).toBe(1);
    });
  });

  describe('edge cases', () => {
    test('empty array returns []', () => {
      const callback = () => {};
      const result = doOnce('my-id', [] as unknown as Element[], callback);
      expect(result).toEqual([]);
    });

    test('empty iterable returns []', () => {
      function* gen() {
        // Empty generator
      }
      const callback = () => {};
      const result = doOnce(
        'my-id',
        gen() as unknown as Iterable<Element>,
        callback,
      );
      expect(result).toEqual([]);
    });

    test('mixed Element/non-Element in iterable (skips non-Elements)', () => {
      const div = document.createElement('div');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mixed: any[] = [null, div, undefined, 'string', {}];
      let callbackCount = 0;
      const callback = () => {
        callbackCount++;
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = doOnce('my-id', mixed as any, callback);

      expect(result).toEqual([div]);
      expect(callbackCount).toBe(1);
    });

    test('callback that throws error propagates', () => {
      const el = document.createElement('div');
      const callback = () => {
        throw new Error('Test error');
      };

      expect(() =>
        doOnce('my-id', el as unknown as HTMLDivElement, callback),
      ).toThrow('Test error');
    });

    test('callback that modifies DOM', () => {
      document.body.innerHTML = '<div class="test"></div>';
      const callback = (el: Element) => {
        const newDiv = document.createElement('div');
        newDiv.className = 'added';
        el.appendChild(newDiv as unknown as HTMLDivElement);
      };

      doOnce('my-id', '.test', callback, {
        context: document as unknown as Document,
      });

      const testDiv = document.querySelector('.test')!;
      expect(testDiv.querySelector('.added')).not.toBeNull();
    });

    test('callback that removes the element being processed', () => {
      document.body.innerHTML = '<div class="test"></div>';
      const callback = (el: Element) => {
        el.remove();
      };

      const result = doOnce('my-id', '.test', callback, {
        context: document as unknown as Document,
      });

      expect(result).toHaveLength(1);
      expect(document.querySelector('.test')).toBeNull();
    });

    test('no selector match returns []', () => {
      document.body.innerHTML = '<div class="other"></div>';
      const callback = () => {};

      const result = doOnce('my-id', '.test', callback, {
        context: document as unknown as Document,
      });

      expect(result).toEqual([]);
    });

    test('works with attribute selectors', () => {
      document.body.innerHTML = '<input type="text" data-test="value">';
      let callbackExecuted = false;
      const callback = () => {
        callbackExecuted = true;
      };

      const result = doOnce('my-id', 'input[data-test="value"]', callback, {
        context: document as unknown as Document,
      });

      expect(result).toHaveLength(1);
      expect(callbackExecuted).toBe(true);
    });
  });
});
