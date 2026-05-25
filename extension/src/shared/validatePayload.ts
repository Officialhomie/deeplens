import type { DomainCategory, QueryMode, QueryPayload, TriggerMode } from './types';

const MAX_SELECTED = 500;
const MAX_SENTENCE = 2000;
const MAX_PARAGRAPH = 500;
const MAX_PAGE_META = 500;
const SECRET_PATTERN = /sk-ant[a-z0-9_-]{10,}/i;

const MODES: QueryMode[] = ['quick', 'deep', 'links'];
const TRIGGERS: TriggerMode[] = ['hover', 'select'];
const CATEGORIES: DomainCategory[] = [
  'technical',
  'academic',
  'news',
  'social',
  'general',
];

function isNonEmptyString(v: unknown, max: number): v is string {
  return typeof v === 'string' && v.length > 0 && v.length <= max;
}

function hasNoSecrets(value: string): boolean {
  return !SECRET_PATTERN.test(value);
}

/** TRD §8 — reject malformed or oversize client payloads */
export function validateQueryPayload(payload: unknown): payload is QueryPayload {
  if (!payload || typeof payload !== 'object') return false;

  const p = payload as QueryPayload;
  if (!MODES.includes(p.mode)) return false;
  if (!TRIGGERS.includes(p.triggeredBy)) return false;
  if (!isNonEmptyString(p.sessionId, 64)) return false;
  if (!isNonEmptyString(p.queryId, 64)) return false;

  const c = p.context;
  if (!c || typeof c !== 'object') return false;
  if (!isNonEmptyString(c.selectedText, MAX_SELECTED)) return false;
  if (typeof c.sentenceContext !== 'string' || c.sentenceContext.length > MAX_SENTENCE) {
    return false;
  }
  if (typeof c.paragraphContext !== 'string' || c.paragraphContext.length > MAX_PARAGRAPH) {
    return false;
  }
  if (c.headingContext !== null && typeof c.headingContext !== 'string') return false;
  if (c.headingContext && c.headingContext.length > 300) return false;
  if (!isNonEmptyString(c.pageTitle, MAX_PAGE_META)) return false;
  if (!isNonEmptyString(c.pageURL, MAX_PAGE_META)) return false;
  if (!isNonEmptyString(c.pageDomain, 253)) return false;
  if (!CATEGORIES.includes(c.domainCategory)) return false;

  if (!hasNoSecrets(JSON.stringify(p))) return false;

  return true;
}

export function assertPayloadHasNoSecrets(payload: QueryPayload): void {
  if (!hasNoSecrets(JSON.stringify(payload))) {
    throw new Error('Query payload must not contain API key material');
  }
}
