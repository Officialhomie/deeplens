/**
 * API key access — background / popup only (TRD §8.1).
 * Content scripts must use storage.getPublicSettings().
 */
import { storage } from '../shared/storage';

export async function getApiKey(): Promise<string> {
  return storage.get('apiKey');
}
