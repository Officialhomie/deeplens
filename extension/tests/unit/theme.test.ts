/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest';
import { detectPageTheme } from '../../src/content/theme';

describe('detectPageTheme', () => {
  it('returns dark when prefers-color-scheme is dark', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: query.includes('dark'),
        media: query,
      }),
    });
    expect(detectPageTheme()).toBe('dark');
  });

  it('returns light for light preference and light body', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: () => ({ matches: false, media: '' }),
    });
    document.body.style.backgroundColor = 'rgb(255, 255, 255)';
    expect(detectPageTheme()).toBe('light');
  });
});
