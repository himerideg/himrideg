# HimRideG Scalability Phase 3 — Driver Matching + Atomic Ride Accept

## Full Code Rule

- Base: `HimRideG_GASS_PHASE2_RENDER_DEPLOY_FULL_CODE_FIXED.zip`.
- Existing customer, driver, admin, payment, wallet, map, login, fare negotiation aur notification UI/flow remove/rename nahi kiya gaya.
- Existing files deleted: 0.
- Existing modified source/config files me line count kam nahi kiya gaya.
- `client/` frontend ko Phase 3 me touch nahi kiya gaya.
- Existing MongoDB atomic ride acceptance final source-of-truth preserve hai.
- Redis unavailable/stale hone par MongoDB fallback preserve hai.

## Phase 3 me kya add hua

1. Distributed driver availability Redis GEO registry.
   - Online + available + approved + no-current-ride drivers shared Redis registry me publish ho sakte hain.
   - Driver online/offline/available/busy/location updates registry ko best-effort sync karte hain.
   - Driver ride-feed/accept activity availability TTL refresh karti hai.
   - Startup par already-online available drivers ka best-effort warmup hota hai.

2. Nearest-driver Redis prefilter.
   - Redis `GEOSEARCH` nearest candidate IDs deta hai.
   - MongoDB `$geoNear` final eligibility/distance verify karta hai.
   - Redis empty/unavailable/error par original MongoDB-only nearest-driver search unchanged fallback hota hai.
   - Expired Redis availability metadata candidates stale registry se best-effort cleanup hote hain.

3. Distributed ride accept lock.
   - Redis `SET NX PX` same ride par multi-instance accept stampede guard karta hai.
   - Existing MongoDB atomic `findOneAndUpdate` final authority hi rehta hai.
   - Redis unavailable hone par MongoDB atomic fallback direct continue karta hai.
   - Lock token-based Lua release use karta hai; wrong instance/token doosre lock ko delete nahi karta.

4. Readiness visibility.
   - `distributedDriverAvailability` runtime status add hua.
   - `distributedRideAcceptLock` runtime status add hua.
   - Redis URLs, driver IDs aur location secrets readiness me expose nahi hote.

5. Safe read-only load probe.
   - `npm run load:probe`
   - Default sirf `/api/v2/readiness` GET endpoint hit karta hai.
   - Booking/payment/driver state mutate nahi karta.
   - Total requests max 10,000 aur concurrency max 500 code-level cap hai.
   - High live-production stress automatically run nahi kiya gaya.

## Actual server/.env me add-only keys

```env
DISTRIBUTED_DRIVER_AVAILABILITY_ENABLED=true
DRIVER_MATCH_REDIS_PREFILTER_ENABLED=true
DRIVER_AVAILABILITY_TTL_SECONDS=120
DRIVER_LOCATION_STALE_SECONDS=180
DRIVER_AVAILABILITY_WARMUP_LIMIT=5000
RIDE_ACCEPT_DISTRIBUTED_LOCK_ENABLED=true
RIDE_ACCEPT_LOCK_TTL_MS=8000
```

Existing `.env` lines/values overwrite nahi ki gayi.

## Important safety design

Redis speed layer hai, authority nahi. Driver eligibility aur ride acceptance ka final truth MongoDB me hi verify hota hai. Isliye free Redis restart, no-persistence, stale cache, Redis outage ya multi-instance reconnect ke case me existing ride system Redis data par blindly depend nahi karta.

## Load-test note

Production live service par 5k/10k stress bina controlled window ke run nahi kiya gaya. ZIP me safe read-only probe diya gaya hai; staged ramp-up recommended hai: 200 -> 1,000 -> 5,000 -> 10,000 requests, metrics dekhte hue.
