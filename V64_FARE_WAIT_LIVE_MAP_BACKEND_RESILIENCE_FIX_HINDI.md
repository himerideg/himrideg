# HimRideG V64 — Fare Waiting + Live Map + Backend Resilience Fix

- Driver final fare input visibility fixed; mobile/desktop clean stack.
- Send Fare / Send Final Fare tap ke turant baad optimistic waiting state.
- API failure par typed fare rollback + Retry state.
- Requested Vehicle driver request list aur detail me visible.
- Driver GPS fare negotiation se ride start tak trackable.
- Socket-first GPS; REST only fallback.
- Authorised ride-room GPS realtime fast broadcast; DB persistence background.
- Customer driver marker blue; Pickup/Drop yellow; route yellow.
- Customer map all three markers fit; no fake pickup-drop ETA when driver GPS missing.
- Duplicate concurrent loadBookings calls deduped to reduce timeout storms.
- Existing payment/cash/no-response/full-code logic preserved.
