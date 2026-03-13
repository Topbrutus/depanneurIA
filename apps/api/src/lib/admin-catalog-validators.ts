import type { ProductAvailability, ProductStatus } from '@depaneuria/types';
import { ValidationError } from './errors';

const AVAILABILITY_VALUES: ProductAvailability[] = [
  'en_stock',
  'rupture',
  'sur_commande',
];
const STATUS_VALUES: ProductStatus[] = ['draft', 'active'];

export function ensureString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError(`Le champ "${field}" est requis`);
  }
  return value.trim();
}

export function optionalString(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function ensurePrice(value: unknown): number {
  const price = Number(value);
  if (!Number.isFinite(price) || price < 0) {
    throw new ValidationError('Le prix doit être un nombre positif');
  }
  return Math.round(price * 100) / 100;
}

export function ensureStatus(value: unknown): ProductStatus {
  if (typeof value !== 'string') {
    throw new ValidationError('Le statut est requis');
  }
  if (!STATUS_VALUES.includes(value as ProductStatus)) {
    throw new ValidationError('Statut invalide (draft|active)');
  }
  return value as ProductStatus;
}

export function ensureAvailability(value: unknown): ProductAvailability {
  if (typeof value !== 'string') {
    throw new ValidationError('La disponibilité est requise');
  }
  if (!AVAILABILITY_VALUES.includes(value as ProductAvailability)) {
    throw new ValidationError(
      'Disponibilité invalide (en_stock|rupture|sur_commande)'
    );
  }
  return value as ProductAvailability;
}

export function ensureBoolean(value: unknown, field: string): boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationError(`Le champ "${field}" doit être un booléen`);
  }
  return value;
}

export function ensureNonNegativeInt(value: unknown, field: string): number {
  const num = Number(value);
  if (!Number.isInteger(num) || num < 0) {
    throw new ValidationError(`Le champ "${field}" doit être un entier ≥ 0`);
  }
  return num;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

export function ensureSlug(value: unknown, fallback?: string): string {
  const raw = typeof value === 'string' && value.trim().length > 0 ? value : fallback;
  if (!raw) {
    throw new ValidationError('Le slug est requis');
  }
  const slug = slugify(raw);
  if (!slug) {
    throw new ValidationError('Le slug ne peut pas être vide');
  }
  return slug;
}
