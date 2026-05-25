// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { safeRenderMarkdown, sanitizeUrl } from '../../src/content/sanitize';

describe('sanitizeUrl', () => {
  it('allows https URLs', () => {
    expect(sanitizeUrl('https://example.com/path')).toBe('https://example.com/path');
  });

  it('rejects javascript and relative URLs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
    expect(sanitizeUrl('/local/path')).toBeNull();
    expect(sanitizeUrl('data:text/html,evil')).toBeNull();
  });
});

describe('safeRenderMarkdown', () => {
  it('preserves allowed formatting', () => {
    const html = safeRenderMarkdown('**Bold** and [link](https://safe.test)');
    expect(html).toContain('<strong>Bold</strong>');
    expect(html).toContain('href="https://safe.test"');
  });

  it('escapes raw HTML and strips disallowed tags', () => {
    const html = safeRenderMarkdown(
      '<img src=x onerror=alert(1)><script>alert(1)</script>**ok**',
    );
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/<img/i);
    expect(html).toContain('&lt;img');
    expect(html).toContain('<strong>ok</strong>');
  });
});
