import type { TooltipState } from '../shared/types';

/** In-memory session state (TRD §7.1) */
export const tooltipState: TooltipState = {
  isVisible: false,
  isPinned: false,
  currentMode: 'deep',
  streamBuffer: '',
  status: 'idle',
  error: null,
  triggerRect: null,
  theme: 'light',
};

/** Phase 5: tooltip create/position/destroy */
export function initTooltip(): void {
  // Wired in Phase 5
}
