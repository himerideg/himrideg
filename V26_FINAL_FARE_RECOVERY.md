# HimRideG Website/Backend V26 — Final Fare Recovery

- Prevents `₹0` from being treated as a valid driver final fare.
- Detects legacy/stale `fareStatus=driver_final` with missing/zero `driverFinalFareProposal`.
- Driver dashboard shows **FINAL Fare Sync Recovery** with **Resend Final Fare**.
- Customer dashboard never gets Accept/Reject for a zero final fare; it waits for driver recovery.
- Backend `/fares/:bookingId/driver-final` accepts a resend only for the corrupt legacy state when a valid customer counter already exists.
- A valid existing final fare cannot be overwritten.
- Existing ride, payment, OTP, notification, map, and fare flow is preserved.
