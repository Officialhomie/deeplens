import type { DomainCategory, ExtractedContext } from '../shared/types';

/** Phase 3: full DOM context extraction */
export function createEmptyContext(): ExtractedContext {
  return {
    selectedText: '',
    sentenceContext: '',
    paragraphContext: '',
    headingContext: null,
    pageTitle: document.title,
    pageURL: location.href,
    pageDomain: location.hostname,
    domainCategory: inferDomainCategory(location.hostname),
  };
}

export function inferDomainCategory(hostname: string): DomainCategory {
  if (/github\.com|stackoverflow|docs\.|developer\./i.test(hostname)) {
    return 'technical';
  }
  if (/arxiv|edu|scholar/i.test(hostname)) return 'academic';
  if (/twitter\.com|x\.com|linkedin/i.test(hostname)) return 'social';
  if (/news|bbc|reuters|medium|substack/i.test(hostname)) return 'news';
  return 'general';
}
