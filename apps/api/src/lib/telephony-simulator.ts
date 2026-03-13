// ---------------------------------------------------------------------------
// Simulateur d'appels téléphoniques sans provider réel
// ---------------------------------------------------------------------------

import type {
  TelephonyCall,
  Transcription,
  SimulateCallRequest,
  SimulateCallResponse,
} from '@depaneuria/types';
import { telephonyStore } from './telephony-store';
import {
  createCallStartedEvent,
  createTranscriptionReceivedEvent,
  createIntentParsedEvent,
  createOrderCreatedEvent,
  createCallEndedEvent,
} from './telephony-events';
import {
  parseTranscriptionIntent,
  intentToOrderAction,
  createMockOrderId,
} from './telephony-mappers';

/**
 * Génère un ID unique pour un appel
 */
function generateCallId(): string {
  return `call_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Génère un ID unique pour une transcription
 */
function generateTranscriptionId(): string {
  return `trans_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Simule un appel entrant avec transcription
 */
export async function simulateInboundCall(
  request: SimulateCallRequest
): Promise<SimulateCallResponse> {
  const callId = generateCallId();
  const startTime = Date.now();

  try {
    // 1. Créer l'appel initial
    const call: TelephonyCall = {
      id: callId,
      direction: 'inbound',
      from: request.from,
      to: request.to,
      status: 'in_progress',
      startedAt: startTime,
      customerId: request.customerId,
      transcriptions: [],
      events: [],
    };

    telephonyStore.createCall(call);

    // 2. Ajouter l'événement de démarrage
    telephonyStore.addEvent(callId, createCallStartedEvent(callId));

    console.log(`[Telephony] Call started: ${callId} from ${request.from}`);

    // 3. Créer et ajouter la transcription simulée
    const transcriptionId = generateTranscriptionId();
    const transcription: Transcription = {
      id: transcriptionId,
      callId,
      text: request.transcriptionText,
      confidence: 0.95, // Simulé
      timestamp: Date.now(),
      speaker: 'customer',
    };

    telephonyStore.addTranscription(callId, transcription);
    telephonyStore.addEvent(
      callId,
      createTranscriptionReceivedEvent(callId, transcriptionId, request.transcriptionText)
    );

    console.log(`[Telephony] Transcription received: "${request.transcriptionText}"`);

    // 4. Parser l'intention
    const intent = parseTranscriptionIntent(request.transcriptionText);
    telephonyStore.addEvent(callId, createIntentParsedEvent(callId, intent.type, 0.9));

    console.log(`[Telephony] Intent parsed: ${intent.type}`);

    // 5. Transformer en action de commande
    const orderAction = intentToOrderAction(intent);
    let orderId: string | undefined;

    if (orderAction.action === 'create_order' && orderAction.items) {
      orderId = createMockOrderId(callId);
      telephonyStore.updateCall(callId, { orderId });
      telephonyStore.addEvent(callId, createOrderCreatedEvent(callId, orderId));

      console.log(`[Telephony] Mock order created: ${orderId} with items:`, orderAction.items);
    }

    // 6. Terminer l'appel
    const endTime = Date.now();
    const duration = Math.floor((endTime - startTime) / 1000);

    telephonyStore.updateCall(callId, {
      status: 'completed',
      endedAt: endTime,
      duration,
    });

    telephonyStore.addEvent(callId, createCallEndedEvent(callId, duration));

    console.log(`[Telephony] Call completed: ${callId} (${duration}s)`);

    // 7. Récupérer l'appel mis à jour
    const updatedCall = telephonyStore.getCall(callId);

    if (!updatedCall) {
      return {
        success: false,
        call: call,
        message: 'Erreur lors de la récupération de l\'appel',
      };
    }

    return {
      success: true,
      call: updatedCall,
      orderId,
      message: orderAction.message,
    };
  } catch (error) {
    // En cas d'erreur, marquer l'appel comme échoué
    const endTime = Date.now();
    const duration = Math.floor((endTime - startTime) / 1000);

    telephonyStore.updateCall(callId, {
      status: 'failed',
      endedAt: endTime,
      duration,
    });

    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error(`[Telephony] Call failed: ${callId}`, errorMessage);

    const failedCall = telephonyStore.getCall(callId);

    return {
      success: false,
      call: failedCall || ({} as TelephonyCall),
      message: `Erreur lors de la simulation: ${errorMessage}`,
    };
  }
}
