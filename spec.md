# WorkerPro

## Current State

WorkerPro is a mobile-first PWA with:
- User auth: register, login (password + OTP test mode), role-based (user/worker/admin)
- Job Vacancies: create, list, apply, delete (owner only), edit (owner only), notifications on apply
- Rental Properties: create, list, delete (owner only)
- Notifications: user-scoped in-app notifications with bell badge
- Profile page: shows initials avatar, menu nav to sub-pages
- Admin: hidden login, AdminWorkersPage (manage worker status, Twilio/OTP config)
- Bottom nav: Home, Jobs, Rentals, Bookings, Profile
- Blob-storage NOT yet selected

## Requested Changes (Diff)

### Add
- Profile image upload (avatar) on ProfilePage using blob-storage URLs
- Image upload for job posts and rental posts (stored via blob-storage)
- Search bar + category/location filters on JobsPage
- Search bar + location/price filters on RentalsPage
- Full Admin Dashboard page (separate from AdminWorkersPage) with:
  - Stats cards: total users, total job posts, total rental posts
  - All Users table: name, email/phone, role, status (active/blocked), block/unblock button
  - All Posts tabs: Jobs and Rentals with delete button for each
  - Listings Approval section: pending listings with Approve/Reject buttons
- Backend: user blocking (blockUser, unblockUser, isUserBlocked)
- Backend: listing approval status (pending/approved/rejected) on JobVacancy and RentalProperty
- Backend: adminGetAllJobVacancies, adminGetAllRentals (admin-only full lists)
- Backend: approveJobVacancy, rejectJobVacancy, approveRentalProperty, rejectRentalProperty
- Backend: getUserCount, getJobVacancyCount, getRentalCount for stats
- Backend: updateUserProfile(userId, name) for users to update their display name
- Backend: profileImageUrl field on UserAccount (stored as Text URL)
- Backend: imageUrl field on JobVacancyWithOwner and RentalWithOwner

### Modify
- ProfilePage: add image upload UI (upload to blob-storage, save URL to backend)
- JobsPage post form: add image upload field
- RentalsPage post form: add image upload field
- App.tsx: add "admindashboard" page route, link from ProfilePage admin menu
- AdminWorkersPage: keep as-is (worker management), link to new AdminDashboard
- ProfilePage: replace hardcoded "0" stats with real counts from backend
- Blocked users: cannot login (backend login checks blocked status)
- Open job vacancies shown to users only if approvalStatus is approved (or pending for backward compat with existing data)

### Remove
- Nothing removed

## Implementation Plan

1. Select blob-storage Caffeine component
2. Regenerate Motoko backend with:
   - UserAccount gains `blocked: Bool` and `profileImageUrl: Text` fields
   - JobVacancy/RentalProperty gain `approvalStatus: Text` ("pending"/"approved"/"rejected") and `imageUrl: Text`
   - New admin functions: blockUser, unblockUser, approveJobVacancy, rejectJobVacancy, approveRentalProperty, rejectRentalProperty, adminGetAllJobVacancies, adminGetAllRentals
   - Stats queries: getUserCount, getJobVacancyCount, getRentalCount
   - login() checks blocked status before returning session
   - updateUserProfileData(userId, name, profileImageUrl)
3. Frontend updates:
   - New AdminDashboardPage component with stats + user management + post management + approvals
   - ProfilePage: image upload via StorageClient (blob-storage), display uploaded image
   - JobsPage: search/filter bar, image upload in post form
   - RentalsPage: search/filter bar, image upload in post form
   - App.tsx: add admindashboard route
   - ProfilePage admin section: add link to admindashboard
