// ---------------------------------------------------------------------------
// Routes API téléphonie V1 simulée
// ---------------------------------------------------------------------------

import { Router } from 'express';
import type { Request, Response } from 'express';
import type {
  SimulateCallRequest,
  SimulateCallResponse,
  CallHistoryResponse,
  CallHistoryQuery,
} from '@depaneuria/types';
import { simulateInboundCall } from '../lib/telephony-simulator';
import { telephonyStore } from '../lib/telephony-store';
import { ApiError } from '../lib/errors';

const router = Router();

/**
 * POST /api/v1/telephony/simulate
 * Simule un appel entrant avec transcription
 */
router.post(
  '/simulate',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { from, to, transcriptionText, customerId } = req.body as SimulateCallRequest;

      // Validation des paramètres requis
      if (!from || !to || !transcriptionText) {
        throw new ApiError(
          400,
          'Les champs "from", "to" et "transcriptionText" sont obligatoires',
          'VALIDATION_ERROR'
        );
      }

      // Valider le format du numéro de téléphone (simpliste)
      if (!/^\+?\d{10,15}$/.test(from.replace(/\s/g, ''))) {
        throw new ApiError(400, 'Le numéro "from" est invalide', 'VALIDATION_ERROR');
      }

      if (!/^\+?\d{10,15}$/.test(to.replace(/\s/g, ''))) {
        throw new ApiError(400, 'Le numéro "to" est invalide', 'VALIDATION_ERROR');
      }

      // Valider que la transcription n'est pas vide
      if (transcriptionText.trim().length === 0) {
        throw new ApiError(400, 'La transcription ne peut pas être vide', 'VALIDATION_ERROR');
      }

      // Simuler l'appel
      const result: SimulateCallResponse = await simulateInboundCall({
        from,
        to,
        transcriptionText,
        customerId,
      });

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      console.error('[Telephony API] Error simulating call:', error);
      throw new ApiError(500, 'Erreur lors de la simulation d\'appel', 'INTERNAL_ERROR');
    }
  }
);

/**
 * GET /api/v1/telephony/history
 * Récupère l'historique des appels avec filtres optionnels
 */
router.get(
  '/history',
  (req: Request, res: Response): void => {
    try {
      const query: CallHistoryQuery = {
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0,
        status: req.query.status as CallHistoryQuery['status'],
        direction: req.query.direction as CallHistoryQuery['direction'],
      };

      // Validation des paramètres
      if (query.limit && (query.limit < 1 || query.limit > 100)) {
        throw new ApiError(400, 'Le paramètre "limit" doit être entre 1 et 100', 'VALIDATION_ERROR');
      }

      if (query.offset && query.offset < 0) {
        throw new ApiError(400, 'Le paramètre "offset" ne peut pas être négatif', 'VALIDATION_ERROR');
      }

      // Récupérer l'historique
      const { calls, total } = telephonyStore.getHistory(query);

      const response: CallHistoryResponse = {
        success: true,
        calls,
        total,
        limit: query.limit || 50,
        offset: query.offset || 0,
      };

      res.status(200).json(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      console.error('[Telephony API] Error fetching history:', error);
      throw new ApiError(500, 'Erreur lors de la récupération de l\'historique', 'INTERNAL_ERROR');
    }
  }
);

/**
 * GET /api/v1/telephony/calls/:callId
 * Récupère les détails d'un appel spécifique
 */
router.get(
  '/calls/:callId',
  (req: Request, res: Response): void => {
    try {
      const { callId } = req.params;

      const call = telephonyStore.getCall(callId);

      if (!call) {
        throw new ApiError(404, 'Appel non trouvé', 'NOT_FOUND');
      }

      res.status(200).json({
        success: true,
        call,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      console.error('[Telephony API] Error fetching call:', error);
      throw new ApiError(500, 'Erreur lors de la récupération de l\'appel', 'INTERNAL_ERROR');
    }
  }
);

export default router;
