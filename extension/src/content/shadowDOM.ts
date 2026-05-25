/** Shadow DOM host lifecycle (TRD §4.10) */
export const shadowDOMManager = {
  host: null as HTMLElement | null,
  root: null as ShadowRoot | null,

  init(): ShadowRoot {
    if (this.root) return this.root;
    this.host = document.createElement('div');
    this.host.id = 'deeplens-host';
    this.host.setAttribute('aria-hidden', 'true');
    document.documentElement.appendChild(this.host);
    this.root = this.host.attachShadow({ mode: 'closed' });
    return this.root;
  },

  destroy(): void {
    this.host?.remove();
    this.host = null;
    this.root = null;
  },
};
