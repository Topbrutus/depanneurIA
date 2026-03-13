/**
 * Environment variables configuration for API
 * Provides type-safe access to environment variables with defaults
 */

export const env = {
  NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'test' | 'production',
  PORT: parseInt(process.env.PORT || '3001', 10),
  API_HOST: process.env.API_HOST || '0.0.0.0',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  LOG_LEVEL: (process.env.LOG_LEVEL || 'info') as 'error' | 'warn' | 'info' | 'debug',
} as const;

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

/**
 * Validate required environment variables
 * Throws error if any required env var is missing
 */
export function validateEnv(): void {
  const required: (keyof typeof env)[] = ['PORT', 'DATABASE_URL'];
  const missing = required.filter(key => !env[key]);
  
  if (missing.length > 0) {
    const missingVars = missing.join(', ');
    throw new Error('Missing required environment variables: ' + missingVars);
  }
}
