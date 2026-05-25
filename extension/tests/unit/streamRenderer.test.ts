import { describe, expect, it } from 'vitest';
import { appendToBuffer, renderMarkdown } from '../../src/content/streamRenderer';

describe('streamRenderer', () => {
  it('appends tokens to buffer', () => {
    expect(appendToBuffer('Hello', ' world')).toBe('Hello world');
  });

  it('renders bold and links', () => {
    const html = renderMarkdown(
      '**What it is**\n\nSee [docs](https://example.com).',
    );
    expect(html).toContain('<strong>What it is</strong>');
    expect(html).toContain('href="https://example.com"');
  });

  it('renders list items', () => {
    const html = renderMarkdown('- Item one\n- Item two');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>Item one</li>');
  });
});
