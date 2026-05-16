# Delta for auth-y-login

> New capabilities: `auth-backend` + `auth-frontend`. Full specs — no prior behavior.

## auth-backend

| # | Requirement | MUST/SHALL | Scenarios (GIVEN→WHEN→THEN) |
|---|---|---|---|
| BE1 | **User model**: Roles SOCIO\|COLABORADOR. Fields: `nombre`, `emoji?`, `telegramChatId?`, `estudioId=1`, `googleTokens?`, `activo=true`. Remove `userName`, `firstName`, `lastName`, `isVerified`, `deletedAt`. Soft-delete via `activo: false`. | MUST | **Migration applies**: GIVEN migration run → WHEN querying User → THEN new fields exist, old fields removed. **Soft delete**: GIVEN user activo=true → WHEN deleted → THEN activo=false, row preserved. |
| BE2 | **RefreshToken model**: `id` UUID, `usuarioId` FK, `token` hash unique, `expira` DateTime, `revocado` bool=false, `creadoEn` now(). Repository with CRUD + `findByUsuarioIdNotRevoked()`. | MUST | **Token stored on login**: GIVEN login succeeds → WHEN tokens generated → THEN RefreshToken row created with hashed refresh, expira=now+7d, revocado=false. |
| BE3 | **Login**: email+password via argon2 → JWT access (15min) + refresh (7d), persisted in DB. | MUST | **Success**: GIVEN valid credentials → WHEN POST /v1/auth/login → THEN 200 + accessToken + refreshToken + user. **Bad password**: GIVEN wrong password → WHEN login → THEN 400 `auth.error.invalidPassword`. |
| BE4 | **Signup SOCIO-only**: Only SOCIO users MAY create users. Unauthenticated → 401. COLABORADOR → 403. New users default to COLABORADOR. | MUST | **SOCIO creates**: GIVEN authenticated SOCIO → WHEN POST signup with nombre+email+password → THEN 201 + new COLABORADOR user + tokens. **Rejected anonymous**: GIVEN no JWT → WHEN signup → THEN 401. **Rejected COLABORADOR**: GIVEN COLABORADOR → WHEN signup → THEN 403. |
| BE5 | **Refresh rotation**: On refresh, issue new access+refresh pair, mark old token `revocado=true` in DB, persist new hash. Reuse of revoked/expired token → 401. | MUST | **Rotation**: GIVEN valid non-revoked token → WHEN GET /v1/auth/refresh-token → THEN new pair returned, old revoked, new persisted. **Reuse blocked**: GIVEN revoked token → WHEN refresh → THEN 401. |
| BE6 | **Logout**: Revoke current user's refresh token in DB. Post-logout refresh attempts → 401. | MUST | **Revoke**: GIVEN authenticated user → WHEN POST /v1/auth/logout → THEN token marked revocado=true, 200. **Post-logout refresh**: GIVEN revoked token → WHEN refresh → THEN 401. |
| BE7 | **Role guard**: `@AllowedRoles([UserRole.SOCIO])` blocks COLABORADOR with 403. Global `JwtAccessGuard` on all non-public endpoints. | MUST | **SOCIO passes**: GIVEN SOCIO token → WHEN accessing @AllowedRoles([SOCIO]) → THEN granted. **COLABORADOR blocked**: GIVEN COLABORADOR token → WHEN accessing SOCIO-only endpoint → THEN 403. |

## auth-frontend

| # | Requirement | MUST/SHALL | Scenarios (GIVEN→WHEN→THEN) |
|---|---|---|---|
| FE1 | **Zustand auth store**: `user`, `accessToken` (memory-only, never localStorage), `isAuthenticated` (derived). Actions: `login()`, `logout()`, `refresh()`, `setUser()`. | MUST | **Login populates**: GIVEN empty store → WHEN login succeeds → THEN user+token set, isAuthenticated=true. **Logout clears**: GIVEN authenticated → WHEN logout() → THEN user=null, token=null, isAuthenticated=false. |
| FE2 | **Login page**: Fetch active users → display emoji + nombre as visual picker. Click user → password input → authenticate → redirect to /dashboard. | MUST | **Select + login**: GIVEN 3 active users shown → WHEN click user + enter password → THEN store populated, redirect /dashboard. **No users**: GIVEN zero active users → WHEN page loads → THEN "No users available" shown. |
| FE3 | **Axios interceptor**: Inject `Authorization: Bearer <token>` on every request. On 401: attempt silent refresh via httpOnly cookie, queue concurrent requests, retry. On refresh failure: clear state → redirect /login. | MUST | **Token injected**: GIVEN store has token → WHEN any API request → THEN Bearer header present. **Auto-refresh**: GIVEN 401 response → WHEN interceptor catches → THEN refresh called, original retried with new token. **Refresh fail**: GIVEN refresh also fails → WHEN interceptor retries → THEN state cleared, redirect /login. |
| FE4 | **Route middleware**: Next.js middleware protects /dashboard/* → unauthenticated redirects to /login. Authenticated on /login → redirects to /dashboard. | MUST | **Blocked**: GIVEN no session cookie → WHEN /dashboard → THEN redirect /login. **Bypassed**: GIVEN valid session → WHEN /login → THEN redirect /dashboard. |
| FE5 | **httpOnly cookie**: Backend sets `refresh_token` cookie on login+refresh: `HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`. Cleared on logout with Max-Age=0. | MUST | **Set on login**: GIVEN successful login → WHEN response sent → THEN Set-Cookie header with HttpOnly; Secure; SameSite=Strict. **Cleared on logout**: GIVEN authenticated → WHEN logout → THEN cookie cleared (Max-Age=0). |
