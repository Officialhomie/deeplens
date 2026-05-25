/**
 * Phase 3 prompt assembly — re-exports TRD §4.7 finalized prompts.
 * User message shaping lives in prompts.ts; system prompts are mode-specific.
 */
export { buildUserMessage, SYSTEM_PROMPTS } from './prompts';
export { buildClaudeRequest, MAX_TOKENS } from './claudeAPI';
