import { PrismaClient } from '@prisma/client';
import type { OrderStatus } from '@depaneuria/types';
import { applyTransition, buildInitialHistory } from '../src/lib/order-state-machine';

const prisma = new PrismaClient();

const addMinutes = (date: Date, minutes: number) =>
  new Date(date.getTime() + minutes * 60000);

function buildDriverHistory(path: OrderStatus[], start: Date) {
  if (path.length === 0) {
    throw new Error('Le chemin de statut est vide');
  }

  let currentStatus = path[0];
  let history = buildInitialHistory(currentStatus, start.toISOString());
  let cursor = start;

  for (const nextStatus of path.slice(1)) {
    cursor = addMinutes(cursor, 5);
    const transition = applyTransition(
      { status: currentStatus, statusHistory: history },
      nextStatus,
      { at: cursor.toISOString() }
    );
    currentStatus = transition.nextStatus;
    history = transition.statusHistory;
  }

  return { status: currentStatus, statusHistory: history };
}

async function main() {
  console.log('🌱 Seeding database...');

  const withInventory = <T extends Record<string, unknown>>(
    data: T,
    overrides?: Partial<{ availability: string; stock: number; minStock: number }>
  ) => ({
    availability: 'en_stock',
    stock: 25,
    minStock: 5,
    ...data,
    ...overrides,
  });

  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // --- Categories ---
  const boissons = await prisma.category.create({
    data: {
      name: 'Boissons',
      slug: 'boissons',
      description: 'Boissons fraîches et chaudes',
      displayOrder: 1,
    },
  });

  const epicerie = await prisma.category.create({
    data: {
      name: 'Épicerie',
      slug: 'epicerie',
      description: 'Produits d\'épicerie courante',
      displayOrder: 2,
    },
  });

  const snacks = await prisma.category.create({
    data: {
      name: 'Collations',
      slug: 'collations',
      description: 'Chips, barres et collations',
      displayOrder: 3,
    },
  });

  const hygiene = await prisma.category.create({
    data: {
      name: 'Hygiène',
      slug: 'hygiene',
      description: 'Produits d\'hygiène et soins',
      displayOrder: 4,
    },
  });

  // --- Products: Boissons ---
  await prisma.product.createMany({
    data: [
      withInventory({
        name: 'Eau Naya 1L',
        slug: 'eau-naya-1l',
        description: 'Eau de source naturelle 1 litre',
        price: 1.99,
        unit: 'bouteille',
        categoryId: boissons.id,
        displayOrder: 1,
        popular: true,
      }),
      withInventory({
        name: 'Coca-Cola 355ml',
        slug: 'coca-cola-355ml',
        description: 'Canette de Coca-Cola classique',
        price: 1.49,
        unit: 'canette',
        categoryId: boissons.id,
        displayOrder: 2,
        popular: true,
      }),
      withInventory({
        name: 'Jus d\'orange Tropicana 1L',
        slug: 'jus-orange-tropicana-1l',
        description: 'Jus d\'orange pur à 100%',
        price: 4.49,
        unit: 'carton',
        categoryId: boissons.id,
        displayOrder: 3,
        popular: false,
      }),
      withInventory({
        name: 'Café filtre maison',
        slug: 'cafe-filtre-maison',
        description: 'Café fraîchement préparé',
        price: 2.25,
        unit: 'tasse',
        categoryId: boissons.id,
        displayOrder: 4,
        popular: false,
      }),
    ],
  });

  // --- Products: Épicerie ---
  await prisma.product.createMany({
    data: [
      withInventory({
        name: 'Pain blanc tranché',
        slug: 'pain-blanc-tranche',
        description: 'Pain de mie blanc classique',
        price: 3.49,
        unit: 'sac',
        categoryId: epicerie.id,
        displayOrder: 1,
        popular: true,
      }),
      withInventory({
        name: 'Lait 2% 2L',
        slug: 'lait-2-pourcent-2l',
        description: 'Lait partiellement écrémé 2 litres',
        price: 4.99,
        unit: 'carton',
        categoryId: epicerie.id,
        displayOrder: 2,
        popular: true,
      }),
      withInventory({
        name: 'Œufs gros calibre x12',
        slug: 'oeufs-gros-x12',
        description: 'Douzaine d\'œufs gros calibre',
        price: 5.49,
        unit: 'douzaine',
        categoryId: epicerie.id,
        displayOrder: 3,
        popular: false,
      }),
      withInventory({
        name: 'Beurre salé 454g',
        slug: 'beurre-sale-454g',
        description: 'Beurre de laiterie salé',
        price: 5.99,
        unit: 'bloc',
        categoryId: epicerie.id,
        displayOrder: 4,
        popular: false,
      }),
    ],
  });

  // --- Products: Collations ---
  await prisma.product.createMany({
    data: [
      withInventory({
        name: 'Chips Lays Nature 235g',
        slug: 'chips-lays-nature-235g',
        description: 'Croustilles nature classiques',
        price: 4.29,
        unit: 'sac',
        categoryId: snacks.id,
        displayOrder: 1,
        popular: true,
      }),
      withInventory({
        name: 'Barre Oh Henry!',
        slug: 'barre-oh-henry',
        description: 'Barre chocolatée Oh Henry! classique',
        price: 1.79,
        unit: 'barre',
        categoryId: snacks.id,
        displayOrder: 2,
        popular: false,
      }),
      withInventory({
        name: 'Arachides salées 350g',
        slug: 'arachides-salees-350g',
        description: 'Arachides rôties salées',
        price: 3.99,
        unit: 'pot',
        categoryId: snacks.id,
        displayOrder: 3,
        popular: false,
      }, { stock: 8, availability: 'rupture' }),
    ],
  });

  // --- Products: Hygiène ---
  await prisma.product.createMany({
    data: [
      withInventory({
        name: 'Papier hygiénique 12 rouleaux',
        slug: 'papier-hygienique-12-rouleaux',
        description: 'Papier hygiénique double épaisseur',
        price: 8.99,
        unit: 'paquet',
        categoryId: hygiene.id,
        displayOrder: 1,
        popular: true,
      }, { minStock: 12 }),
      withInventory({
        name: 'Savon à mains 500ml',
        slug: 'savon-mains-500ml',
        description: 'Savon liquide pour les mains',
        price: 3.49,
        unit: 'pompe',
        categoryId: hygiene.id,
        displayOrder: 2,
        popular: false,
      }),
    ],
  });

  // --- Demo customer ---
  const customer = await prisma.customer.create({
    data: {
      firstName: 'Jean',
      lastName: 'Tremblay',
      email: 'jean.tremblay@example.com',
      phone: '514-555-0100',
    },
  });

  const address = await prisma.address.create({
    data: {
      customerId: customer.id,
      label: 'Domicile',
      street: '1234 Rue Sainte-Catherine Est',
      city: 'Montréal',
      postalCode: 'H2L 2H5',
      country: 'Canada',
      isDefault: true,
    },
  });

  // --- Demo orders for driver flow ---
  const demoProductSlugs = [
    'coca-cola-355ml',
    'chips-lays-nature-235g',
    'lait-2-pourcent-2l',
    'papier-hygienique-12-rouleaux',
  ];

  const demoProducts = await prisma.product.findMany({
    where: { slug: { in: demoProductSlugs } },
  });

  const productBySlug = new Map(demoProducts.map((p) => [p.slug, p]));

  const buildOrderItems = (entries: Array<{ slug: string; quantity: number }>) => {
    let total = 0;
    const items = entries.map(({ slug, quantity }) => {
      const product = productBySlug.get(slug);
      if (!product) {
        throw new Error(`Produit manquant pour le seed: ${slug}`);
      }
      total += product.price * quantity;
      return {
        productId: product.id,
        quantity,
        unitPrice: product.price,
      };
    });

    return {
      total: Math.round(total * 100) / 100,
      items,
    };
  };

  const now = new Date();

  const readyHistory = buildDriverHistory(
    ['draft', 'submitted', 'accepted', 'preparing', 'ready_for_delivery'],
    addMinutes(now, -30)
  );
  const readyItems = buildOrderItems([
    { slug: 'coca-cola-355ml', quantity: 2 },
    { slug: 'chips-lays-nature-235g', quantity: 1 },
  ]);

  await prisma.order.create({
    data: {
      customerId: customer.id,
      addressId: address.id,
      status: readyHistory.status,
      statusHistory: readyHistory.statusHistory,
      totalAmount: readyItems.total,
      notes: 'Livrer à la porte arrière si possible.',
      items: {
        create: readyItems.items,
      },
    },
  });

  const deliveredHistory = buildDriverHistory(
    [
      'draft',
      'submitted',
      'accepted',
      'preparing',
      'ready_for_delivery',
      'assigned_to_driver',
      'out_for_delivery',
      'delivered',
    ],
    addMinutes(now, -90)
  );
  const deliveredItems = buildOrderItems([
    { slug: 'lait-2-pourcent-2l', quantity: 1 },
    { slug: 'papier-hygienique-12-rouleaux', quantity: 1 },
  ]);

  await prisma.order.create({
    data: {
      customerId: customer.id,
      addressId: address.id,
      status: deliveredHistory.status,
      statusHistory: deliveredHistory.statusHistory,
      totalAmount: deliveredItems.total,
      notes: 'Laisser au concierge si personne ne répond.',
      items: {
        create: deliveredItems.items,
      },
    },
  });

  const productCount = await prisma.product.count();
  const categoryCount = await prisma.category.count();
  const orderCount = await prisma.order.count();
  console.log(
    `✅ Seed terminé: ${categoryCount} catégories, ${productCount} produits, ${orderCount} commandes démo, 1 client démo.`
  );
}

main()
  .catch((e) => {
    console.error('❌ Seed échoué:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
