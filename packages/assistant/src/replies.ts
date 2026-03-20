import type { CatalogProduct, MatchResult } from '@depaneuria/types';

/** Confirmation d'ajout au panier. */
export function replyProductAdded(product: CatalogProduct, quantity: number): string {
  const qty = quantity > 1 ? `${quantity}× ` : '';
  return `✅ J'ai ajouté ${qty}${product.name} à votre panier.`;
}

/** Confirmation de suppression du panier. */
export function replyProductRemoved(productName: string): string {
  return `🗑️ J'ai retiré ${productName} de votre panier.`;
}

/** Produit introuvable dans le catalogue. */
export function replyProductNotFound(keywords: string[]): string {
  const term = keywords.join(' ');
  return `😕 Je n'ai pas trouvé "${term}" dans notre catalogue. Essayez avec un autre nom ou parcourez la boutique.`;
}

/** Plusieurs candidats — demande de clarification. */
export function replyClarify(match: MatchResult): string {
  const names = match.candidates.map((p) => p.name).join(', ');
  return `🤔 J'ai trouvé plusieurs options : ${names}. Lequel voulez-vous ?`;
}

/** Demande vague — encourage à préciser. */
export function replyVague(): string {
  return `😊 Pas de problème ! Dites-moi ce que vous cherchez — par exemple "je veux du lait", "mets 2 coke" ou "je veux des chips ketchup".`;
}

/** Intention non reconnue. */
export function replyUnknown(): string {
  return `🙂 Je n'ai pas bien compris. Essayez : "je veux du lait", "mets 2 pepsi", "enlève le beurre".`;
}

/** Invitation à préciser après une demande de remplacement. */
export function replyReplacePrompt(): string {
  return `🔄 Par quoi voulez-vous remplacer ? Dites-moi le nom du produit.`;
}

/** Produit en rupture de stock. */
export function replyProductOutOfStock(productName: string): string {
  return `⚠️ Désolé, "${productName}" n'est pas disponible pour le moment.`;
}
