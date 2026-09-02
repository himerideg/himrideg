# HimRideG Phase 13 — Cash Payment Realtime + Payment Receipt Fix

## Exact root cause found
Customer PaymentModal Cash choose karte waqt:
`POST /api/v2/payments/select-method`

call kar raha tha.

`launchPaymentController.selectPaymentMethod()` Cash ko MongoDB me save karta tha,
lekin sirf:
`payment:method-updated`

emit karta tha.

Driver/App ka explicit cash alert:
`payment:cash-selected`

event sun raha tha. Dedicated `/payments/cash-select` controller ye event emit
karta tha, lekin current customer modal us route ko call hi nahi kar raha tha.

Is route/event mismatch ki wajah se:
- Cash choice backend me save ho sakti thi
- Driver ko explicit "Cash Payment Selected" command/sound reliably nahi milti thi

## Fix
- Existing `/payments/select-method` route preserve.
- Existing `payment:method-updated` preserve.
- Cash selection par additional `payment:cash-selected` event emit.
- Payment broadcast now booking + real ride + user + customer + driver rooms.
- Driver push notification fallback add.
- Driver paid event par closable Payment Received / Cash Received receipt.
- Customer paid receipt 3-second forced close nahi; existing Done/Close button
  se manually close hoti hai.
- Existing `/cash-select` and `/cash-confirm` routes preserve.
- Payment settlement / commission / wallet logic unchanged.

## Full Code Rule
Existing files delete/rename nahi kiye. Ride, fare, OTP, map, login, admin,
wallet settlement aur Razorpay logic remove nahi kiya.
