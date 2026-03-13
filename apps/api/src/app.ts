import express from 'express';
import healthRouter from './routes/health';
import catalogRouter from './routes/catalog';
import adminCatalogRouter from './routes/admin-catalog';
import customersRouter from './routes/customers';
import addressesRouter from './routes/addresses';
import ordersRouter from './routes/orders';
import telephonyRouter from './routes/telephony';
import tenantsRouter from './routes/tenants';
import authRouter from './routes/auth';
import { ApiError } from './lib/errors';
import { extractSession } from './lib/auth-middleware';
import {
  requireAdminAccess,
  requireCatalogManagement,
} from './lib/role-guards';

import type { Request, Response, NextFunction } from 'express';

const app = express();

// --- Middleware ---
app.use(express.json());
app.use(extractSession); // Extrait session de tous les requêtes

// --- Routes publiques (pas d'auth requise) ---
app.use('/', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/catalog', catalogRouter); // Catalogue accessible à tous

// --- Routes protégées ---
// Admin catalog - seulement admin
app.use('/admin/catalog', requireCatalogManagement, adminCatalogRouter);

// Customers/addresses - pour l'instant public pour compatibilité, à restreindre plus tard
app.use('/api/v1/customers', customersRouter);
app.use('/api/v1/customers/:id/addresses', addressesRouter);

// Orders - accessible aux clients, opérateurs store et admin
app.use('/api/v1/orders', ordersRouter);

// Telephony - pour l'instant public (sera restreint plus tard)
app.use('/api/v1/telephony', telephonyRouter);

// Tenants - seulement admin
app.use('/api/v1/tenants', requireAdminAccess, tenantsRouter);

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
