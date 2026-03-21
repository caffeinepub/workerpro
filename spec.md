# WorkerPro

## Current State
WorkerPro has a functional authentication system:
- OTP-based signup (phone → Twilio SMS → verify → account details)
- Password-based login only
- Role-based access (user / worker / admin)
- 7-day session stored in localStorage
- Admin hidden behind 5-tap logo gesture
- Twilio SMS configured via Admin panel

## Requested Changes (Diff)

### Add
- `loginWithOtp` backend function: sends OTP to phone, verifies, returns user session
- OTP login option in LoginScreen (toggle between Password login and OTP login)
- 2-step OTP login flow: enter phone → receive OTP via SMS → enter OTP → logged in
- Clear error messages: `OTP failed`, `Invalid OTP`, `User not found`, `User already exists`, `Too many requests`

### Modify
- `LoginScreen`: add OTP login tab alongside existing password login
- `backend.d.ts` + `backend.did.js`: add `loginWithOtp` declaration
- `RegisterScreen`: ensure "User already exists" error is surfaced clearly (already handled, minor copy fix)

### Remove
- Nothing removed; existing password login stays as an option

## Implementation Plan
1. Add `loginWithOtp(phone, otp)` to Motoko backend — uses `verifyOtp` logic then looks up user by phone; returns `#ok({userId, role})` or `#err(message)`
2. Add `loginWithOtp` to `backend.d.ts` and `backend.did.js` Candid IDL
3. Update `LoginScreen` with a Password/OTP tab switcher:
   - Password tab: existing form (unchanged)
   - OTP tab: Step 1 (enter phone, send OTP) + Step 2 (enter OTP, verify and login)
4. Wire error messages precisely for all auth failure cases
