# HimRideG V58 — Compact Payment Popup + Launch Blocker Fix

Date: 2026-09-07

## Popup simplification
- Customer payment popup now shows only Final Fare + Pay Online + Cash Payment.
- Cash selected state shows only cash amount/waiting message.
- Driver payment popup no longer opens immediately after fare lock.
- Driver popup opens for completed/unpaid ride and stays minimal.
- Driver cash state shows only amount + Cash Received action.
- Legacy advance/request banners are hidden from launch UI.
- Paid event closes the waiting payment modal; driver gets the existing compact payment-received receipt.

## Payment contract fixes
- Customer payment status URL corrected to `/payments/:bookingId/status`.
- Legacy `/payments/status/:bookingId` compatibility route added.
- Completed + unpaid booking is now the authoritative post-ride payment state.
- Online Razorpay verification is final; driver confirmation is not required for online payment.
- Legacy `/payments/receive-confirm` is retained as an idempotent compatibility route.
- Legacy advance request/pay-later routes return a clear disabled response instead of 404.
- Default `paymentMethod: cash` no longer falsely means customer selected cash; actual cash choice uses `cashSelectedAt/paymentChoiceAfterRide`.

## Security fixes
- Alternate `/api/v2/driver/auth/send-otp` and `/verify-otp` routes now have OTP/login rate limits.
- Production SMS-disabled path no longer logs or returns plaintext OTP.
- `server/createAdmin.js` no longer contains hard-coded admin password; it uses environment variables.
- Public homepage stats no longer invent `500+ / 100+` when stats API fails.
- Public stats API no longer returns raw exact customer/driver counts.

## Validation
- Server JS syntax: PASS
- Modified JSX parse: PASS
- Production readiness audit: 11/11 PASS
- Ride-flow audit: 10/10 PASS
- Shared upload audit: 6/6 PASS
- Full customer → driver → fare → OTP → complete → payment contract: 66/66 PASS

## Live test still required before mass launch
Use one real controlled ride through Customer → Driver → Fare → OTP → Complete → Online payment and one Cash payment to verify external Razorpay, sockets, database, and deployment environment together.
