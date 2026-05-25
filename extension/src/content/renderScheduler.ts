/** Coalesce stream DOM updates to one paint per frame (Phase 8) */

let rafId: number | null = null;
let pendingRender: (() => void) | null = null;

export function scheduleRender(fn: () => void): void {
  pendingRender = fn;
  if (rafId !== null) return;
  rafId = requestAnimationFrame(() => {
    rafId = null;
    const run = pendingRender;
    pendingRender = null;
    run?.();
  });
}

export function cancelScheduledRender(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  pendingRender = null;
}

export function resetRenderSchedulerForTests(): void {
  cancelScheduledRender();
}
