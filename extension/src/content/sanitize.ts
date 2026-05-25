import DOMPurify from 'dompurify';
import { renderMarkdown } from './streamRenderer';

const PURIFY_CONFIG = {
  ALLOWED_TAGS: ['strong', 'em', 'a', 'ul', 'li', 'p', 'br'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
};

/** TRD §8.4 — sanitize streamed HTML before innerHTML */
export function safeRenderMarkdown(text: string): string {
  const raw = renderMarkdown(text);
  return DOMPurify.sanitize(raw, PURIFY_CONFIG);
}

export function sanitizeUrl(href: string): string | null {
  const trimmed = href.trim();
  if (!/^https?:\/\//i.test(trimmed)) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.href;
  } catch {
    return null;
  }
}
