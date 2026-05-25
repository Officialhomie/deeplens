/** Per-tab active query tracking — stale token prevention */

const activeQueryByTab = new Map<number, string>();

export function resetStreamSessionsForTests(): void {
  activeQueryByTab.clear();
}

export function beginQuery(tabId: number, queryId: string): void {
  activeQueryByTab.set(tabId, queryId);
}

export function invalidateQuery(tabId: number): void {
  activeQueryByTab.delete(tabId);
}

export function isActiveQuery(tabId: number, queryId: string): boolean {
  return activeQueryByTab.get(tabId) === queryId;
}
