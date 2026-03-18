import type { IntentType, ParsedIntent } from '@depaneuria/types';

import { extractKeywords, normalize } from './normalize';
import { extractQuantity } from './quantity';

// ---------------------------------------------------------------------------
// Tables de déclencheurs — ordre d'évaluation : vague > replace > remove > add
// ---------------------------------------------------------------------------

const VAGUE_TRIGGERS = [
  'sais pas', 'sait pas', 'aucune idee', 'quoi prendre',
  'quoi choisir', 'n importe', 'surprise moi',
] as const;

const REPLACE_TRIGGERS = [
  'remplace', 'remplacer', 'plutot autre', 'autre chose', 'change ca',
] as const;

const REMOVE_TRIGGERS = [
  'enleve', 'retire', 'supprime', 'efface',
] as const;

const ADD_TRIGGERS = [
  'je veux', 'je voudrais', 'j aimerais',
  'mets ', 'ajoute ', 'rajoute ',
  'donne moi', 'apporte moi',
  'commande ', 'prends ',
  'as tu', 'avez vous', 'tu as', 'il y a',
  'j ai besoin',
] as const;

function containsAny(text: string, triggers: readonly string[]): boolean {
  return triggers.some((t) => text.includes(t));
}

/**
 * Analyse l'intention d'un message utilisateur.
 * Retourne le type d'intention, les mots-clés produit et la quantité.
 */
export function parseIntent(rawText: string): ParsedIntent {
  const normalizedText = normalize(rawText);
  const quantity = extractQuantity(normalizedText);
  const keywords = extractKeywords(normalizedText);

  let type: IntentType;

  if (containsAny(normalizedText, VAGUE_TRIGGERS)) {
    type = 'vague';
  } else if (containsAny(normalizedText, REPLACE_TRIGGERS)) {
    type = 'replace';
  } else if (containsAny(normalizedText, REMOVE_TRIGGERS)) {
    type = 'remove';
  } else if (containsAny(normalizedText, ADD_TRIGGERS)) {
    type = 'add';
  } else if (keywords.length > 0) {
    // Phrase courte sans déclencheur explicite mais avec un mot produit → add implicite
    type = 'add';
  } else {
    type = 'unknown';
  }

  return { type, rawText, normalizedText, quantity, keywords };
}
