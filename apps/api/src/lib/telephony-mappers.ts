// ---------------------------------------------------------------------------
// Mappers pour transformer les transcriptions en intentions et commandes
// ---------------------------------------------------------------------------

import type { IntentType, ParsedIntent } from '@depaneuria/types';

/**
 * Analyse un texte de transcription et en extrait l'intention
 * Cette logique est simplifiée pour la V1 simulée
 */
export function parseTranscriptionIntent(text: string): ParsedIntent {
  const normalizedText = text.toLowerCase().trim();
  const keywords = normalizedText.split(/\s+/).filter((word) => word.length > 2);

  // Détection simple d'intention basée sur des mots-clés
  let type: IntentType = 'unknown';
  let quantity = 1;

  // Détection de quantité
  const quantityMatch = normalizedText.match(/(\d+)/);
  if (quantityMatch) {
    quantity = parseInt(quantityMatch[1], 10);
  }

  // Détection d'intention d'ajout
  if (
    normalizedText.includes('veux') ||
    normalizedText.includes('voudrais') ||
    normalizedText.includes('ajoute') ||
    normalizedText.includes('mets') ||
    normalizedText.includes('prend')
  ) {
    type = 'add';
  }
  // Détection d'intention de retrait
  else if (
    normalizedText.includes('enlève') ||
    normalizedText.includes('retire') ||
    normalizedText.includes('supprime') ||
    normalizedText.includes('annule')
  ) {
    type = 'remove';
  }
  // Détection d'intention de remplacement
  else if (
    normalizedText.includes('remplace') ||
    normalizedText.includes('change') ||
    normalizedText.includes('plutôt')
  ) {
    type = 'replace';
  }
  // Détection d'intention vague
  else if (
    normalizedText.includes('sais pas') ||
    normalizedText.includes('quoi prendre') ||
    normalizedText.includes('aide')
  ) {
    type = 'vague';
  }

  return {
    type,
    rawText: text,
    normalizedText,
    quantity,
    keywords,
  };
}

/**
 * Extrait les produits mentionnés dans une transcription
 * Retourne une liste de noms de produits potentiels
 */
export function extractProductNames(text: string): string[] {
  const normalizedText = text.toLowerCase();
  const products: string[] = [];

  // Produits courants dans un dépanneur
  const commonProducts = [
    'lait',
    'pain',
    'coca',
    'coke',
    'eau',
    'bière',
    'vin',
    'cigarette',
    'chips',
    'chocolat',
    'bonbon',
    'café',
    'thé',
    'jus',
    'yaourt',
    'fromage',
    'jambon',
    'œufs',
    'beurre',
    'sucre',
    'sel',
  ];

  for (const product of commonProducts) {
    if (normalizedText.includes(product)) {
      products.push(product);
    }
  }

  return products;
}

/**
 * Crée un ID de commande mock à partir d'un appel
 */
export function createMockOrderId(callId: string): string {
  return `order_tel_${callId.slice(-8)}`;
}

/**
 * Transforme une intention parsée en action de commande mock
 */
export function intentToOrderAction(intent: ParsedIntent): {
  action: 'create_order' | 'clarify' | 'no_action';
  items?: { name: string; quantity: number }[];
  message: string;
} {
  if (intent.type === 'add') {
    const productNames = extractProductNames(intent.rawText);

    if (productNames.length === 0) {
      return {
        action: 'clarify',
        message: 'Je n\'ai pas compris quel produit vous souhaitez. Pouvez-vous préciser ?',
      };
    }

    return {
      action: 'create_order',
      items: productNames.map((name) => ({
        name,
        quantity: intent.quantity,
      })),
      message: `Commande créée avec ${productNames.join(', ')}`,
    };
  }

  if (intent.type === 'vague') {
    return {
      action: 'clarify',
      message: 'Je peux vous aider. Quels produits recherchez-vous ?',
    };
  }

  return {
    action: 'no_action',
    message: 'Commande non créée. Action non reconnue.',
  };
}
