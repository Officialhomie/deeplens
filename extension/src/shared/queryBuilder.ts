import type {
  ExtractedContext,
  QueryMode,
  QueryPayload,
  TriggerMode,
} from './types';

/** v1.0 ships Quick + Deep only (Links deferred v1.5) */
export const V1_QUERY_MODES: readonly QueryMode[] = ['quick', 'deep'];

export function resolveQueryMode(mode: QueryMode): QueryMode {
  if (mode === 'quick' || mode === 'deep') return mode;
  return 'deep';
}

export function buildQueryPayload(
  context: ExtractedContext,
  mode: QueryMode,
  triggeredBy: TriggerMode,
  sessionId: string,
  queryId: string,
): QueryPayload {
  return {
    mode: resolveQueryMode(mode),
    context,
    triggeredBy,
    sessionId,
    queryId,
  };
}
