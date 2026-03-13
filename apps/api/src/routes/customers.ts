import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { mapCustomer } from '../lib/mappers';
import { requireString, requireEmail, optionalString } from '../lib/validators';
import { NotFoundError } from '../lib/errors';

const router = Router();

/** POST /api/v1/customers — Créer un client */
router.post('/', async (req, res, next) => {
  try {
    const firstName = requireString(req.body.firstName, 'firstName');
    const lastName = requireString(req.body.lastName, 'lastName');
    const email = requireEmail(req.body.email, 'email');
    const phone = optionalString(req.body.phone);

    const customer = await prisma.customer.create({
      data: { firstName, lastName, email, phone },
    });

    res.status(201).json({
      success: true,
      data: mapCustomer(customer),
    });
  } catch (err) {
    next(err);
  }
});

/** GET /api/v1/customers/:id — Obtenir un client */
router.get('/:id', async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params['id'] },
    });

    if (!customer) {
      throw new NotFoundError('Client');
    }

    res.json({
      success: true,
      data: mapCustomer(customer),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
