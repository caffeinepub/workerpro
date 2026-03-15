# WorkerPro

## Current State
- Job Board Available Work tab has job cards with basic View Details modal (date, time, payment, address only).
- Not Interested logic saves to backend JobPreferences and hides cards immediately.
- Backend filters NotInterested jobs per workerId via getAvailableJobPostingsForWorker.
- Contact phone/name stored in localStorage extras by employer when posting.
- Job createdAt field exists in backend but not shown anywhere.
- No Work Category field exists.

## Requested Changes (Diff)

### Add
- Work Category field in Post Work form (stored in extras).
- Full Job Details modal: Work Title, Description, Category, Date, Start/End Time, Payment, Address, Google Maps link, Contact Phone, Posted Date.
- View Location button opening Google Maps with job address.
- I'm Interested and Not Interested action buttons inside the modal.

### Modify
- View Details dialog upgraded to full Job Details modal with all fields.
- Post Work form: add Category input, save to extras on submit.
- Contact phone from extras shown in Job Details modal.
- Posted Date formatted from job.createdAt nanoseconds.

### Remove
- Nothing.

## Implementation Plan
1. Add category to extras interface, saveExtra, and getExtras.
2. Add Category input to PostWorkTab, save in extras on submit.
3. Upgrade View Details dialog to show all required fields including category, contact phone, posted date.
4. Add View Location button linking to Google Maps.
5. Ensure Not Interested inside modal triggers instant removal and toast.
