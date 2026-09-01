# HimRideG Phase 5 — Final Production Validation & Launch Hardening

## Full Code Rule

- Phase 4 full project ko base banaya gaya.
- Existing project files delete/rename nahi kiye gaye.
- Customer, driver, admin, map, fare, payment, wallet, login aur Socket.IO business logic ko rewrite nahi kiya gaya.
- Phase 5 me runtime business flow change nahi kiya; final validation/safe load tooling additive form me add hua.
- Existing `.env` / `.env.example` values ko Phase 5 me touch nahi kiya gaya.

## Kya add hua

### 1. Final live readiness validator

`npm run validate:live`

Ye read-only validator:

- `/api/v2/health` check karta hai.
- `/api/v2/readiness` check karta hai.
- MongoDB readiness verify karta hai.
- Redis + Socket.IO Redis adapter verify karta hai.
- Live location cache verify karta hai.
- Distributed driver availability verify karta hai.
- Distributed ride accept lock verify karta hai.
- Redis map cache verify karta hai.
- Durable webhook + background queue/worker verify karta hai.
- Shared upload storage scale-out readiness verify karta hai.
- Razorpay/RazorpayX configuration warnings ko without secrets expose kiye report karta hai.
- Kisi ride/payment/customer/driver mutation endpoint ko call nahi karta.

Live Render example:

```bash
API_BASE_URL=https://api.himrideg.com npm run validate:live
```

Optional website reachability check:

```bash
API_BASE_URL=https://api.himrideg.com \
WEB_BASE_URL=https://www.himrideg.com \
VALIDATE_PUBLIC_WEB=true \
npm run validate:live
```

### 2. Controlled read-only load ramp

`npm run load:final`

Default localhost-only hai. Public/production host par accidentally load generate nahi karta. Production par explicit flag chahiye:

```bash
API_BASE_URL=https://api.himrideg.com \
ALLOW_PRODUCTION_LOAD_TEST=true \
LOAD_STAGES=25,50,100,200 \
npm run load:final
```

Safety:

- Sirf GET `/health` + `/readiness`.
- Booking/payment/fare/OTP/login mutation zero.
- Stage success <99% ho to ramp stop.
- Public host par max 1000 concurrent read-only workers ka built-in cap.
- 5k/10k real traffic simulation dedicated staging/load-test environment par karni chahiye, live customer service par blindly nahi.

## Phase 5 ke baad manual live E2E jo zaroor karna hai

1. Customer booking create.
2. Nearest available driver request receive kare.
3. Same ride par two-driver accept race test — only one must win.
4. Driver initial fare.
5. Customer one-time counter.
6. Driver final fare.
7. Customer final Accept/Reject.
8. Fare locked state both screens par same.
9. Driver arriving/live map.
10. Arrived → OTP → trip start.
11. Complete ride.
12. Online payment test with real smallest safe test/production procedure as appropriate.
13. Cash selection → driver Cash Received → customer success/rating → driver released.
14. Driver next ride eligible.
15. Mobile Chrome + desktop + mobile Desktop Site responsive visual check.

## Important

Automated code package real-world GPS movement, real Razorpay bank settlement, real user devices, browser rendering aur Render network behavior fabricate nahi kar sakta. Isliye live E2E/visual checks deployment ke baad required hain. Phase 5 scripts un checks ko safer aur faster banate hain, but destructive production stress automatically nahi chalate.
