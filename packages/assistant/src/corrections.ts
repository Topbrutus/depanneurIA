import type {
  AssistantResponse,
  CartAdapter,
  CatalogProduct,
  ParsedIntent,
} from '@depaneuria/types';

import { matchCatalog } from './catalog-match';
import { replyProductNotFound, replyProductRemoved, replyReplacePrompt } from './replies';

/**
 * Gère l'intention "remove" : cherche le produit dans le panier par mots-clés
 * et le supprime si trouvé.
 */
export function handleRemove(intent: ParsedIntent, cart: CartAdapter): AssistantResponse {
  const cartItems = cart.getItems();

  const match = cartItems.find((item) =>
    intent.keywords.some((kw) => item.productName.toLowerCase().includes(kw))
  );

  if (match !== undefined) {
    cart.removeItem(match.productId);
    return {
      text: replyProductRemoved(match.productName),
      action: { type: 'remove_from_cart', productId: match.productId },
      suggestions: [],
      needsClarification: false,
    };
  }

  return {
    text: replyProductNotFound(intent.keywords),
    action: { type: 'none' },
    suggestions: [],
    needsClarification: false,
  };
}

/**
 * Gère l'intention "replace" : demande simplement par quoi remplacer.
 * La résolution du remplacement se fait lors du prochain message (add).
 */
export function handleReplace(
  _intent: ParsedIntent,
  _catalog: CatalogProduct[]
): AssistantResponse {
  return {
    text: replyReplacePrompt(),
    action: { type: 'clarify' },
    suggestions: [],
    needsClarification: true,
  };
}

/**
 * Si aucun match avec tous les mots-clés, tente des sous-ensembles progressifs
 * pour améliorer la pertinence sur les requêtes composées ("pepsi zero", "chips ketchup").
 */
export function refineKeywords(keywords: string[], catalog: CatalogProduct[]): string[] {
  if (keywords.length <= 1) return keywords;

  const { confidence } = matchCatalog(keywords, catalog);
  if (confidence !== 'none') return keywords;

  for (let len = keywords.length - 1; len >= 1; len--) {
    const subset = keywords.slice(0, len);
    if (matchCatalog(subset, catalog).confidence !== 'none') {
      return subset;
    }
  }

  return keywords;
}
