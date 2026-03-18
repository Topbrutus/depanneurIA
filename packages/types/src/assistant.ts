// ---------------------------------------------------------------------------
// Types partagés — module assistant texte V1
// ---------------------------------------------------------------------------

export type AssistantMessageRole = 'user' | 'assistant';

export interface AssistantMessage {
  id: string;
  role: AssistantMessageRole;
  text: string;
  timestamp: number;
}

/** Intention détectée dans le message de l'utilisateur */
export type IntentType =
  | 'add'     // "je veux du lait", "mets 2 coke"
  | 'remove'  // "enlève le lait"
  | 'replace' // "remplace par autre chose"
  | 'vague'   // "je sais pas quoi prendre"
  | 'unknown';

export interface ParsedIntent {
  type: IntentType;
  rawText: string;
  normalizedText: string;
  quantity: number;
  keywords: string[];
}

export interface CatalogProduct {
  id: string;
  name: string;
  category: string;
  brand?: string;
  price: number;
  available: boolean;
}

export type MatchConfidence = 'exact' | 'partial' | 'none';

export interface MatchResult {
  product: CatalogProduct | null;
  candidates: CatalogProduct[];
  confidence: MatchConfidence;
}

export type AssistantActionType =
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'clarify'
  | 'suggest'
  | 'none';

export interface AssistantAction {
  type: AssistantActionType;
  productId?: string;
  quantity?: number;
}

export interface AssistantResponse {
  text: string;
  action: AssistantAction;
  suggestions: CatalogProduct[];
  needsClarification: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
  productName: string;
}

export interface CartAdapter {
  addItem(productId: string, quantity: number, productName: string): void;
  removeItem(productId: string): void;
  getItems(): CartItem[];
}
