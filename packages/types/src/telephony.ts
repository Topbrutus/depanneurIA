// ---------------------------------------------------------------------------
// Types partagés — module téléphonie V1 simulée
// ---------------------------------------------------------------------------

/**
 * État d'un appel téléphonique
 */
export type CallStatus =
  | 'ringing'      // appel entrant
  | 'in_progress'  // conversation en cours
  | 'completed'    // appel terminé avec succès
  | 'failed'       // appel échoué
  | 'no_answer';   // pas de réponse

/**
 * Direction de l'appel
 */
export type CallDirection = 'inbound' | 'outbound';

/**
 * Événement durant un appel
 */
export interface TelephonyEvent {
  id: string;
  callId: string;
  type: 'call_started' | 'transcription_received' | 'intent_parsed' | 'order_created' | 'call_ended' | 'error';
  timestamp: number;
  data?: Record<string, unknown>;
}

/**
 * Transcription d'un segment audio
 */
export interface Transcription {
  id: string;
  callId: string;
  text: string;
  confidence: number;  // 0-1
  timestamp: number;
  speaker: 'customer' | 'agent';
}

/**
 * Appel téléphonique simulé
 */
export interface TelephonyCall {
  id: string;
  direction: CallDirection;
  from: string;     // numéro du client
  to: string;       // numéro du dépanneur
  status: CallStatus;
  startedAt: number;
  endedAt?: number;
  duration?: number; // en secondes
  customerId?: string;
  orderId?: string;  // ID de commande créée suite à l'appel
  transcriptions: Transcription[];
  events: TelephonyEvent[];
}

/**
 * Requête pour simuler un appel entrant
 */
export interface SimulateCallRequest {
  from: string;
  to: string;
  transcriptionText: string;  // texte simulé de ce que dit le client
  customerId?: string;
}

/**
 * Résultat de simulation d'appel
 */
export interface SimulateCallResponse {
  success: boolean;
  call: TelephonyCall;
  orderId?: string;
  message?: string;
}

/**
 * Historique des appels
 */
export interface CallHistoryQuery {
  limit?: number;
  offset?: number;
  status?: CallStatus;
  direction?: CallDirection;
}

export interface CallHistoryResponse {
  success: boolean;
  calls: TelephonyCall[];
  total: number;
  limit: number;
  offset: number;
}
