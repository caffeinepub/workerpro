# WorkerPro V13 – Auth & Worker Status

## Current State
WorkerPro is a multi-service mobile PWA with job board, job vacancies, rental listings, worker management, daily work tracking, notifications, and a bottom navigation (Home, Jobs, Rentals, Bookings, Profile). There is no real user authentication – no login/registration screens exist and no session management. Workers have no active/inactive status field.

## Requested Changes (Diff)

### Add
- User authentication: register and login with email or phone number + password
- Password hashing (SHA-256 via Motoko Text hashing) stored on backend
- Session token stored in localStorage to persist login across reloads
- "Forgot Password" placeholder flow on login screen
- Role system: `admin`, `user`, `worker`
- Worker `status` field: `active | inactive | blocked`
- Worker toggle switch (self-service) to flip own status between active and inactive
- Admin panel: view all workers, set worker status manually, block workers
- Filter: only `active` workers shown in home screen listings and search results
- "Currently Unavailable" badge on inactive workers (admin view)
- Login / Registration screens shown before main app if not authenticated
- After login: admin → admin dashboard, user/worker → main app

### Modify
- WorkerProfile / Workers data model: add `status`, `email`, `phone`, `passwordHash`, `role` fields
- Home screen worker cards: hide inactive workers from listing
- Workers admin page: show status badge and toggle/block controls
- App root: gate full app behind auth check; show login screen if no valid session

### Remove
- Nothing removed

## Implementation Plan
1. Backend: add `UserAccount` type with id, name, email, phone, passwordHash, role, createdAt
2. Backend: add `register`, `login` (returns session token), `getMe` functions
3. Backend: add `workerStatus` field to worker records; add `setWorkerStatus(workerId, status)` and `blockWorker(workerId)` admin functions
4. Backend: add `getActiveWorkers` query filtering by status=active
5. Frontend: Auth context/store in localStorage (token + role)
6. Frontend: LoginScreen and RegisterScreen components with validation
7. Frontend: App.tsx gated – show login if not authenticated, route by role after login
8. Frontend: Worker toggle switch on worker profile/settings page
9. Frontend: Admin workers panel with status badge, toggle, block button
10. Frontend: Home worker cards filter to active only
