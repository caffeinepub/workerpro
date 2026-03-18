# WorkerPro V12 - Multi-Service Platform Upgrade

## Current State
WorkerPro is a mobile PWA with:
- Service worker booking (Electrician, Plumber, Cleaner, Carpenter)
- Job posting/assignment system (backend jobs with status: available/assigned/completed/deleted)
- Worker registration and job preferences ("Not Interested")
- Job Details modal with Maps link
- Notifications system
- Bottom nav: Home, Bookings, Add Work, Messages, Profile
- Existing backend: JobPostings, Workers, JobPreferences, Notifications, WorkEntries

## Requested Changes (Diff)

### Add
- **Job Vacancies module**: Employer-posted employment opportunities (distinct from existing worker job assignments). Fields: title, companyName, category, salary (optional), location, description, postedAt, status (open/closed).
- **Job Applications**: Users can apply to job vacancies. Fields: vacancyId, applicantName, applicantPhone, appliedAt.
- **Rental Houses module**: Property listings. Fields: title, description, location, pricePerMonth, numberOfRooms, contactPhone, ownerName, imageUrl, amenities, status (available/rented), createdAt.
- **Service categories on home screen**: Painter, Cleaner, Plumber, Carpenter, Electrician displayed in a grid with icons.
- **Updated bottom navigation**: Home, Jobs, Rentals, Bookings, Profile (replaces Add Work and Messages tabs).
- **Jobs page**: Browse job vacancies, filter by category/location, post new vacancies (admin), apply to jobs.
- **Rentals page**: Browse rental listings, filter, view details, contact owner.

### Modify
- Home screen: Add expanded service categories grid (Painter, Cleaner, Plumber, Carpenter, Electrician) with icons.
- Bottom navigation: Change from [Home, Bookings, Add Work, Messages, Profile] to [Home, Jobs, Rentals, Bookings, Profile].
- App routing: Add `jobs` and `rentals` pages; retain existing deep pages.

### Remove
- Bottom nav "Add Work" tab (moved to Bookings or accessible via Jobs/Home)
- Bottom nav "Messages" tab (accessible from Profile or retained as deep page)

## Implementation Plan
1. Add `JobVacancy`, `JobApplication`, `RentalProperty` types and CRUD to Motoko backend.
2. Frontend: Update bottom nav to [Home, Jobs, Rentals, Bookings, Profile].
3. Frontend: Expand home screen service categories grid with 5 categories + icons.
4. Frontend: Build `JobsPage` - vacancy listing cards (title, company, salary, location, Apply Now button), post form, filter.
5. Frontend: Build `RentalsPage` - rental cards (image placeholder, price, location, rooms, View Details / Contact Owner), add form, filter.
6. Frontend: Wire new backend APIs for vacancies, applications, and rentals.
