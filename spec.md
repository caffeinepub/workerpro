# WorkerPro

## Current State
- Worker profiles stored in localStorage with name, phone, address, skill (Workers.tsx)
- Job extras stored in localStorage: contactNumber, workerPhone, workerAddress, completionStatus
- Assignment flow saves workerPhone and workerAddress when a registered worker is selected
- Available Work cards currently display contactNumber (should be hidden per security requirement)
- Assigned Work cards show worker name, phone, date, time, payment, address (no Call Worker button, no employer contact section, no worker skill)

## Requested Changes (Diff)

### Add
- `workerSkill` and `workerId` fields to `JobExtra` interface and saved on assignment
- "Call Worker" button on Assigned Work cards (tel: link using workerPhone)
- "Call Employer" button on Assigned Work cards (tel: link using contactNumber saved at post time)
- Employer contact section on Assigned Work cards (contact name, phone, work address) -- worker view
- Worker skill displayed in Assigned Work cards -- contractor view
- Work location (job.address) clearly labeled on Assigned Work cards

### Modify
- Remove contactNumber display from Available Work job cards (security: no phone in public listings)
- Remove contactNumber from View Details dialog in Available Work
- Assigned Work cards: expand to show all required fields (title, worker name, phone, address, skill, date, time, payment, location)
- Assignment confirm flow: save workerId and workerSkill in extras alongside existing fields

### Remove
- Phone number visibility in public Available Work section

## Implementation Plan
1. Update `JobExtra` interface to add `workerSkill: string` and `workerId: string`
2. Update `saveExtra` default values and `handleConfirm` to persist workerId + workerSkill
3. Remove contactNumber display from AvailableWorkTab cards and View Details dialog
4. Update AssignedWorkTab card layout:
   - Show all fields: title, badge, worker name, phone, address, skill, date, time, payment, work location
   - Add "Call Worker" button (tel:{workerPhone}) when phone is available
   - Add employer section showing contactNumber with "Call Employer" button (tel:{contactNumber})
5. Apply data-ocid markers to new buttons
