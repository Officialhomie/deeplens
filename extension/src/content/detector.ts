import type { TriggerMode } from '../shared/types';

export interface DetectorConfig {
  hoverDelayMs: number;
  selectionEnabled: boolean;
  hoverEnabled: boolean;
  isEnabled: boolean;
}

export interface TriggerPayload {
  text: string;
  mode: TriggerMode;
  rect: DOMRect;
}

export type TriggerHandler = (payload: TriggerPayload) => void;
export type AbortHandler = () => void;

export interface DetectorOptions {
  getConfig: () => Promise<DetectorConfig & { blacklistedDomains: string[] }>;
  onTrigger: TriggerHandler;
  onAbort: AbortHandler;
}

const EXCLUDED_TAGS = new Set([
  'INPUT',
  'TEXTAREA',
  'SELECT',
  'BUTTON',
  'A',
  'CODE',
  'PRE',
]);

const EXCLUDED_ROLES = new Set([
  'textbox',
  'searchbox',
  'combobox',
  'spinbutton',
]);

const MOVE_THRESHOLD_PX = 5;
const MIN_SELECTION_LEN = 3;
const MAX_SELECTION_LEN = 500;

/** TRD §4.1 — reject short, numeric-only, or letterless tokens */
export function filterLookupWord(word: string): string | null {
  const trimmed = word.trim();
  if (trimmed.length < 3 || /^\d+$/.test(trimmed) || !/[a-zA-Z]/.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export function isExcluded(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  if (EXCLUDED_TAGS.has(target.tagName)) return true;
  const role = target.getAttribute('role');
  if (role && EXCLUDED_ROLES.has(role)) return true;
  if (target instanceof HTMLElement && target.isContentEditable) return true;
  return !!target.closest(
    '[contenteditable="true"], [role="textbox"], [role="searchbox"]',
  );
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

export function getWordAtPoint(x: number, y: number): string | null {
  const range = caretRangeFromPoint(x, y);
  if (!range) return null;
  try {
    const expandable = range as Range & { expand?: (unit: string) => void };
    if (typeof expandable.expand !== 'function') return null;
    expandable.expand('word');
  } catch {
    return null;
  }
  return filterLookupWord(range.toString());
}

function isDomainBlocked(hostname: string, list: string[]): boolean {
  return list.some(
    (d) => hostname === d || hostname.endsWith(`.${d}`),
  );
}

function distance(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}

let abortBeforeStream = false;

/** Called when first stream token arrives — stop abort-on-leave (TRD §4.1) */
export function notifyStreamStarted(): void {
  abortBeforeStream = false;
}

export function initDetector(options: DetectorOptions): () => void {
  let hoverTimer: ReturnType<typeof setTimeout> | null = null;
  let anchorX = 0;
  let anchorY = 0;
  let hoverWord: string | null = null;
  let activeHoverTarget: Element | null = null;

  const clearHoverTimer = (): void => {
    if (hoverTimer !== null) {
      clearTimeout(hoverTimer);
      hoverTimer = null;
    }
  };

  const abortIfPending = (): void => {
    if (abortBeforeStream) {
      options.onAbort();
      abortBeforeStream = false;
    }
  };

  const fireTrigger = (payload: TriggerPayload): void => {
    options.onAbort();
    abortBeforeStream = true;
    options.onTrigger(payload);
  };

  const onMouseOver = (e: MouseEvent): void => {
    void options.getConfig().then((config) => {
      if (!config.isEnabled || !config.hoverEnabled) return;
      if (isDomainBlocked(location.hostname, config.blacklistedDomains)) return;
      if (isExcluded(e.target)) return;

      const word = getWordAtPoint(e.clientX, e.clientY);
      if (!word) {
        clearHoverTimer();
        return;
      }

      if (
        hoverWord === word &&
        activeHoverTarget === e.target &&
        hoverTimer !== null
      ) {
        return;
      }

      clearHoverTimer();
      abortIfPending();

      hoverWord = word;
      activeHoverTarget = e.target instanceof Element ? e.target : null;
      anchorX = e.clientX;
      anchorY = e.clientY;

      hoverTimer = setTimeout(() => {
        hoverTimer = null;
        const rect = new DOMRect(anchorX, anchorY, 1, 1);
        fireTrigger({ text: word, mode: 'hover', rect });
      }, config.hoverDelayMs);
    });
  };

  const onMouseMove = (e: MouseEvent): void => {
    if (hoverTimer === null) return;
    if (distance(anchorX, anchorY, e.clientX, e.clientY) > MOVE_THRESHOLD_PX) {
      clearHoverTimer();
      hoverWord = null;
      activeHoverTarget = null;
      abortIfPending();
    }
  };

  const onMouseOut = (): void => {
    clearHoverTimer();
    hoverWord = null;
    activeHoverTarget = null;
    abortIfPending();
  };

  const onMouseUp = (): void => {
    void options.getConfig().then((config) => {
      if (!config.isEnabled || !config.selectionEnabled) return;
      if (isDomainBlocked(location.hostname, config.blacklistedDomains)) return;

      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (!text || text.length < MIN_SELECTION_LEN || text.length > MAX_SELECTION_LEN) {
        return;
      }

      const anchor = selection?.anchorNode?.parentElement ?? null;
      if (isExcluded(anchor)) return;

      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
      const rect = range?.getBoundingClientRect();
      if (!rect || (rect.width === 0 && rect.height === 0)) return;

      clearHoverTimer();
      fireTrigger({ text, mode: 'select', rect });
    });
  };

  document.addEventListener('mouseover', onMouseOver, true);
  document.addEventListener('mousemove', onMouseMove, true);
  document.addEventListener('mouseout', onMouseOut, true);
  window.addEventListener('mouseup', onMouseUp);

  return () => {
    clearHoverTimer();
    document.removeEventListener('mouseover', onMouseOver, true);
    document.removeEventListener('mousemove', onMouseMove, true);
    document.removeEventListener('mouseout', onMouseOut, true);
    window.removeEventListener('mouseup', onMouseUp);
  };
}
