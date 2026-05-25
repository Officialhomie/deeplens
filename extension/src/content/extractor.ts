import type { DomainCategory, ExtractedContext } from '../shared/types';
import type { TriggerPayload } from './detector';

const BLOCK_SELECTOR =
  'p, li, td, th, blockquote, article, section, main, div';

const DOMAIN_PATTERNS: Record<Exclude<DomainCategory, 'general'>, RegExp> = {
  technical:
    /github\.com|stackoverflow\.com|docs\.|developer\.|mdn\.|npmjs|crates\.io/i,
  academic:
    /arxiv\.org|scholar\.google|jstor|pubmed|researchgate|semanticscholar|\.edu/i,
  news:
    /cnn|bbc|techcrunch|theverge|wired|bloomberg|reuters|guardian|medium\.com/i,
  social:
    /twitter\.com|x\.com|reddit\.com|linkedin\.com|substack\.com/i,
};

const HEADING_SELECTOR = 'h1, h2, h3, h4';

export function categorizeDomain(hostname: string): DomainCategory {
  const ordered: Exclude<DomainCategory, 'general'>[] = [
    'technical',
    'academic',
    'news',
    'social',
  ];
  for (const cat of ordered) {
    if (DOMAIN_PATTERNS[cat].test(hostname)) return cat;
  }
  return 'general';
}

/** @deprecated Use categorizeDomain */
export function inferDomainCategory(hostname: string): DomainCategory {
  return categorizeDomain(hostname);
}

function findBlockContainer(node: Node | null): Element | null {
  if (!node) return null;
  const el =
    node instanceof Element ? node : node.parentElement;
  return el?.closest(BLOCK_SELECTOR) ?? null;
}

function caretRangeFromPoint(x: number, y: number): Range | null {
  if (document.caretRangeFromPoint) {
    return document.caretRangeFromPoint(x, y);
  }
  const pos = document.caretPositionFromPoint?.(x, y);
  if (!pos) return null;
  const range = document.createRange();
  range.setStart(pos.offsetNode, pos.offset);
  range.setEnd(pos.offsetNode, pos.offset);
  return range;
}

export function getNodeForTrigger(trigger: TriggerPayload): Node | null {
  if (trigger.mode === 'select') {
    return window.getSelection()?.anchorNode ?? null;
  }
  const x = trigger.rect.left + trigger.rect.width / 2;
  const y = trigger.rect.top + trigger.rect.height / 2;
  return caretRangeFromPoint(x, y)?.startContainer ?? null;
}

/**
 * TRD §4.2 — sentence containing target word, or 200-char window fallback.
 */
export function extractSentenceFromText(
  rawText: string,
  targetWord: string,
): string {
  const normalized = rawText.replace(/\s+/g, ' ').trim();
  if (!normalized) return targetWord;

  const sentences = normalized.match(/[^.!?]*(?:[.!?]|$)/g) ?? [];
  const lower = targetWord.toLowerCase();
  const match = sentences.find((s) => s.toLowerCase().includes(lower));

  if (match && match.trim().length > 10) {
    return match.trim().slice(0, 300);
  }

  const idx = normalized.toLowerCase().indexOf(lower);
  if (idx === -1) return targetWord;

  const start = Math.max(0, idx - 100);
  const end = Math.min(normalized.length, idx + targetWord.length + 100);
  return normalized.slice(start, end).trim();
}

export function extractSentence(node: Node | null, targetWord: string): string {
  const container = findBlockContainer(node);
  const rawText =
    container?.textContent?.replace(/\s+/g, ' ').trim() ||
    (typeof document !== 'undefined'
      ? document.body?.innerText?.slice(0, 2000) ?? ''
      : '');
  return extractSentenceFromText(rawText, targetWord);
}

export function extractParagraph(node: Node | null): string {
  const container = findBlockContainer(node);
  const raw = container?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  return raw.slice(0, 300);
}

function headingText(el: Element): string | null {
  const text = el.textContent?.replace(/\s+/g, ' ').trim();
  if (!text) return null;
  return text.slice(0, 200);
}

export function extractHeading(node: Node | null): string | null {
  if (!node) return null;
  const el = node instanceof Element ? node : node.parentElement;
  if (!el) return null;

  const inSubtree = el.closest(HEADING_SELECTOR);
  if (inSubtree) return headingText(inSubtree);

  let block: Element | null = el.closest(BLOCK_SELECTOR) ?? el;
  while (block) {
    let prev: Element | null = block;
    while (prev) {
      prev = prev.previousElementSibling;
      if (!prev) break;
      if (prev.matches(HEADING_SELECTOR)) return headingText(prev);
      const nested = prev.querySelector(HEADING_SELECTOR);
      if (nested) return headingText(nested);
    }
    block = block.parentElement;
  }
  return null;
}

export function extractContext(trigger: TriggerPayload): ExtractedContext {
  const selectedText = trigger.text.trim();
  const node = getNodeForTrigger(trigger);
  const hostname =
    typeof location !== 'undefined' ? location.hostname : '';

  return {
    selectedText,
    sentenceContext: extractSentence(node, selectedText),
    paragraphContext: extractParagraph(node),
    headingContext: extractHeading(node),
    pageTitle: typeof document !== 'undefined' ? document.title : '',
    pageURL: typeof location !== 'undefined' ? location.href : '',
    pageDomain: hostname,
    domainCategory: categorizeDomain(hostname),
  };
}

export function createEmptyContext(): ExtractedContext {
  return {
    selectedText: '',
    sentenceContext: '',
    paragraphContext: '',
    headingContext: null,
    pageTitle: typeof document !== 'undefined' ? document.title : '',
    pageURL: typeof location !== 'undefined' ? location.href : '',
    pageDomain: typeof location !== 'undefined' ? location.hostname : '',
    domainCategory: categorizeDomain(
      typeof location !== 'undefined' ? location.hostname : '',
    ),
  };
}
