export type TooltipPlacement = 'above' | 'below';

export interface ViewportSize {
  width: number;
  height: number;
}

export interface PositionInput {
  triggerRect: Pick<DOMRect, 'top' | 'left' | 'right' | 'bottom' | 'width' | 'height'>;
  tooltipWidth: number;
  tooltipHeight: number;
  viewport: ViewportSize;
  offsetPx?: number;
}

export interface PositionResult {
  top: number;
  left: number;
  placement: TooltipPlacement;
}

const DEFAULT_OFFSET = 12;

/**
 * Viewport-aware tooltip anchor (TRD §4.9).
 * Phase 5 will extend for pin mode and narrow viewports.
 */
export function computePosition(input: PositionInput): PositionResult {
  const offset = input.offsetPx ?? DEFAULT_OFFSET;
  const { triggerRect, tooltipWidth, tooltipHeight, viewport } = input;

  let left =
    triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
  left = Math.max(8, Math.min(left, viewport.width - tooltipWidth - 8));

  const spaceBelow = viewport.height - triggerRect.bottom;
  const spaceAbove = triggerRect.top;
  const preferBelow = spaceBelow >= tooltipHeight + offset || spaceBelow >= spaceAbove;

  const placement: TooltipPlacement = preferBelow ? 'below' : 'above';
  const top = preferBelow
    ? triggerRect.bottom + offset
    : triggerRect.top - tooltipHeight - offset;

  return { top, left, placement };
}

const PINNED_WIDTH = 480;
const PINNED_MARGIN = 16;

/** Pinned panel — docked to right viewport edge (design brief §7.5) */
export function computePinnedPosition(
  viewport: ViewportSize,
  panelHeight = 400,
): PositionResult {
  const top = Math.max(
    PINNED_MARGIN,
    Math.min(
      (viewport.height - panelHeight) / 2,
      viewport.height - panelHeight - PINNED_MARGIN,
    ),
  );
  return {
    top,
    left: viewport.width - PINNED_WIDTH - PINNED_MARGIN,
    placement: 'below',
  };
}

export function estimateTooltipHeight(
  isPinned: boolean,
  status: 'loading' | 'streaming' | 'done' | 'error',
): number {
  if (isPinned) return 400;
  if (status === 'loading') return 160;
  if (status === 'error') return 140;
  return 280;
}

export const TOOLTIP_WIDTH = 380;
export const TOOLTIP_WIDTH_PINNED = PINNED_WIDTH;
