# Dev Scripts

This directory contains utility scripts for local development and CI environments.

## Database Management

Currently, these scripts are placeholders as the actual database technology (e.g., PostgreSQL, Firestore) has not yet been finalized.

- `migrate.ts`: Applies schema migrations.
- `seed-demo.ts`: Populates the database with demo data (tenants, products, mock orders).
- `clear-demo.ts`: Clears the demo data from the database.

Run them via pnpm:

- `pnpm run db:migrate`
- `pnpm run db:seed`
- `pnpm run db:clear`
