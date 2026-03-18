/**
 * Normalise un texte en vue du matching :
 * - minuscules
 * - suppression des accents (NFD)
 * - suppression de la ponctuation
 * - collapse des espaces
 */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Mots vides français à ignorer lors de l'extraction des mots-clés produit.
 * Inclut les déclencheurs d'intention pour ne garder que le "sujet" de la demande.
 */
const STOP_WORDS = new Set([
  // pronoms et articles
  'je', 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles',
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'en', 'au', 'aux',
  // conjonctions / prépositions courtes
  'et', 'ou', 'par', 'pour', 'avec', 'dans', 'sur', 'sous',
  // déclencheurs d'intention add
  'veux', 'voudrais', 'aimerais', 'voudrait', 'mets', 'ajoute', 'rajoute',
  'donne', 'moi', 'apporte', 'commande', 'prends', 'as', 'avez', 'stp', 'svp',
  // déclencheurs d'intention remove
  'enleve', 'retire', 'supprime', 'efface',
  // déclencheurs d'intention replace
  'remplace', 'remplacer', 'change', 'changer', 'plutot', 'autre', 'chose',
  // déclencheurs d'intention vague
  'sais', 'sait', 'quoi', 'prendre', 'choisir', 'n', 'importe', 'surprise',
  // mots-outils supplémentaires
  'pas', 'ne', 'ni', 'si', 'y', 'il', 'a', 'besoin', 'avoir',
  // nombres en lettres (la quantité est extraite séparément)
  'un', 'deux', 'trois', 'quatre', 'cinq',
  'six', 'sept', 'huit', 'neuf', 'dix',
]);

/** Retourne les mots significatifs (produit/marque/catégorie) d'un texte normalisé. */
export function extractKeywords(normalizedText: string): string[] {
  return normalizedText
    .split(' ')
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}
