import express from 'express';
import healthRouter from './routes/health';
import catalogRouter from './routes/catalog';
import customersRouter from './routes/customers';
import addressesRouter from './routes/addresses';
import ordersRouter from './routes/orders';
import telephonyRouter from './routes/telephony';
import { ApiError } from './lib/errors';

import type { Request, Response, NextFunction } from 'express';

const app = express();

// --- Middleware ---
app.use(express.json());

// --- Routes ---
app.use('/', healthRouter);
app.use('/api/v1/catalog', catalogRouter);
app.use('/api/v1/customers', customersRouter);
app.use('/api/v1/customers/:id/addresses', addressesRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/telephony', telephonyRouter);

// --- Error handling ---
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: { message: err.message, code: err.code },
    });
    return;
  }

  // Prisma unique constraint error
  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as Record<string, unknown>)['code'] === 'P2002'
  ) {
    res.status(409).json({
      success: false,
      error: { message: 'Cette ressource existe déjà', code: 'CONFLICT' },
    });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: { message: 'Erreur interne du serveur', code: 'INTERNAL_ERROR' },
  });
});

export default app;
