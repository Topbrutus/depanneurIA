import { describe, expect, it } from 'vitest';

import type { CatalogProduct } from '@depaneuria/types';

import { matchCatalog } from '../catalog-match';
import { normalize, extractKeywords } from '../normalize';
import { parseIntent } from '../parse-intent';
import { extractQuantity } from '../quantity';

// ---------------------------------------------------------------------------
// Catalogue de démonstration utilisé dans les tests
// ---------------------------------------------------------------------------
const TEST_CATALOG: CatalogProduct[] = [
  { id: 'milk-1', name: 'Lait 2%', category: 'Laitier', brand: 'Natrel', price: 4.99, available: true },
  { id: 'milk-2', name: 'Lait entier', category: 'Laitier', brand: 'Quebon', price: 5.19, available: true },
  { id: 'coke-1', name: 'Coca-Cola 355ml', category: 'Boissons', brand: 'Coca-Cola', price: 1.99, available: true },
  { id: 'pepsi-1', name: 'Pepsi 355ml', category: 'Boissons', brand: 'Pepsi', price: 1.99, available: true },
  { id: 'pepsi-zero-1', name: 'Pepsi Zero 355ml', category: 'Boissons', brand: 'Pepsi', price: 1.99, available: true },
  { id: 'chips-lays', name: 'Chips Lays Original', category: 'Collations', brand: 'Lays', price: 3.49, available: true },
  { id: 'chips-ketchup', name: 'Chips Lays Ketchup', category: 'Collations', brand: 'Lays', price: 3.49, available: true },
  { id: 'chips-ruffles', name: 'Chips Ruffles', category: 'Collations', brand: 'Ruffles', price: 3.49, available: true },
  { id: 'bread-1', name: 'Pain blanc tranche', category: 'Boulangerie', price: 2.99, available: true },
  { id: 'water-1', name: 'Eau Evian 500ml', category: 'Boissons', brand: 'Evian', price: 1.49, available: false },
];

// ---------------------------------------------------------------------------
// normalize()
// ---------------------------------------------------------------------------
describe('normalize', () => {
  it('met en minuscules', () => {
    expect(normalize('LAIT')).toBe('lait');
  });

  it('supprime les accents', () => {
    expect(normalize('éàü')).toBe('eau');
  });

  it('supprime les accents composés', () => {
    expect(normalize('Zéro')).toBe('zero');
  });

  it('élimine la ponctuation', () => {
    expect(normalize('lait!')).toBe('lait');
  });

  it('collapse les espaces multiples', () => {
    expect(normalize('je  veux  du  lait')).toBe('je veux du lait');
  });

  it('supprime les espaces en début et fin', () => {
    expect(normalize('  lait  ')).toBe('lait');
  });

  it('normalise le tiret en espace', () => {
    expect(normalize('as-tu')).toBe('as tu');
  });
});

// ---------------------------------------------------------------------------
// extractKeywords()
// ---------------------------------------------------------------------------
describe('extractKeywords', () => {
  it('conserve les mots produit', () => {
    const kw = extractKeywords(normalize('je veux du lait'));
    expect(kw).toContain('lait');
  });

  it('supprime les mots vides courants', () => {
    const kw = extractKeywords(normalize('je veux du lait'));
    expect(kw).not.toContain('je');
    expect(kw).not.toContain('du');
    expect(kw).not.toContain('veux');
  });

  it('retourne un tableau vide si tout est mots vides', () => {
    expect(extractKeywords('je veux du')).toEqual([]);
  });

  it('conserve plusieurs mots produit', () => {
    const kw = extractKeywords(normalize('je veux des chips ketchup'));
    expect(kw).toContain('chips');
    expect(kw).toContain('ketchup');
  });
});

// ---------------------------------------------------------------------------
// extractQuantity()
// ---------------------------------------------------------------------------
describe('extractQuantity', () => {
  it('extrait un chiffre arabe', () => {
    expect(extractQuantity('mets 2 coke')).toBe(2);
  });

  it('extrait un nombre en lettres', () => {
    expect(extractQuantity('je veux trois laits')).toBe(3);
  });

  it('retourne 1 par défaut', () => {
    expect(extractQuantity('je veux du lait')).toBe(1);
  });

  it('interprète "un" comme 1', () => {
    expect(extractQuantity('donne moi un pepsi')).toBe(1);
  });

  it('ignore les quantités nulles ou négatives', () => {
    expect(extractQuantity('mets 0 coke')).toBe(1);
  });

  it('extrait 10 correctement', () => {
    expect(extractQuantity('mets dix cokes')).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// parseIntent()
// ---------------------------------------------------------------------------
describe('parseIntent', () => {
  it('détecte "add" pour "je veux du lait"', () => {
    expect(parseIntent('je veux du lait').type).toBe('add');
  });

  it('détecte "add" pour "mets 2 coke"', () => {
    expect(parseIntent('mets 2 coke').type).toBe('add');
  });

  it('détecte "add" pour "as-tu du pepsi zero"', () => {
    expect(parseIntent('as-tu du pepsi zero').type).toBe('add');
  });

  it('détecte "add" pour "je veux des chips"', () => {
    expect(parseIntent('je veux des chips').type).toBe('add');
  });

  it('retourne les mots-clés produit pour add', () => {
    const result = parseIntent('je veux des chips');
    expect(result.keywords).toContain('chips');
  });

  it('retourne la quantité correcte', () => {
    expect(parseIntent('mets 2 coke').quantity).toBe(2);
  });

  it('détecte "remove" pour "enlève le lait"', () => {
    expect(parseIntent('enlève le lait').type).toBe('remove');
  });

  it('détecte "remove" pour "retire le beurre"', () => {
    expect(parseIntent('retire le beurre').type).toBe('remove');
  });

  it('détecte "replace" pour "remplace par autre chose"', () => {
    expect(parseIntent('remplace par autre chose').type).toBe('replace');
  });

  it('détecte "vague" pour "je sais pas quoi prendre"', () => {
    expect(parseIntent('je sais pas quoi prendre').type).toBe('vague');
  });

  it('détecte "add" implicite pour un mot produit seul', () => {
    expect(parseIntent('pepsi').type).toBe('add');
  });

  it('retourne "unknown" pour une phrase sans sens', () => {
    expect(parseIntent('').type).toBe('unknown');
  });
});

// ---------------------------------------------------------------------------
// matchCatalog()
// ---------------------------------------------------------------------------
describe('matchCatalog', () => {
  it('trouve le lait par mot-clé exact', () => {
    const result = matchCatalog(['lait'], TEST_CATALOG);
    expect(result.confidence).not.toBe('none');
    expect(result.candidates.some((p) => p.id === 'milk-1')).toBe(true);
  });

  it('trouve coca-cola par mots-clés marque', () => {
    const result = matchCatalog(['coca', 'cola'], TEST_CATALOG);
    expect(result.product?.id).toBe('coke-1');
  });

  it('trouve pepsi zero avec deux mots-clés', () => {
    const result = matchCatalog(['pepsi', 'zero'], TEST_CATALOG);
    expect(result.candidates.some((p) => p.id === 'pepsi-zero-1')).toBe(true);
  });

  it('retourne plusieurs candidats pour "chips" (partiel)', () => {
    const result = matchCatalog(['chips'], TEST_CATALOG);
    expect(result.candidates.length).toBeGreaterThan(1);
    expect(result.confidence).toBe('partial');
  });

  it('retourne "none" pour un produit absent', () => {
    const result = matchCatalog(['croissant'], TEST_CATALOG);
    expect(result.confidence).toBe('none');
    expect(result.product).toBeNull();
  });

  it('ignore les produits non disponibles', () => {
    const result = matchCatalog(['eau', 'evian'], TEST_CATALOG);
    expect(result.candidates.every((p) => p.available)).toBe(true);
  });

  it('retourne "none" pour des mots-clés vides', () => {
    const result = matchCatalog([], TEST_CATALOG);
    expect(result.confidence).toBe('none');
  });

  it('ne retourne pas plus de 3 candidats', () => {
    const result = matchCatalog(['chips'], TEST_CATALOG);
    expect(result.candidates.length).toBeLessThanOrEqual(3);
  });
});
