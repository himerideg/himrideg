# HimRideG V61 — Fare Popup / Counter / Mobile Fix

- Fare accept/lock hote hi customer map fare popup immediately hide hota hai.
- Active ride card par locked fare/status visible rehta hai; duplicate map popup nahi.
- Customer one-time counter bhejne par driver ko 2 clear options milte hain:
  1. Accept ₹counter — fare turant lock.
  2. Send Final Fare — customer ko final Accept/Reject.
- Driver counter accept REST route se persisted state + realtime socket update karta hai.
- Mobile browser ke liye fare controls responsive stack, readable text aur no-overflow rules add kiye gaye.
- Existing files/features preserve kiye gaye; changes additive/full-code safe rakhe gaye.
