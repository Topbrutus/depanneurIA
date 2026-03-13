// ---------------------------------------------------------------------------
// Store mémoire simple des appels téléphoniques
// ---------------------------------------------------------------------------

import type {
  TelephonyCall,
  CallStatus,
  CallDirection,
  TelephonyEvent,
  Transcription,
} from '@depaneuria/types';

/**
 * Store en mémoire pour les appels téléphoniques simulés
 * IMPORTANT: Ce store sera remplacé par une vraie base de données en production
 */
class TelephonyStore {
  private calls: Map<string, TelephonyCall> = new Map();

  /**
   * Créer un nouvel appel
   */
  createCall(call: TelephonyCall): TelephonyCall {
    this.calls.set(call.id, call);
    return call;
  }

  /**
   * Récupérer un appel par ID
   */
  getCall(callId: string): TelephonyCall | undefined {
    return this.calls.get(callId);
  }

  /**
   * Mettre à jour un appel
   */
  updateCall(callId: string, updates: Partial<TelephonyCall>): TelephonyCall | undefined {
    const call = this.calls.get(callId);
    if (!call) return undefined;

    const updatedCall = { ...call, ...updates };
    this.calls.set(callId, updatedCall);
    return updatedCall;
  }

  /**
   * Ajouter un événement à un appel
   */
  addEvent(callId: string, event: TelephonyEvent): TelephonyCall | undefined {
    const call = this.calls.get(callId);
    if (!call) return undefined;

    call.events.push(event);
    this.calls.set(callId, call);
    return call;
  }

  /**
   * Ajouter une transcription à un appel
   */
  addTranscription(callId: string, transcription: Transcription): TelephonyCall | undefined {
    const call = this.calls.get(callId);
    if (!call) return undefined;

    call.transcriptions.push(transcription);
    this.calls.set(callId, call);
    return call;
  }

  /**
   * Récupérer l'historique des appels avec filtres optionnels
   */
  getHistory(options: {
    limit?: number;
    offset?: number;
    status?: CallStatus;
    direction?: CallDirection;
  } = {}): { calls: TelephonyCall[]; total: number } {
    const { limit = 50, offset = 0, status, direction } = options;

    let filtered = Array.from(this.calls.values());

    // Filtrer par statut si demandé
    if (status) {
      filtered = filtered.filter((call) => call.status === status);
    }

    // Filtrer par direction si demandé
    if (direction) {
      filtered = filtered.filter((call) => call.direction === direction);
    }

    // Trier par date de début (plus récent en premier)
    filtered.sort((a, b) => b.startedAt - a.startedAt);

    const total = filtered.length;
    const calls = filtered.slice(offset, offset + limit);

    return { calls, total };
  }

  /**
   * Supprimer tous les appels (utile pour les tests)
   */
  clear(): void {
    this.calls.clear();
  }

  /**
   * Obtenir le nombre total d'appels
   */
  count(): number {
    return this.calls.size;
  }
}

// Instance singleton du store
export const telephonyStore = new TelephonyStore();
