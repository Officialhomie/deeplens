/**
 * @vitest-environment happy-dom
 *
 * Regression guard: `onMouseOver` checked the exclusion zones but `onMouseMove`
 * did not. mouseover fires once on entry while mousemove keeps firing inside the
 * element, so moving the pointer within a contenteditable region started a hover
 * timer and opened the tooltip over the user's own text — a rich-text editor,
 * comment box or compose window. Inputs and textareas only escaped this because
 * caretRangeFromPoint finds no word inside a form control.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initDetector } from '../../src/content/detector';

const CONFIG = {
  isEnabled: true,
  hoverEnabled: true,
  selectionEnabled: true,
  hoverDelayMs: 300,
  blacklistedDomains: [] as string[],
};

function mountFixture(): void {
  document.body.innerHTML = `
    <p id="prose">eigenvalue decomposition matters</p>
    <div id="editable" contenteditable="true">editable region text</div>
    <textarea id="ta">textarea content</textarea>
    <input id="inp" type="text" value="typing here" />
  `;
}

/**
 * Drive the detector without relying on real caret hit-testing.
 * happy-dom implements neither caret API, so define one rather than spy on it.
 */
function setupDetector(wordAtPoint: string | null) {
  const onTrigger = vi.fn();
  const stub = (): Range | null => {
    if (wordAtPoint === null) return null;
    const node = document.createTextNode(wordAtPoint);
    document.body.appendChild(node);
    const range = document.createRange();
    range.setStart(node, 0);
    range.setEnd(node, 0);
    return range;
  };
  Reflect.set(document, 'caretRangeFromPoint', stub);

  const teardown = initDetector({
    getConfig: () => Promise.resolve(CONFIG),
    onTrigger,
    onAbort: vi.fn(),
    onSoftAbort: vi.fn(),
  });
  return { onTrigger, teardown };
}

function moveOver(el: Element, x: number, y: number): void {
  el.dispatchEvent(
    new MouseEvent('mousemove', { clientX: x, clientY: y, bubbles: true }),
  );
}

describe('hover exclusion zones on mousemove', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mountFixture();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    Reflect.deleteProperty(document, 'caretRangeFromPoint');
    document.body.innerHTML = '';
  });

  it.each([
    ['contenteditable', 'editable'],
    ['textarea', 'ta'],
    ['input', 'inp'],
  ])('does not start a hover lookup while moving inside a %s', async (_label, id) => {
    const { onTrigger, teardown } = setupDetector('editable');
    const el = document.getElementById(id)!;

    // Several moves inside the element, far enough apart to pass the move threshold.
    moveOver(el, 10, 10);
    moveOver(el, 60, 60);
    moveOver(el, 120, 120);

    await vi.advanceTimersByTimeAsync(CONFIG.hoverDelayMs + 200);
    expect(onTrigger).not.toHaveBeenCalled();
    teardown();
  });

  it('still starts a hover lookup over ordinary prose', async () => {
    const { onTrigger, teardown } = setupDetector('eigenvalue');
    const prose = document.getElementById('prose')!;

    moveOver(prose, 10, 10);
    moveOver(prose, 80, 80);

    await vi.advanceTimersByTimeAsync(CONFIG.hoverDelayMs + 200);
    expect(onTrigger).toHaveBeenCalled();
    teardown();
  });
});
