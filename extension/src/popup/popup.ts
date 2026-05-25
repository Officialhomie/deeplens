import { storage } from '../shared/storage';
import type { QueryMode } from '../shared/types';

const apiKeyInput = document.getElementById('api-key') as HTMLInputElement;
const enabledInput = document.getElementById('enabled') as HTMLInputElement;
const defaultModeSelect = document.getElementById('default-mode') as HTMLSelectElement;
const hoverDelayInput = document.getElementById('hover-delay') as HTMLInputElement;
const hoverDelayValue = document.getElementById('hover-delay-value') as HTMLOutputElement;
const statusEl = document.getElementById('status') as HTMLParagraphElement;

function setStatus(text: string): void {
  statusEl.textContent = text;
}

async function loadSettings(): Promise<void> {
  const settings = await storage.getAll();
  apiKeyInput.value = settings.apiKey;
  enabledInput.checked = settings.isEnabled;
  defaultModeSelect.value = settings.defaultMode;
  hoverDelayInput.value = String(settings.hoverDelayMs);
  hoverDelayValue.textContent = String(settings.hoverDelayMs);
}

async function saveApiKey(): Promise<void> {
  await storage.set('apiKey', apiKeyInput.value.trim());
  setStatus('API key saved.');
}

async function bindControls(): Promise<void> {
  apiKeyInput.addEventListener('change', () => void saveApiKey());

  enabledInput.addEventListener('change', async () => {
    await storage.set('isEnabled', enabledInput.checked);
    setStatus(enabledInput.checked ? 'Extension enabled.' : 'Extension paused.');
  });

  defaultModeSelect.addEventListener('change', async () => {
    await storage.set('defaultMode', defaultModeSelect.value as QueryMode);
    setStatus('Default mode updated.');
  });

  hoverDelayInput.addEventListener('input', async () => {
    const ms = Number(hoverDelayInput.value);
    hoverDelayValue.textContent = String(ms);
    await storage.set('hoverDelayMs', ms);
    setStatus('Hover delay updated.');
  });
}

void loadSettings().then(bindControls);
