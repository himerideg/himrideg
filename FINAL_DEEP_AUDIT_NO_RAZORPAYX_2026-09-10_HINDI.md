# HimRideG Website — Final Deep Audit (RazorpayX Excluded)

Date: 10-09-2026
Base: `HimRideG WEB(2).zip`

## Scope

RazorpayX payouts ko jaan-boojhkar launch audit se exclude kiya gaya hai kyunki payout access/document approval abhi processing me hai. RazorpayX source/setup future use ke liye preserve hai. Normal customer Razorpay ride payment audit me included hai.

Deep flow checked:

Home → Customer/Driver/Admin login → Google/mobile role login → customer booking → driver online/feed/accept → fare negotiation → response timeout → driver arriving/arrived → OTP verify/regenerate → ride start → live route/location → ride complete → Pay Online/Cash → payment success → driver release → rating.

## Functional fixes in this clean build

1. Root/local `server.js` me bhi 10-minute ride-response timeout scheduler start/stop sync kiya. Production `server/server.js` aur local root start ab timeout behavior me aligned hain.
2. Customer cash payment flow me `Payment Done` action add kiya. Cash select karne ke baad customer aur driver independently confirm kar sakte hain; backend par jo pehle confirm kare wahi PAID karta hai aur driver immediately release hota hai.
3. Driver `Scheduled` tab ko dedicated scheduled-ride filter diya. Pehle tab default request list par fall-through kar raha tha.
4. Non-functional Apple Login button/handler remove kiya. Current supported login Google + entered mobile number hi visible hai.
5. Driver-document public copy current verification flow se align ki: Aadhaar/identity, Driving Licence, Vehicle RC, Commercial Permit, Vehicle Photo. Legacy insurance/fitness model compatibility ko runtime data compatibility ke liye delete nahi kiya, lekin driver-facing required list me ye hidden hi hain.
6. Footer ke dead `#driver`, `#business`, `#ride` anchors remove/fix kiye; ab dead hash targets nahi bache.
7. Unreachable legacy `AuthPage.jsx` + `auth.css` remove kiye. Current `/login/`, `/driverlogin/`, `/adminlogin/` flows preserve hain.
8. Unused `taxianimation.css` remove kiya.
9. Server ke do proven-unreferenced source files remove kiye: `rideValidator.js` aur `fareNegotiationSocket.js`.
10. Proven-unused public images remove ki: old `swift-dzire-white.png`, old `himrideg-logo.png`, duplicate `himrideg-hero.jpg`. Current WebP/current hero assets preserve hain.
11. 61 historical root audit/update report files remove kiye. Operational deployment/login/payment/wallet/RazorpayX setup docs preserve kiye.

## Preserved intentionally

- Customer/driver/admin current UI and role-separated routes.
- Current OSM/Leaflet/map and live driver-location logic.
- Redis/socket/scalability/shared-upload compatibility code.
- Legacy API compatibility routes that can still serve older deployed clients/data.
- Web sound compatibility files; they were not aggressively deleted because event/push compatibility can depend on their naming across clients.
- Normal Razorpay payment and driver wallet ledger.
- RazorpayX source/setup code for later approval; not treated as current launch blocker.
- Original `.env` files and `.env.example` files byte-for-byte unchanged.

## Actual validations run after changes

- Root `server.js`: Node syntax PASS.
- All server `.js`: Node syntax PASS.
- Client JS/JSX TypeScript-transpile syntax: **28/28 PASS**.
- Production Readiness Audit: **11/11 PASS**.
- Ride Flow Contract Audit: **11/11 PASS**.
- Full Customer → Driver → Fare → OTP → Complete → Payment Contract: **67/67 PASS**.
- Shared Upload Storage Audit: **6/6 PASS**.
- Additional no-RazorpayX deep static journey check: **60/60 PASS**.
- Client runtime source graph: **44/44 JS/JSX/CSS reachable**.
- Server production runtime source graph: **81/81 `server/src` JS reachable**.
- Dead hash anchors after cleanup: **0**.
- Original vs clean `.env` SHA-256: identical for client/server `.env` and `.env.example`.

## Important live-launch note

Static/source/contract audit PASS ka matlab external services ka real-world transaction automatically prove nahi hota. Public launch se pehle deployed domains par ek real test account se these smoke tests karne hain: Google account chooser/login, one real customer booking, one real driver accept, live GPS/socket reconnect, fare counter/final accept, OTP, ride start/complete, one small real Razorpay payment, and one cash-payment independent confirmation. RazorpayX payout test approval milne ke baad alag se karna hai.
