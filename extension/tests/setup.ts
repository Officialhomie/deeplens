import { beforeEach, vi } from 'vitest';

type StorageRecord = Record<string, unknown>;

let store: StorageRecord = {};

const localStorageArea = {
  get: vi.fn((keys: string | string[] | null) => {
    if (keys === null) {
      return Promise.resolve({ ...store });
    }
    if (typeof keys === 'string') {
      return Promise.resolve(
        keys in store ? { [keys]: store[keys] } : {},
      );
    }
    const result: StorageRecord = {};
    for (const key of keys) {
      if (key in store) result[key] = store[key];
    }
    return Promise.resolve(result);
  }),
  set: vi.fn((items: StorageRecord) => {
    Object.assign(store, items);
    return Promise.resolve();
  }),
  remove: vi.fn((keys: string | string[]) => {
    const list = Array.isArray(keys) ? keys : [keys];
    for (const key of list) delete store[key];
    return Promise.resolve();
  }),
  clear: vi.fn(() => {
    store = {};
    return Promise.resolve();
  }),
};

beforeEach(() => {
  store = {};
  vi.stubGlobal('chrome', {
    storage: { local: localStorageArea },
    runtime: {
      id: 'deeplens-test-extension-id',
      getURL: vi.fn((path: string) => `chrome-extension://deeplens-test/${path}`),
      sendMessage: vi.fn(),
      onMessage: { addListener: vi.fn() },
      lastError: null,
    },
    tabs: { sendMessage: vi.fn(() => Promise.resolve()) },
  });
});
