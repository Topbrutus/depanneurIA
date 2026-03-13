// ---------------------------------------------------------------------------
// Gestion des événements téléphonie
// ---------------------------------------------------------------------------

import type { TelephonyEvent } from '@depaneuria/types';

/**
 * Génère un ID unique simple pour les événements
 */
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Crée un événement de démarrage d'appel
 */
export function createCallStartedEvent(callId: string): TelephonyEvent {
  return {
    id: generateEventId(),
    callId,
    type: 'call_started',
    timestamp: Date.now(),
    data: {
      message: 'Appel démarré',
    },
  };
}

/**
 * Crée un événement de réception de transcription
 */
export function createTranscriptionReceivedEvent(
  callId: string,
  transcriptionId: string,
  text: string
): TelephonyEvent {
  return {
    id: generateEventId(),
    callId,
    type: 'transcription_received',
    timestamp: Date.now(),
    data: {
      transcriptionId,
      text,
      message: 'Transcription reçue',
    },
  };
}

/**
 * Crée un événement d'analyse d'intention
 */
export function createIntentParsedEvent(
  callId: string,
  intent: string,
  confidence: number
): TelephonyEvent {
  return {
    id: generateEventId(),
    callId,
    type: 'intent_parsed',
    timestamp: Date.now(),
    data: {
      intent,
      confidence,
      message: `Intention détectée: ${intent}`,
    },
  };
}

/**
 * Crée un événement de création de commande
 */
export function createOrderCreatedEvent(callId: string, orderId: string): TelephonyEvent {
  return {
    id: generateEventId(),
    callId,
    type: 'order_created',
    timestamp: Date.now(),
    data: {
      orderId,
      message: `Commande créée: ${orderId}`,
    },
  };
}

/**
 * Crée un événement de fin d'appel
 */
export function createCallEndedEvent(callId: string, duration: number): TelephonyEvent {
  return {
    id: generateEventId(),
    callId,
    type: 'call_ended',
    timestamp: Date.now(),
    data: {
      duration,
      message: `Appel terminé après ${duration}s`,
    },
  };
}

/**
 * Crée un événement d'erreur
 */
export function createErrorEvent(callId: string, error: string): TelephonyEvent {
  return {
    id: generateEventId(),
    callId,
    type: 'error',
    timestamp: Date.now(),
    data: {
      error,
      message: `Erreur: ${error}`,
    },
  };
}
