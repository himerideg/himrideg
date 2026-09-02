# HimRideG Phase 9 — Approved Driver Document Gate Fix

## Problem
Live dashboard me driver ko `Approved Driver` dikh raha tha, lekin usi account ke
upar `Verification Baaki Hai / Upload Documents` overlay aa raha tha.

## Root cause
Approval ke alag code paths alag signals use kar rahe the:
- onboarding status sirf `driverProfile.isApproved` dekh raha tha,
- kuch live/legacy records me `approvalStatus=approved` ya approval audit fields
  authoritative the,
- dashboard document gate approval ko override nahi karta tha.

Isliye approved account ke documents list stale/empty hone par gate dobara khul
sakta tha.

## Safe add-only fix
- Backend onboarding me canonical admin approval detection add.
- `approvalStatus=approved` ko approved maana.
- Existing `isApproved=true` behavior preserve.
- Legacy approval evidence (`approvedAt + approvedBy`) supported.
- App approval check canonical banaya.
- DriverOnboarding popup approved signal milte hi close hota hai.
- DriverDashboard document gate approved driver ko kabhi block nahi karega.
- Unapproved / rejected / pending drivers ke document rules unchanged hain.
- Existing documents, uploads, admin verification, ride, fare, wallet, payment,
  map aur login logic remove nahi hua.

## Full Code Rule
Existing files delete/rename nahi kiye gaye. Sirf required approval-gate logic
add/harden ki gayi. Modified existing files ki line count kam nahi hui.
