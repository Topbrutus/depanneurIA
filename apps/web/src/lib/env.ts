/**
 * Environment variables configuration for web app
 * Provides type-safe access to Vite environment variables
 */

export const env = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  API_BASE_PATH: import.meta.env.VITE_API_BASE_PATH || '/api/v1',
  ENV: (import.meta.env.VITE_ENV || import.meta.env.MODE || 'development') as 'development' | 'production',
} as const;

export const isDevelopment = env.ENV === 'development';
export const isProduction = env.ENV === 'production';

/**
 * Get full API URL for a given path
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${env.API_URL}${env.API_BASE_PATH}${cleanPath}`;
}
