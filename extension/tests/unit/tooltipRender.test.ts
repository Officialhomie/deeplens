/**
 * @vitest-environment happy-dom
 *
 * Covers the tooltip markup and controls that used to be asserted in the E2E
 * suite via `pierce/` selectors. Those assertions could never pass: the tooltip
 * renders into a CLOSED shadow root, which Playwright's pierce engine cannot
 * traverse by design. The closed root is a deliberate privacy property (a host
 * page must not be able to read what the user looked up), so the coverage moved
 * here instead of the root being opened up for testability.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { showTooltip, destroyTooltip, tooltipState } from '../../src/content/tooltip';
import { shadowDOMManager } from '../../src/content/shadowDOM';

/** The shadow root is closed, so reach it through the manager, not the DOM. */
function root(): ShadowRoot {
  const r = shadowDOMManager.root;
  if (!r) throw new Error('shadow root not initialised');
  return r;
}

function rect(): DOMRect {
  return {
    x: 100, y: 100, width: 80, height: 20,
    top: 100, left: 100, right: 180, bottom: 120,
    toJSON: () => ({}),
  } as DOMRect;
}

describe('tooltip rendering', () => {
  beforeEach(() => {
    destroyTooltip(true);
  });

  it('renders the looked-up word into the header', () => {
    showTooltip('eigenvalue', rect(), 'quick');
    expect(root().querySelector('.dl-word')?.textContent).toBe('eigenvalue');
  });

  it('renders both mode buttons and marks the active one', () => {
    showTooltip('eigenvalue', rect(), 'quick');
    const quick = root().querySelector('.dl-mode-btn[data-mode="quick"]');
    const deep = root().querySelector('.dl-mode-btn[data-mode="deep"]');
    expect(quick).not.toBeNull();
    expect(deep).not.toBeNull();
    expect(quick?.classList.contains('active')).toBe(true);
    expect(deep?.classList.contains('active')).toBe(false);
  });

  it('renders pin, copy and close controls with accessible labels', () => {
    showTooltip('eigenvalue', rect(), 'deep');
    for (const label of ['Pin tooltip', 'Copy response', 'Close']) {
      expect(
        root().querySelector(`.dl-icon-btn[aria-label="${label}"]`),
        `missing control: ${label}`,
      ).not.toBeNull();
    }
  });

  it('attaches a closed shadow root that page scripts cannot read', () => {
    showTooltip('eigenvalue', rect(), 'quick');
    const host = document.querySelector('#deeplens-host');
    expect(host).not.toBeNull();
    // `closed` mode => the .shadowRoot accessor stays null for page scripts
    expect((host as HTMLElement).shadowRoot).toBeNull();
  });

  it('inlines the stylesheet instead of linking a web-accessible URL', () => {
    showTooltip('eigenvalue', rect(), 'quick');
    expect(root().querySelector('link[rel="stylesheet"]')).toBeNull();
    const style = root().querySelector('#dl-tooltip-css');
    expect(style?.tagName.toLowerCase()).toBe('style');
    expect((style?.textContent ?? '').length).toBeGreaterThan(0);
  });

  it('escapes quotes so a crafted word cannot break out of the title attribute', () => {
    // escapeAttr writes &quot; into the HTML source; the parser then decodes it,
    // so the attribute holds the literal text and no extra attributes appear.
    showTooltip('say "hi" onmouseover=alert(1)', rect(), 'quick');
    const word = root().querySelector('.dl-word');
    expect(word?.getAttribute('title')).toBe('say "hi" onmouseover=alert(1)');
    expect(word?.hasAttribute('onmouseover')).toBe(false);
  });

  it('tracks visibility in tooltipState', () => {
    showTooltip('eigenvalue', rect(), 'quick');
    expect(tooltipState.isVisible).toBe(true);
    destroyTooltip(true);
    expect(tooltipState.isVisible).toBe(false);
  });
});
