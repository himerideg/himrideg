# HimRideG Phase 7 — Customer/Driver Session Role 403 Fix

## Screenshot issue
Customer/driver browser session me `/rides/driver/feed`, `/driver/profile`,
`/rides/driver/active` par repeated 403 aa sakta tha jab frontend saved user aur
access/refresh token identity mismatch ho jati thi.

## Root cause hardened
Customer aur Driver dono purana single `refreshToken` httpOnly cookie share kar
rahe the. Same browser me alag tabs/roles login karne par latest login legacy
cookie overwrite kar sakta tha. Access token expire hone ke baad refresh wrong
role ki session issue kar sakta tha.

## Add-only fix
- `refreshToken_customer` role-specific cookie add.
- `refreshToken_driver` role-specific cookie add.
- Legacy `refreshToken` cookie backward compatibility ke liye preserve.
- `/auth/refresh` expected role header ke basis par correct role cookie choose karta hai.
- Refresh JWT role mismatch ho to safe 401; silent cross-role switch nahi hota.
- Frontend refresh request `X-HimRideG-Role` bhejti hai.
- Frontend access-token role/id aur stored user role/id mismatch detect karta hai.
- Explicit 403 role mismatch par stale session safely clear hoti hai instead of infinite 403 polling.
- Driver approval 403 ko role mismatch nahi maana gaya; onboarding behavior preserve hai.

## Full Code Rule
- Existing files delete/rename nahi kiye.
- Existing customer/driver/admin/map/fare/payment business flow remove nahi kiya.
- Existing legacy cookie behavior compatibility ke liye preserve kiya.
- New protection additive hai.
