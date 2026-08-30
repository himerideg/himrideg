# HimRideG Website Login System Audit + Safe Fix

Base: `HimRideG_HM_G_PAYMENT_INDEPENDENT_FIXED.zip`

## Confirmed fixes applied

1. **Driver login now matches customer login flow**
   - `/driverlogin/` now uses Mobile Number -> Google verification.
   - Customer stays on `/login/`.
   - Admin stays on `/adminlogin/`.
   - The old `AuthPage.jsx` is preserved for compatibility; it was not deleted.

2. **Google Identity callback collision fixed**
   - Customer and legacy auth pages previously kept separate module-level Google singleton state even though Google Identity Services is browser-global.
   - Route switching could leave Google using a stale callback.
   - Both pages now use one browser-global HimRideG callback state.

3. **Google login 401 no longer starts refresh flow**
   - `/auth/google` is now classified as a login/auth request by the Axios interceptor.
   - Invalid/expired Google credentials now return the real Google login error instead of incorrectly trying `/auth/refresh` and showing refresh/session errors.
   - Protected `/auth/google/basic-info` remains refresh-capable.

4. **Real logout added**
   - New `POST /api/v2/auth/logout` endpoint.
   - Current refresh-token hash is revoked from MongoDB.
   - httpOnly refresh cookie is cleared.
   - Logout is idempotent: invalid/already-expired refresh token still clears the browser cookie.

5. **Legacy browser auth data cleanup**
   - Logout/session-invalid cleanup now removes stale HimRideG auth keys from both sessionStorage and old localStorage keys.
   - Prevents old token/user data from interfering with current login/socket helpers.

6. **Dedicated login-page fallback preserved**
   - If Google Basic Info saves but the local access session is unexpectedly missing, the website returns to the correct dedicated Customer or Driver login page instead of the old mixed auth page.

## Existing login behavior verified

- Customer Google login backend verifies Google ID token cryptographically.
- Driver Google login uses the same backend verification route.
- Admin Google login is not enabled; admin uses email/password.
- Google verified email is checked server-side when expected email is supplied by legacy auth flow.
- Customer/Driver access token is short-lived and refresh token is httpOnly for browser sessions.
- Multiple customer/driver refresh sessions are stored as SHA-256 hashes, capped by existing controller logic.
- Blocked/suspended/deleted/inactive users are rejected by auth middleware.
- Production CORS includes `https://himrideg.com` and `https://www.himrideg.com`.
- Production Google Client ID is present in client config and Render config.

## Intentionally not auto-changed

1. **Apple Sign-In**
   - Button exists but real Apple Developer configuration/backend is not present.

2. **Legacy unlinked account takeover protection**
   - If an old account owns a phone number but has no matching Google identity/email link, the server does not automatically attach a newly selected Google account to it.
   - This is intentionally safer; automatic linking by typed phone number alone would allow account takeover.
   - Such legacy accounts need a controlled migration/admin verification path if they still exist.

3. **Admin session duration**
   - Render currently sets the general access-token expiry to 15 minutes. Admin has no refresh-token flow, so an admin may need to sign in again after access-token expiry.
   - This was not changed because it is a security/session-policy decision.

4. **Login vs Sign-Up backend intent**
   - Google endpoint is still capable of creating a new account when no account exists. The Login/Sign-Up UI mode is primarily presentation.
   - Not hardened into separate backend intents because that could change existing onboarding behavior.

5. **Google Console configuration**
   - Code contains the Client ID, but Authorized JavaScript Origins / OAuth Console settings cannot be proven from the ZIP alone.

## Validation

- All backend `.js` files: `node --check` PASS.
- Broken relative imports in client source: 0.
- Modified frontend files: delimiter/structure checks PASS.
- Full Vite dependency install/build could not be completed in this environment because `npm ci` timed out; no claim of a runtime browser build is made.
- Incomplete `node_modules` and audit backup files are excluded from the final ZIP.
