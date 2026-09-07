# HimRideG V60 — Payment Popup + Socket Fallback Real Fix

- Customer payment popup: sirf Final Fare, Pay Online, Cash Payment.
- Cash select ke baad: sirf Waiting for driver confirmation.
- Online verified payment: short Payment Successful state; popup auto-close.
- Driver payment popup: sirf Cash select hone par; Final Fare + Cash Received button.
- Online payment ke liye driver confirmation popup nahi.
- Previous V59 UI/code delete nahi kiya; preserved below active V60 branch.
- Socket client polling-first + WebSocket upgrade fallback, taaki WebSocket temporary failure par repeated disconnect loop kam ho.
- Full Code Rule: existing files preserved, changes additive, no modified text file line-count reduction.
