# Local Setup & Verification Checklist

Follow this checklist to ensure your local environment is correctly configured and that the monorepo runs as expected.

## 1. Setup

- [ ] Clone the repository: `git clone <repo-url>`
- [ ] Install dependencies: `pnpm install`
- [ ] Copy environment variables: `cp .env.example .env.local` (update values if needed)

## 2. Verification

Run the following commands to verify code quality and builds:

- [ ] `pnpm run lint` (Should pass without errors)
- [ ] `pnpm run typecheck` (Should pass without errors)
- [ ] `pnpm run build` (Should compile all apps and packages successfully)

_Alternatively, run the all-in-one verification script: `pnpm run verify:local`_

## 3. Run Applications

- [ ] Start frontend apps: `pnpm run dev:web`
  - Verify that `web-client`, `web-store`, and `web-driver` placeholders load in the browser.
- [ ] Start backend apps: `pnpm run dev:api`
  - Verify that `/health` endpoints respond with `{"status":"ok"}` for both `api` and `phone-gateway`.

## 4. CI Match

- [ ] Verify that the commands run locally match the ones executed in `.github/workflows/ci.yml`. If it passes locally, it should pass on CI.
