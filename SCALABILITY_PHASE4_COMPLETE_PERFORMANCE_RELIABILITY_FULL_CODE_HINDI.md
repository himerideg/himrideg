# HimRideG Phase 4 — Performance, Reliability & Scale-Out Hardening

## Full Code Rule

- Existing customer, driver, admin, booking, map, fare, payment, wallet, notification aur login flows delete/rename nahi kiye gaye.
- Existing files delete: **0**.
- Jitni existing text/code files modify hui, kisi ki line count baseline se kam nahi hui.
- Existing `.env` values preserve ki gayi; Phase 4 ke naye controls sirf append kiye gaye.
- `client/.env`, `client/.env.example`, `client/.env.production.example`, `server/.env.example` aur `server/.env.production.example` unchanged hain.
- Real Redis/payment secrets ZIP me invent/hard-code nahi kiye gaye; Render Environment source-of-truth rahega.

## Phase 4 me kya improve hua

### 1. Frontend initial-load performance
- Heavy auth/customer/driver/admin pages `React.lazy()` se route-level chunks me split kiye.
- Public Home eager rakha gaya.
- `HomeBookRide`/Leaflet booking code ko Home par lazy-load kiya; booking open hone par load hota hai.
- Vite vendor chunks React, map aur network libraries ke liye separate kiye.

### 2. Socket-first realtime, polling fallback
- Existing Socket.IO events ko primary rakha.
- Customer/driver/admin periodic refresh ko longer safety-fallback interval banaya.
- Hidden browser tab par periodic API refresh skip hota hai.
- Driver payment waiting poll 4 sec se 15 sec safety fallback hua; socket cash-selected event primary hi hai.

### 3. Distributed Geoapify map cache
- Existing process-local `Map()` cache L1 ke roop me untouched hai.
- Redis L2 cache add hua, taaki multiple Node instances autocomplete/reverse/route response share kar saken.
- Redis failure par existing Geoapify/local cache behavior fallback karta hai.

### 4. Durable Razorpay webhook processing
- Verified Razorpay payment/payout webhook payload HTTP 200 ACK se pehle MongoDB audit record me persist hota hai.
- Redis background queue ready ho to durable event queue me process hota hai.
- Redis unavailable ho to request synchronous safe processing karta hai; failure par 500 deta hai taaki gateway retry kare.
- Unique event identity + Mongo idempotency + processing lease duplicate/concurrent event processing ko protect karte hain.
- Server restart par unfinished Mongo webhook audits recover/requeue hote hain. Free Redis persistence par critical payment correctness depend nahi karti.

### 5. Multi-instance upload storage
- Existing Render persistent disk primary hai aur delete nahi kiya gaya.
- `UPLOAD_STORAGE_MODE=hybrid-gridfs` par driver profile/document files MongoDB GridFS me mirror hote hain.
- Kisi backend instance par local file missing ho to same existing URL/authorized document route GridFS fallback se serve kar sakta hai.
- Production `server/server.js` startup par existing local uploads ka best-effort GridFS migration chalta hai.
- Driver documents private route ke through hi serve hote hain; public profile fallback `driver-profile` kind tak scoped hai.

### 6. Phase 3 production flags complete
- Distributed driver availability, Redis GEO prefilter aur distributed ride-accept lock Render blueprint me explicitly enabled hain.
- Existing MongoDB verification/atomic accept logic fallback/second protection ke roop me unchanged hai.

### 7. Customer map-first fare UI
- Existing negotiation backend/handlers same hain.
- Customer fare negotiation now live map ke upar bottom-sheet me render hoti hai.
- Flow remains: Driver initial fare → customer one-time counter → driver FINAL fare → customer Accept/Reject → fare locked.
- Legacy location source me preserved hai, but duplicate component mount avoid kiya gaya.

### 8. Production diagnostics / readiness
- Readiness endpoint me Redis, live-location cache, distributed availability, ride accept lock, map cache, durable webhooks, background jobs aur shared upload storage status visible hai.
- Secrets/Redis URL readiness response me expose nahi hote.

### 9. Safe audit/load tools
- `npm run audit:production`: static production hardening audit.
- `npm run audit:ride-flow`: core ride/fare/payment route contract audit.
- `npm run load:scenario`: configurable GET-only HTTP load probe by default; real payment/ride mutation stress automatically nahi karta.

## Environment additions

Existing values ko replace nahi kiya. Phase 4 controls:

- `MAP_CACHE_REDIS_ENABLED=true`
- `MAP_CACHE_NAMESPACE=map`
- `WEBHOOK_DURABLE_ACK_ENABLED=true`
- `WEBHOOK_BACKGROUND_QUEUE_ENABLED=true`
- `WEBHOOK_RETRY_MAX_ATTEMPTS=5`
- `UPLOAD_STORAGE_MODE=hybrid-gridfs`

Render blueprint me safety ke liye `ADMIN_RESET_ON_START=false` bhi set hai.

## External/live items jo ZIP khud fabricate nahi kar sakti

- Real `REDIS_URL` Render Environment me hi rehna chahiye.
- Razorpay/RazorpayX/Google/Geoapify secrets real environment me hi rahenge.
- Agar readiness me `razorpayXAccountConfigured=false` aaye to real `RAZORPAYX_ACCOUNT_NUMBER` Render me configure karna hoga; fake account number code me nahi dala gaya.
- Real 1k/5k/10k user load production service par bina controlled window ke blindly run nahi kiya gaya.
- Full Vite build current isolated environment me execute nahi hua because local dependency installation incomplete thi (`vite` binary unavailable); JSX/JS syntax static parser se verify hua.

## Deploy ke baad minimum live checks

1. `/api/v2/readiness` me Redis ready + socket adapter ready.
2. Distributed driver availability active.
3. Distributed ride accept lock active.
4. Map cache active when Redis ready.
5. Durable webhooks enabled + background queue enabled.
6. Upload storage `sharedReady=true` after MongoDB connection/startup.
7. Customer booking → driver accept → fare/counter/final → OTP → complete → cash/online payment end-to-end manual smoke test.
8. Browser mobile + desktop visual smoke test after frontend production build/deploy.
