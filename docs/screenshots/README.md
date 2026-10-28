# Screenshot capture

The images in this folder are screenshots of the **running application**, captured with a headless
Chromium instance driving the real UI — they are not the original design mock-up.

## What each screenshot shows

| File | Screen | How it was produced |
| --- | --- | --- |
| `01-dashboard.png` | Dashboard (1440 px) | Loaded `/` with the demo data seeded |
| `02-employees.png` | Employees list | After creating "Sanduni Rathnayake" through the Add Employee modal |
| `03-add-employee-form.png` | Add employee form | Modal filled in, before submitting |
| `04-submit-leave-request.png` | Submit leave request | `/leaves/new` with a complete, valid form |
| `04b-leave-request-submitted.png` | Success toast + reset form | Result of submitting the form above (real `POST /api/leaves`) |
| `05-leave-requests.png` | Leave requests table | `/leaves` including the newly submitted request |
| `06-reject-request-modal.png` | Reject modal | Opened from the Reject action on a pending row |
| `07-approved-request.png` | Approved state | After confirming Approve in the dialog (`PATCH /api/leaves/:id/approve`) |
| `08-rejected-request.png` | Rejected state with reason | After confirming Reject with a reason (`PATCH /api/leaves/:id/reject`) |
| `09-manage-leaves.png` | Manage Leaves (admin) | `/admin/leaves`, status tabs and notice visible |
| `10-reports.png` | Reports | `/reports`, aggregates from `/api/reports/summary` |
| `11-mobile-dashboard.png` | Mobile dashboard | 375 × 812 viewport |
| `12-mobile-navigation.png` | Mobile drawer navigation | Hamburger menu opened at 375 px |
| `13-mobile-leave-requests.png` | Mobile leave requests | 375 px — the table becomes cards |
| `14-tablet-leave-requests.png` | Tablet leave requests | 768 px — horizontally scrollable table |
| `15-laptop-leave-requests-1024.png` | Laptop leave requests | 1024 px |
| `16-empty-state-dashboard.png` | Empty dashboard | Fresh database (`DATABASE_FILE=/tmp/empty.db`) — zeroed counters and empty states |
| `17-empty-state-employees.png` | Empty employee directory | Same empty database |
| `18-api-offline-banner.png` | Backend-stopped state | `server/` stopped while the app was open — global banner with the exact start command |
| `19-reject-save-failed.png` | Failed save inside the reject dialog | Backend killed after the reason was typed: the dialog stays open, keeps the text, and reports the failure in its own banner |

## Data

The screens show the optional development seed data (`server/db/seed.js`) plus one employee and
one leave request created through the UI during the capture run. All of it is fictional
demonstration data — see the README section "Database migration and optional seed".

## Reproducing

```powershell
# terminal 1
cd server
npm run db:seed -- --force
npm run dev

# terminal 2
cd client
npm run dev
```

Then open <http://localhost:5173> at the viewport sizes listed above.
