# Security V1 - Testing Guide

## Overview

This guide explains how to test the role-based access control system implemented in DEP-0841.

## Test Scenarios

### 1. Mock Login with Different Roles

Navigate to `/mock-login` and test logging in with each role:

- **Customer**: Should access shop pages but be blocked from admin/store/driver
- **Store Operator**: Should access `/store-ops` but be blocked from admin/driver
- **Driver**: Should access `/driver` but be blocked from admin/store
- **Admin**: Should access all pages (admin, store, driver)

### 2. API Endpoint Protection

Test API endpoints with different roles:

```bash
# Login as admin
curl -X POST http://localhost:3000/api/v1/auth/mock-login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "role": "admin"}'
# Note the X-Session-Id header in response

# Test protected endpoint (should work)
curl -H "Authorization: Bearer {sessionId}" \
  http://localhost:3000/admin/catalog

# Login as customer
curl -X POST http://localhost:3000/api/v1/auth/mock-login \
  -H "Content-Type: application/json" \
  -d '{"username": "customer", "role": "customer"}'

# Test admin endpoint (should return 403)
curl -H "Authorization: Bearer {sessionId}" \
  http://localhost:3000/admin/catalog
```

### 3. Protected Routes on Web

1. **Try accessing `/admin/catalog` without login**
   - Should redirect to `/mock-login`

2. **Login as customer, try accessing `/admin/catalog`**
   - Should show "Accès refusé" message
   - Should display current role

3. **Login as admin, access `/admin/catalog`**
   - Should load normally

### 4. Session Persistence

1. Login with a role
2. Refresh the page
3. Session should persist (stored in localStorage)
4. Close tab and reopen
5. Session should still be active

### 5. Logout

1. Login with any role
2. Use logout functionality
3. Try accessing protected pages
4. Should redirect to login

## Expected HTTP Status Codes

- **401 Unauthorized**: No valid session
- **403 Forbidden**: Valid session but insufficient role/permissions
- **200 OK**: Authorized access

## Implementation Files

### Types

- `packages/types/src/roles.ts` - Role definitions and permissions
- `packages/types/src/auth.ts` - Session types

### API

- `apps/api/src/routes/auth.ts` - Auth endpoints
- `apps/api/src/lib/auth-store.ts` - In-memory session store
- `apps/api/src/lib/auth-middleware.ts` - Session extraction
- `apps/api/src/lib/role-guards.ts` - Permission guards

### Web

- `apps/web/src/routes/mock-login-page.tsx` - Login UI
- `apps/web/src/lib/auth-context.tsx` - Auth state management
- `apps/web/src/lib/auth-storage.ts` - localStorage persistence
- `apps/web/src/components/common/protected-route.tsx` - Route protection

## Known Limitations (V1)

- Sessions are stored in-memory (lost on server restart)
- No OAuth or real authentication provider
- No session expiration (24h cleanup exists but not enforced)
- Simple mock system for demonstration only

## Next Steps for V2

- Implement real OAuth provider (Google, GitHub, etc.)
- Add session expiration and refresh tokens
- Store sessions in Redis or database
- Add audit logging for auth events
- Implement password-based auth for non-OAuth users
