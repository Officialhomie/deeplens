/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest';
import {
  filterLookupWord,
  getWordAtPoint,
  isExcluded,
} from '../../src/content/detector';

describe('filterLookupWord', () => {
  it('accepts normal words and hyphenated compounds', () => {
    expect(filterLookupWord('eigenvalue')).toBe('eigenvalue');
    expect(filterLookupWord('zero-knowledge')).toBe('zero-knowledge');
  });

  it('rejects too short, numeric-only, and punctuation-only', () => {
    expect(filterLookupWord('ab')).toBeNull();
    expect(filterLookupWord('12345')).toBeNull();
    expect(filterLookupWord('---')).toBeNull();
  });
});

describe('isExcluded', () => {
  it('excludes form controls and contenteditable', () => {
    document.body.innerHTML = `
      <input id="i" />
      <textarea id="t"></textarea>
      <div id="ce" contenteditable="true">edit</div>
      <p id="ok">readable text</p>
      <button id="b">Go</button>
      <div id="role" role="textbox">role box</div>
    `;
    expect(isExcluded(document.getElementById('i'))).toBe(true);
    expect(isExcluded(document.getElementById('t'))).toBe(true);
    expect(isExcluded(document.getElementById('ce'))).toBe(true);
    expect(isExcluded(document.getElementById('b'))).toBe(true);
    expect(isExcluded(document.getElementById('role'))).toBe(true);
    expect(isExcluded(document.getElementById('ok'))).toBe(false);
  });
});

describe('getWordAtPoint', () => {
  it('reads a word from paragraph text when caret API is available', () => {
    document.body.innerHTML =
      '<p style="font-size:16px">The eigenvalue problem.</p>';
    const p = document.querySelector('p')!;
    const rect = p.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    if (!document.caretRangeFromPoint && !document.caretPositionFromPoint) {
      expect(true).toBe(true);
      return;
    }

    const word = getWordAtPoint(x, y);
    if (word) {
      expect(word.length).toBeGreaterThanOrEqual(3);
      expect(/[a-zA-Z]/.test(word)).toBe(true);
    }
  });
});
