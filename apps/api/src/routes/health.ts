/**
 * Health check endpoint
 * Provides status information about the API
 */

import { Router, Request, Response } from 'express';
import { env } from '../lib/env.js';

const router = Router();

interface HealthResponse {
  success: true;
  data: {
    status: 'ok';
    timestamp: string;
    environment: string;
    version: string;
    uptime: number;
  };
}

/**
 * GET /health
 * Returns API health status
 */
router.get('/', (req: Request, res: Response) => {
  const response: HealthResponse = {
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: '0.1.0',
      uptime: process.uptime(),
    },
  };

  res.json(response);
});

export default router;
