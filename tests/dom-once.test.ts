// @vitest-environment happy-dom

import { expect, test, describe } from 'vitest';
import { querySelectorOnce } from '../src/dom-once';
import { Window } from 'happy-dom';

const window = new Window({url: 'https://localhost:8080'});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const document = window.document;

describe('querySelectorOnce', () => {
  test('Once ID cannot be null, undefined, or empty', ()=>{
    // @ts-expect-error - Testing null input
    expect(() => querySelectorOnce(null, 'div')).toThrow('Once ID cannot be null, undefined, or empty');
    // @ts-expect-error - Testing undefined input
    expect(() => querySelectorOnce(undefined, 'div')).toThrow('Once ID cannot be null, undefined, or empty');
    expect(() => querySelectorOnce('', 'div')).toThrow('Once ID cannot be null, undefined, or empty');
  });

  test('Valid once ID: Must contain only letters, numbers, underscores, and hyphens', ()=>{
    expect(() => querySelectorOnce('abc 123', 'div')).toThrow('Invalid once ID: "abc 123". Must contain only letters, numbers, underscores, and hyphens');
  });

});
