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
