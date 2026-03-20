/** Correspondance chiffres-lettres pour les quantités en français. */
const WORD_TO_NUMBER: Record<string, number> = {
  un: 1,
  une: 1,
  deux: 2,
  trois: 3,
  quatre: 4,
  cinq: 5,
  six: 6,
  sept: 7,
  huit: 8,
  neuf: 9,
  dix: 10,
};

/**
 * Extrait la quantité demandée dans un texte normalisé.
 * Priorité : chiffre arabe → nombre en lettres → défaut 1.
 */
export function extractQuantity(normalizedText: string): number {
  const digitMatch = normalizedText.match(/\b(\d+)\b/);
  if (digitMatch?.[1] !== undefined) {
    const n = parseInt(digitMatch[1], 10);
    return n > 0 ? n : 1;
  }

  for (const word of normalizedText.split(' ')) {
    const n = WORD_TO_NUMBER[word];
    if (n !== undefined) return n;
  }

  return 1;
}
