import { describe, expect, it } from 'vitest';
import {
  computePinnedPosition,
  computePosition,
} from '../../src/shared/position';

function rect(
  top: number,
  left: number,
  width: number,
  height: number,
): Pick<DOMRect, 'top' | 'left' | 'right' | 'bottom' | 'width' | 'height'> {
  return {
    top,
    left,
    right: left + width,
    bottom: top + height,
    width,
    height,
  };
}

describe('computePosition', () => {
  it('places tooltip below when space allows', () => {
    const result = computePosition({
      triggerRect: rect(100, 100, 40, 20),
      tooltipWidth: 280,
      tooltipHeight: 200,
      viewport: { width: 1200, height: 800 },
    });
    expect(result.placement).toBe('below');
    expect(result.top).toBeGreaterThan(120);
  });

  it('flips above when bottom space is tight', () => {
    const result = computePosition({
      triggerRect: rect(750, 100, 40, 20),
      tooltipWidth: 280,
      tooltipHeight: 200,
      viewport: { width: 1200, height: 800 },
    });
    expect(result.placement).toBe('above');
    expect(result.top).toBeLessThan(750);
  });

  it('pins panel to right viewport edge', () => {
    const result = computePinnedPosition({ width: 1200, height: 800 }, 400);
    expect(result.left).toBeGreaterThan(600);
    expect(result.top).toBeGreaterThanOrEqual(16);
  });

  it('clamps horizontal position inside viewport', () => {
    const result = computePosition({
      triggerRect: rect(100, 0, 20, 20),
      tooltipWidth: 280,
      tooltipHeight: 120,
      viewport: { width: 300, height: 600 },
    });
    expect(result.left).toBeGreaterThanOrEqual(8);
    expect(result.left + 280).toBeLessThanOrEqual(292);
  });
});
