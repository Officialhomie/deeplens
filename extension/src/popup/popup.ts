import { storage } from '../shared/storage';
import {
  hasProviderPermission,
  pruneProviderPermissions,
  requestProviderPermission,
} from '../shared/providerHosts';
import type { LLMProvider, QueryMode } from '../shared/types';
import {
  clampHoverDelay,
  PROVIDER_KEY_HINTS,
  PROVIDER_KEY_PLACEHOLDERS,
  validateApiKeyFormat,
} from './settingsUtils';

const viewFirstRun = document.getElementById('view-first-run')!;
const viewOnboarding = document.getElementById('view-onboarding')!;
const viewSettings = document.getElementById('view-settings')!;

const enabledInput = document.getElementById('enabled') as HTMLInputElement;
const activeLabel = document.getElementById('active-label')!;

const providerSelect = document.getElementById('provider') as HTMLSelectElement;
const providerFirstSelect = document.getElementById('provider-first') as HTMLSelectElement;

const apiKeyInput = document.getElementById('api-key') as HTMLInputElement;
const apiKeyFirstInput = document.getElementById('api-key-first') as HTMLInputElement;
const keyError = document.getElementById('key-error') as HTMLParagraphElement;
const keyErrorFirst = document.getElementById('key-error-first') as HTMLParagraphElement;
const keyHint = document.getElementById('key-hint')!;
const keyHintFirst = document.getElementById('key-hint-first')!;

const hoverDelayInput = document.getElementById('hover-delay') as HTMLInputElement;
const hoverDelayValue = document.getElementById('hover-delay-value') as HTMLOutputElement;
const hoverEnabledInput = document.getElementById('hover-enabled') as HTMLInputElement;
const selectionEnabledInput = document.getElementById(
  'selection-enabled',
) as HTMLInputElement;

const permBanner = document.getElementById('perm-banner') as HTMLDivElement;
const grantPermBtn = document.getElementById('grant-perm-btn') as HTMLButtonElement;

const statusEl = document.getElementById('status') as HTMLParagraphElement;
const activateBtn = document.getElementById('activate-btn') as HTMLButtonElement;
const segButtons = document.querySelectorAll('.seg-btn');

type ViewId = 'first-run' | 'onboarding' | 'settings';

function showView(id: ViewId): void {
  viewFirstRun.hidden = id !== 'first-run';
  viewOnboarding.hidden = id !== 'onboarding';
  viewSettings.hidden = id !== 'settings';
}

function setStatus(text: string, ok = false): void {
  statusEl.textContent = text;
  statusEl.classList.toggle('ok', ok);
}

function setKeyError(el: HTMLElement, message: string | null): void {
  el.hidden = !message;
  if (message) el.textContent = message;
}

function updateActiveHeader(enabled: boolean, hasKey: boolean): void {
  enabledInput.checked = enabled && hasKey;
  enabledInput.disabled = !hasKey;
  activeLabel.textContent =
    enabled && hasKey ? 'Active' : hasKey ? 'Inactive' : 'Inactive';
}

function setSegmentedMode(mode: QueryMode): void {
  segButtons.forEach((btn) => {
    const el = btn as HTMLButtonElement;
    el.classList.toggle('active', el.dataset.mode === mode);
  });
}

function applyProviderUI(provider: LLMProvider, input: HTMLInputElement, hint: HTMLElement): void {
  input.placeholder = PROVIDER_KEY_PLACEHOLDERS[provider];
  hint.textContent = PROVIDER_KEY_HINTS[provider];
}

/**
 * Ensure the host permission for `provider` is granted, prompting if needed.
 * Only safe to call synchronously inside a user-gesture handler (click/change);
 * Chrome rejects permissions.request() outside one.
 */
async function ensureProviderAccess(provider: LLMProvider): Promise<boolean> {
  if (await hasProviderPermission(provider)) return true;
  const granted = await requestProviderPermission(provider);
  if (granted) await pruneProviderPermissions(provider);
  return granted;
}

/** Show the recovery banner when the grant was revoked outside the popup. */
async function refreshPermissionBanner(provider: LLMProvider): Promise<void> {
  permBanner.hidden = await hasProviderPermission(provider);
}

async function loadSettings(): Promise<void> {
  const settings = await storage.getAll();
  const hasKey = Boolean(settings.apiKey.trim());

  providerSelect.value = settings.provider;
  providerFirstSelect.value = settings.provider;
  applyProviderUI(settings.provider, apiKeyInput, keyHint);
  applyProviderUI(settings.provider, apiKeyFirstInput, keyHintFirst);

  apiKeyInput.value = settings.apiKey;
  apiKeyFirstInput.value = settings.apiKey;
  updateActiveHeader(settings.isEnabled, hasKey);
  setSegmentedMode(
    settings.defaultMode === 'links' ? 'deep' : settings.defaultMode,
  );
  hoverDelayInput.value = String(settings.hoverDelayMs);
  hoverDelayValue.textContent = String(settings.hoverDelayMs);
  hoverEnabledInput.checked = settings.hoverEnabled;
  selectionEnabledInput.checked = settings.selectionEnabled;

  if (!hasKey) {
    showView('first-run');
    return;
  }
  if (!settings.onboardingComplete) {
    showView('onboarding');
    return;
  }
  await refreshPermissionBanner(settings.provider);
  showView('settings');
}

function bindSettingsView(): void {
  providerSelect.addEventListener('change', async () => {
    const provider = providerSelect.value as LLMProvider;
    const previous = await storage.get('provider');

    if (!(await ensureProviderAccess(provider))) {
      // Declined — keep the previous provider rather than leaving the UI
      // pointing at a provider we cannot reach.
      providerSelect.value = previous;
      setStatus('Permission declined — provider unchanged.');
      return;
    }

    await storage.set('provider', provider);
    permBanner.hidden = true;
    applyProviderUI(provider, apiKeyInput, keyHint);
    setKeyError(keyError, null);
    apiKeyInput.value = '';
    await storage.set('apiKey', '');
    setStatus('Provider changed — re-enter your API key.', false);
    updateActiveHeader(false, false);
  });

  grantPermBtn.addEventListener('click', async () => {
    const provider = providerSelect.value as LLMProvider;
    grantPermBtn.disabled = true;
    const granted = await ensureProviderAccess(provider);
    grantPermBtn.disabled = false;
    permBanner.hidden = granted;
    setStatus(
      granted ? 'Provider access granted.' : 'Permission declined.',
      granted,
    );
  });

  apiKeyInput.addEventListener('change', async () => {
    const provider = providerSelect.value as LLMProvider;
    const trimmed = apiKeyInput.value.trim();
    if (!trimmed) {
      setKeyError(keyError, 'API key is required.');
      setStatus('Fix API key format.');
      return;
    }
    if (!validateApiKeyFormat(trimmed, provider)) {
      const prefix = PROVIDER_KEY_PLACEHOLDERS[provider].replace('…', '');
      setKeyError(keyError, `Key should start with ${prefix} (at least 20 chars).`);
      setStatus('Fix API key format.');
      return;
    }
    await storage.set('apiKey', trimmed);
    setKeyError(keyError, null);
    keyHint.textContent = 'Key saved locally';
    setStatus('API key saved.', true);
    updateActiveHeader(enabledInput.checked, true);
  });

  enabledInput.addEventListener('change', async () => {
    const hasKey = Boolean((await storage.get('apiKey')).trim());
    if (!hasKey) {
      enabledInput.checked = false;
      setStatus('Add an API key first.');
      return;
    }
    await storage.set('isEnabled', enabledInput.checked);
    updateActiveHeader(enabledInput.checked, hasKey);
    setStatus(
      enabledInput.checked ? 'Extension enabled.' : 'Extension paused.',
      enabledInput.checked,
    );
  });

  segButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const mode = (btn as HTMLButtonElement).dataset.mode as QueryMode;
      setSegmentedMode(mode);
      await storage.set('defaultMode', mode);
      setStatus('Default mode updated.', true);
    });
  });

  hoverDelayInput.addEventListener('input', async () => {
    const ms = clampHoverDelay(Number(hoverDelayInput.value));
    hoverDelayInput.value = String(ms);
    hoverDelayValue.textContent = String(ms);
    await storage.set('hoverDelayMs', ms);
    setStatus('Hover delay updated.', true);
  });

  hoverEnabledInput.addEventListener('change', async () => {
    await storage.set('hoverEnabled', hoverEnabledInput.checked);
    setStatus('Hover trigger updated.', true);
  });

  selectionEnabledInput.addEventListener('change', async () => {
    await storage.set('selectionEnabled', selectionEnabledInput.checked);
    setStatus('Selection trigger updated.', true);
  });
}

function bindFirstRun(): void {
  providerFirstSelect.addEventListener('change', () => {
    const provider = providerFirstSelect.value as LLMProvider;
    void storage.set('provider', provider);
    applyProviderUI(provider, apiKeyFirstInput, keyHintFirst);
    setKeyError(keyErrorFirst, null);
  });

  activateBtn.addEventListener('click', async () => {
    activateBtn.disabled = true;
    const provider = providerFirstSelect.value as LLMProvider;
    const trimmed = apiKeyFirstInput.value.trim();
    if (!trimmed || !validateApiKeyFormat(trimmed, provider)) {
      const prefix = PROVIDER_KEY_PLACEHOLDERS[provider].replace('…', '');
      setKeyError(keyErrorFirst, `Key should start with ${prefix}.`);
      activateBtn.disabled = false;
      return;
    }
    if (!(await ensureProviderAccess(provider))) {
      setKeyError(
        keyErrorFirst,
        'DeepLens needs permission to reach this provider. Click Activate and allow the prompt.',
      );
      activateBtn.disabled = false;
      return;
    }

    await storage.set('apiKey', trimmed);
    await storage.set('provider', provider);
    await storage.set('isEnabled', true);
    updateActiveHeader(true, true);
    showView('onboarding');
    activateBtn.disabled = false;
  });
}

function bindOnboarding(): void {
  const finish = async () => {
    await storage.set('onboardingComplete', true);
    showView('settings');
    setStatus('Ready — hover any word to start.', true);
  };
  document.getElementById('finish-onboarding')!.addEventListener('click', () => {
    void finish();
  });
  document.getElementById('skip-onboarding')!.addEventListener('click', () => {
    void finish();
  });
}

async function init(): Promise<void> {
  bindSettingsView();
  bindFirstRun();
  bindOnboarding();
  await loadSettings();
}

void init();
