# WorkerPro

## Current State
New project, no existing code.

## Requested Changes (Diff)

### Add
- Task management: create, complete, delete tasks with priority levels (low/medium/high)
- Work schedule planner: add and view shifts/events by day of the week
- Priority to-do list: to-do items with priority tagging and completion tracking
- Notes section: create, edit, delete free-form notes
- Dashboard overview: summary stats (tasks completed, pending, upcoming shifts)

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend: actors for Tasks, Schedule, Notes with CRUD operations
2. Frontend: dashboard layout with sidebar navigation and four sections
   - Dashboard (overview stats)
   - Tasks (list + add form with priority)
   - Schedule (weekly view + add shift form)
   - Notes (grid of note cards + add/edit)
