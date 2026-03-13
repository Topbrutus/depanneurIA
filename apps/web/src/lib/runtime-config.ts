/**
 * Runtime configuration for web app
 * Provides configuration values that can be changed at runtime
 */

export const runtimeConfig = {
  // API configuration
  api: {
    timeout: 30000, // 30 seconds
    retries: 3,
  },
  
  // Feature flags
  features: {
    voiceInput: true,
    assistantMode: true,
    telephony: false, // Not yet implemented
  },
  
  // UI configuration
  ui: {
    cartMaxItems: 50,
    searchDebounceMs: 300,
  },
} as const;

export type RuntimeConfig = typeof runtimeConfig;
