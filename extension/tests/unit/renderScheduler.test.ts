// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cancelScheduledRender,
  resetRenderSchedulerForTests,
  scheduleRender,
} from '../../src/content/renderScheduler';

describe('renderScheduler', () => {
  beforeEach(() => {
    resetRenderSchedulerForTests();
    vi.stubGlobal(
      'requestAnimationFrame',
      (cb: FrameRequestCallback) => {
        return setTimeout(() => cb(0), 0) as unknown as number;
      },
    );
    vi.stubGlobal(
      'cancelAnimationFrame',
      (id: number) => clearTimeout(id as unknown as ReturnType<typeof setTimeout>),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('coalesces multiple schedules into one run', async () => {
    const runs: number[] = [];
    scheduleRender(() => runs.push(1));
    scheduleRender(() => runs.push(2));
    await new Promise((r) => setTimeout(r, 5));
    expect(runs).toEqual([2]);
  });

  it('cancelScheduledRender prevents pending paint', async () => {
    const fn = vi.fn();
    scheduleRender(fn);
    cancelScheduledRender();
    await new Promise((r) => setTimeout(r, 5));
    expect(fn).not.toHaveBeenCalled();
  });
});
