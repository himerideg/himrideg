# HimRideG Scalability Phase 2 — Redis + Multi-Server Socket + GPS Cache + Background Jobs

## Full Code Rule — is build me follow kiya gaya

- Existing customer UI, driver UI, admin UI aur frontend source ko change nahi kiya gaya.
- Existing login, fare negotiation, payment, wallet, map, booking aur ride state logic delete/rename nahi kiya gaya.
- Existing MongoDB live-location code ko delete nahi kiya gaya; Redis unavailable hone par wahi original code fallback ke roop me chalta hai.
- Existing Socket.IO event names/payload contracts ko replace nahi kiya gaya.
- Existing files delete nahi ki gayi.
- Modified existing source files ki line count kam nahi ki gayi.

## Phase 2 me kya add hua

### 1. Optional Redis runtime

New file: `server/src/services/redisRuntime.js`

- `REDIS_ENABLED=false` par current website single-server mode me exactly continue karti hai.
- Redis configured ho to command/cache client, queue client aur Socket.IO pub/sub clients connect hote hain.
- `REDIS_REQUIRED=false` default hai, isliye Redis outage se website boot failure compulsory nahi hota.
- Redis URL/secret readiness API me expose nahi hota.

### 2. Multi-instance Socket.IO Redis adapter

- `@socket.io/redis-adapter` integration add hui.
- Redis ready + `SOCKET_REDIS_ADAPTER_ENABLED=true` hone par different Node instances same Socket.IO rooms/events broadcast kar sakte hain.
- Redis/adapter unavailable hone par current local Socket.IO adapter active rehta hai.
- Existing socket event names unchanged hain.

Important deployment note: multiple server instances + HTTP long-polling use karte waqt hosting/load-balancer ki sticky-session behavior bhi verify karni hoti hai. Redis adapter cross-instance broadcast solve karta hai; load-balancer transport routing separate deployment concern hai.

### 3. Live driver GPS Redis cache

New file: `server/src/services/liveLocationCacheService.js`

Redis active hone par:

- Latest ride driver GPS Redis me cache hoti hai.
- Latest driver GPS separate Redis key me cache hoti hai.
- Ride/driver authorization short TTL se cache hoti hai.
- Har GPS update par MongoDB write karne ki jagah default persistence interval 15 seconds rakha gaya hai.
- Current frontend ka 5-second live tracking contract change nahi kiya gaya.
- Customer/Admin ko Socket.IO live location event har accepted update par mil sakta hai.

Redis unavailable/error hone par original MongoDB write path immediately fallback hota hai.

### 4. Background job queue foundation

New files:

- `server/src/services/backgroundJobService.js`
- `server/src/services/backgroundNotificationService.js`

Redis ready hone par high-volume ride push notifications queue me ja sakti hain. Redis unavailable ho to direct existing push notification method fallback hota hai.

Payment settlement ko background queue par move nahi kiya gaya. Money-critical payment logic ko is phase me jaan-bujhkar untouched rakha gaya.

### 5. Readiness visibility

Existing readiness response me add hua:

- Redis enabled/ready/mode
- Socket Redis adapter status
- Live-location cache active status
- Background job worker status

Redis URL/password response me nahi aata.

### 6. Deployment dependencies

Server dependencies me add:

- `redis`
- `@socket.io/redis-adapter`

`render.yaml` build command `npm install --omit=dev` kiya gaya hai taaki added dependencies deploy ke time package-lock ke saath reconcile ho saken. Is isolated build environment me npm registry installation complete nahi ho saki, isliye generated ZIP ke existing lock files ko guess/manual-edit nahi kiya gaya.

## Safe default production behavior

`render.yaml` me default:

```env
REDIS_ENABLED=false
REDIS_REQUIRED=false
```

Iska matlab ZIP deploy karne se existing live site ko Redis dependency force nahi hoti.

## Redis provision karne ke baad enable karna

Render/hosting environment me valid Redis URL add karo, phir:

```env
REDIS_ENABLED=true
REDIS_REQUIRED=false
SOCKET_REDIS_ADAPTER_ENABLED=true
LIVE_LOCATION_CACHE_ENABLED=true
BACKGROUND_JOBS_ENABLED=true
```

Pehle `REDIS_REQUIRED=false` rakhna safe hai. Stable verify hone ke baad strict production requirement chahiye to `REDIS_REQUIRED=true` kiya ja sakta hai.

## Recommended defaults

```env
REDIS_KEY_PREFIX=himrideg:v2
REDIS_CONNECT_TIMEOUT_MS=10000
LIVE_LOCATION_CACHE_TTL_SECONDS=90
LIVE_LOCATION_ACCESS_TTL_SECONDS=8
LIVE_LOCATION_MONGO_PERSIST_MS=15000
BACKGROUND_JOB_QUEUE=jobs:default
BACKGROUND_JOB_MAX_ATTEMPTS=3
BACKGROUND_JOB_RETRY_DELAY_MS=1500
BACKGROUND_JOB_BLOCKING_POP_SECONDS=1
```

## Verification before live enabling

1. Deploy with `REDIS_ENABLED=false` and verify current booking/login/payment/driver flow.
2. Add Redis URL.
3. Set `REDIS_ENABLED=true`.
4. Open readiness endpoint and verify `redis.ready=true` and `socketAdapterReady=true`.
5. Test customer + driver in separate devices.
6. Test live GPS updates for at least 10 minutes.
7. Test ride request notification, accept, fare, OTP, completion and payment.
8. Only after stable verification scale backend instance count above 1.

## Is phase me intentionally untouched

- Customer/driver/admin frontend
- Fare negotiation business rules
- Ride status names
- Payment settlement and Razorpay/RazorpayX logic
- Wallet commission logic
- Map UI
- Login flow
- Existing MongoDB schema fields
- Existing notification sound mapping

## Next Phase 3

Phase 3 me safe order:

1. geospatial nearest-driver dispatch query audit + indexes,
2. distributed driver presence/availability cache,
3. idempotent ride-accept lock across multiple servers,
4. request/dispatch queue fan-out strategy,
5. load-test scripts for 1k / 5k / 10k simulated users,
6. metrics/error monitoring and capacity thresholds.
