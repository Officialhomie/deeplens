/** Message type constants (TRD §2.2) */
export const MESSAGE = {
  QUERY: 'DEEPLENS_QUERY',
  ABORT: 'DEEPLENS_ABORT',
  TOKEN: 'DEEPLENS_TOKEN',
  OPEN_SETTINGS: 'DEEPLENS_OPEN_SETTINGS',
} as const;

export type QueryMode = 'quick' | 'deep' | 'links';
export type TriggerMode = 'hover' | 'select';
export type DomainCategory =
  | 'technical'
  | 'academic'
  | 'news'
  | 'social'
  | 'general';
export type DeepLensTheme = 'light' | 'dark';
export type ExtensionState =
  | 'idle'
  | 'loading'
  | 'streaming'
  | 'done'
  | 'error';

export interface QueryPayload {
  mode: QueryMode;
  context: ExtractedContext;
  triggeredBy: TriggerMode;
  /** Random UUID per extension session — abort routing */
  sessionId: string;
  /** Unique id per lookup — tokens must match or are dropped */
  queryId: string;
}

export interface ExtractedContext {
  selectedText: string;
  sentenceContext: string;
  paragraphContext: string;
  headingContext: string | null;
  pageTitle: string;
  pageURL: string;
  pageDomain: string;
  domainCategory: DomainCategory;
}

export interface TooltipState {
  isVisible: boolean;
  isPinned: boolean;
  currentMode: QueryMode;
  streamBuffer: string;
  status: ExtensionState;
  error: string | null;
  triggerRect: DOMRect | null;
  theme: DeepLensTheme;
}

export interface TokenMessage {
  type: typeof MESSAGE.TOKEN;
  queryId?: string;
  token?: string;
  done?: boolean;
  error?: string;
}

export interface QueryMessage {
  type: typeof MESSAGE.QUERY;
  payload: QueryPayload;
}

export interface AbortMessage {
  type: typeof MESSAGE.ABORT;
  sessionId?: string;
}

export type ExtensionMessage = TokenMessage | QueryMessage | AbortMessage;

export function isQueryMessage(msg: unknown): msg is QueryMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as QueryMessage).type === MESSAGE.QUERY &&
    typeof (msg as QueryMessage).payload === 'object'
  );
}

export function isAbortMessage(msg: unknown): msg is AbortMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as AbortMessage).type === MESSAGE.ABORT
  );
}

export function isTokenMessage(msg: unknown): msg is TokenMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as TokenMessage).type === MESSAGE.TOKEN
  );
}
