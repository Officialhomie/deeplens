import type { DeepLensTheme } from '../shared/types';

/** TRD §4.3 + design brief §3 — adaptive tooltip theme */
export function detectPageTheme(): DeepLensTheme {
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  try {
    const bg = window.getComputedStyle(document.body).backgroundColor;
    const rgb = bg.match(/\d+/g)?.map(Number);
    if (rgb && rgb.length >= 3) {
      const luminance =
        (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
      return luminance < 0.4 ? 'dark' : 'light';
    }
  } catch {
    /* cross-origin style access */
  }
  return 'light';
}
