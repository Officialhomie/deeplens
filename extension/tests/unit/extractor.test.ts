/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest';
import {
  categorizeDomain,
  extractContext,
  extractHeading,
  extractParagraph,
  extractSentenceFromText,
} from '../../src/content/extractor';

describe('extractSentenceFromText', () => {
  it('returns the sentence containing the target word', () => {
    const text =
      'First sentence here. The eigenvalue problem is central. Third bit.';
    expect(extractSentenceFromText(text, 'eigenvalue')).toContain('eigenvalue');
    expect(extractSentenceFromText(text, 'eigenvalue')).toContain('central');
  });

  it('falls back to window when no sentence boundary match', () => {
    const text = 'nodotsonly eigenvalue text continues';
    const result = extractSentenceFromText(text, 'eigenvalue');
    expect(result.toLowerCase()).toContain('eigenvalue');
  });

  it('handles very long text with 300-char cap on matched sentence', () => {
    const long = `${'A'.repeat(400)}. Target word appears here in a long sentence that should be trimmed.`;
    const result = extractSentenceFromText(long, 'Target');
    expect(result.length).toBeLessThanOrEqual(300);
  });

  it('handles special characters in text and target', () => {
    const text = 'Cost is $100 (USD). The C++ ABI matters.';
    expect(extractSentenceFromText(text, 'C++')).toContain('C++');
  });

  it('finds first sentence among multiple matches', () => {
    const text = 'Alpha beta here. Alpha beta again. Alpha beta third.';
    const result = extractSentenceFromText(text, 'Alpha');
    expect(result).toContain('Alpha');
    expect(result).not.toContain('third');
  });

  it('supports non-Latin characters', () => {
    const text = '前文です。日本語のテスト文が続きます。後文。';
    expect(extractSentenceFromText(text, '日本語')).toContain('日本語');
  });

  it('extracts from code-like raw text', () => {
    const text =
      'function run() { return true; } The eigenvalue is used in linear algebra.';
    expect(extractSentenceFromText(text, 'eigenvalue')).toContain('eigenvalue');
  });

  it('returns target word when body text is empty', () => {
    expect(extractSentenceFromText('', 'fallback')).toBe('fallback');
  });
});

describe('categorizeDomain', () => {
  it('classifies known hosts', () => {
    expect(categorizeDomain('github.com')).toBe('technical');
    expect(categorizeDomain('arxiv.org')).toBe('academic');
    expect(categorizeDomain('bbc.co.uk')).toBe('news');
    expect(categorizeDomain('x.com')).toBe('social');
    expect(categorizeDomain('example.org')).toBe('general');
  });
});

describe('extractHeading', () => {
  it('finds nearest heading ancestor', () => {
    document.body.innerHTML = `
      <h2 id="h">Linear Algebra</h2>
      <p id="p">The <span id="s">eigenvalue</span> is key.</p>
    `;
    const span = document.getElementById('s')!;
    expect(extractHeading(span)).toBe('Linear Algebra');
  });
});

describe('extractParagraph', () => {
  it('returns up to 300 chars from block container', () => {
    document.body.innerHTML = `<p id="p">${'word '.repeat(80)}</p>`;
    const p = document.getElementById('p')!;
    const para = extractParagraph(p);
    expect(para.length).toBeLessThanOrEqual(300);
    expect(para.length).toBeGreaterThan(50);
  });
});

describe('extractContext', () => {
  it('builds full context from selection trigger', () => {
    document.title = 'Article Title';
    document.body.innerHTML = `
      <h1>Article Title</h1>
      <p>The eigenvalue decomposition simplifies matrices.</p>
    `;
    const p = document.querySelector('p')!;
    const range = document.createRange();
    range.selectNodeContents(p);
    const sel = window.getSelection()!;
    sel.removeAllRanges();
    sel.addRange(range);

    const rect = range.getBoundingClientRect();
    const ctx = extractContext({
      text: 'eigenvalue',
      mode: 'select',
      rect,
    });

    expect(ctx.selectedText).toBe('eigenvalue');
    expect(ctx.sentenceContext.toLowerCase()).toContain('eigenvalue');
    expect(ctx.pageTitle).toBeTruthy();
    expect(ctx.domainCategory).toBe('general');
  });
});
