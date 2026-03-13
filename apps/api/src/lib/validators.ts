import { ValidationError } from './errors';

export function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError(`Le champ "${field}" est requis et doit être une chaîne non vide`);
  }
  return value.trim();
}

export function optionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function requirePositiveInt(value: unknown, field: string): number {
  const num = Number(value);
  if (!Number.isInteger(num) || num < 1) {
    throw new ValidationError(`Le champ "${field}" doit être un entier positif`);
  }
  return num;
}

export function requireEmail(value: unknown, field: string): string {
  const str = requireString(value, field);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(str)) {
    throw new ValidationError(`Le champ "${field}" doit être une adresse courriel valide`);
  }
  return str;
}

export function requireArray(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ValidationError(`Le champ "${field}" doit être un tableau non vide`);
  }
  return value;
}
