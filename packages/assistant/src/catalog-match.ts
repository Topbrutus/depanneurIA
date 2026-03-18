import type { CatalogProduct, MatchResult } from '@depaneuria/types';

import { normalize } from './normalize';

/** Score d'un produit par rapport à une liste de mots-clés. */
function scoreProduct(product: CatalogProduct, keywords: string[]): number {
  if (keywords.length === 0) return 0;

  const nameNorm = normalize(product.name);
  const brandNorm = product.brand !== undefined ? normalize(product.brand) : '';
  const categoryNorm = normalize(product.category);
  const searchable = `${nameNorm} ${brandNorm} ${categoryNorm}`;

  let score = 0;
  for (const kw of keywords) {
    if (nameNorm.includes(kw) || brandNorm.includes(kw)) {
      score += 2; // correspondance exacte nom/marque
    } else if (categoryNorm.includes(kw) || searchable.includes(kw)) {
      score += 1; // correspondance catégorie ou partielle
    }
  }
  return score;
}

/**
 * Trouve le ou les meilleurs produits correspondant aux mots-clés dans le catalogue.
 * Ne retourne que les produits disponibles.
 */
export function matchCatalog(
  keywords: string[],
  catalog: CatalogProduct[],
): MatchResult {
  if (keywords.length === 0) {
    return { product: null, candidates: [], confidence: 'none' };
  }

  const scored = catalog
    .filter((p) => p.available)
    .map((p) => ({ product: p, score: scoreProduct(p, keywords) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return { product: null, candidates: [], confidence: 'none' };
  }

  const topScore = scored[0]?.score ?? 0;
  const topProducts = scored
    .filter((s) => s.score === topScore)
    .map((s) => s.product);

  if (topProducts.length === 1 && topScore >= 2) {
    const product = topProducts[0] ?? null;
    return { product, candidates: topProducts, confidence: 'exact' };
  }

  const candidates = topProducts.slice(0, 3);
  const product = candidates.length === 1 ? (candidates[0] ?? null) : null;
  return { product, candidates, confidence: 'partial' };
}
