import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { mapAddress } from '../lib/mappers';
import { requireString, optionalString } from '../lib/validators';
import { NotFoundError } from '../lib/errors';

import type { Request } from 'express';

interface CustomerParams {
  id: string;
}

const router = Router({ mergeParams: true });

/** GET /api/v1/customers/:id/addresses — Lister les adresses d'un client */
router.get('/', async (req: Request<CustomerParams>, res, next) => {
  try {
    const customerId = req.params.id;

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      throw new NotFoundError('Client');
    }

    const addresses = await prisma.address.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: addresses.map(mapAddress),
    });
  } catch (err) {
    next(err);
  }
});

/** POST /api/v1/customers/:id/addresses — Ajouter une adresse */
router.post('/', async (req: Request<CustomerParams>, res, next) => {
  try {
    const customerId = req.params.id;

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      throw new NotFoundError('Client');
    }

    const street = requireString(req.body.street, 'street');
    const city = requireString(req.body.city, 'city');
    const postalCode = requireString(req.body.postalCode, 'postalCode');
    const label = optionalString(req.body.label) ?? 'Domicile';
    const country = optionalString(req.body.country) ?? 'Canada';
    const isDefault = req.body.isDefault === true;
    const notes = optionalString(req.body.notes);

    // If this address is default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { customerId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        customerId,
        label,
        street,
        city,
        postalCode,
        country,
        isDefault,
        notes,
      },
    });

    res.status(201).json({
      success: true,
      data: mapAddress(address),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
