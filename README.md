# Shibui Clinic Hub

Build a complete, production-ready INTERNAL Dental Clinic Management Web Application for:

APP NAME:
Shibui Dental Care

CLINIC / PRESCRIPTION BRAND:
Shibui Dental Hub

This is an internal system for the dentist and front-desk/reception staff. The application must be extremely simple, fast, professional and require virtually zero training for a non-technical receptionist.

IMPORTANT:
Do NOT build this as a generic SaaS dashboard.
It should feel like a real dental clinic's private operating system.

Use:
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase for database + authentication
- Vercel for deployment

Make the application fully responsive and iPad-compatible in addition to desktop and mobile.

==================================================
1. CLINIC INFORMATION
==================================================

Keep ALL clinic information in ONE constants/config file such as:

src/config/clinic.ts

Do NOT create a settings table.
Do NOT create a settings page.

Use this configuration everywhere in the application, including prescription letterhead, footer, dropdowns, reminders, patient communication, etc.

clinicName: "Shibui Dental Hub"
appName: "Shibui Dental Care"
tagline: "Root Canal Specialist"

doctorName:
"Dr. Nidhi Nupur Mukul Kumar"

qualifications:
"BDS, MDS (Endodontics)"

regNo:
"A-30080"

phone:
"8788564733"

whatsapp:
"8390974572"

email:
"nupurnidhi90@gmail.com"

address:
"Shop No.4, Tirupati Corner, Plot No. C/1, Sector-12, Kharghar, Navi Mumbai - 410210 (Near HP Gas Agency)"

timings:
"Mon to Sat: 09:00 AM - 01:00 PM | 04:00 PM - 09:00 PM. Sunday: by appointment only"

facilities:
[
"Digital X-Ray",
"Child Dental Treatment",
"Braces",
"Clear Aligners",
"Teeth Cleaning",
"Dentures",
"Crown & Bridge",
"Root Canal Treatment",
"Gum Problems Treatment",
"Implants",
"Oral Surgery (Major / Minor)",
"Smile Design",
"Teeth Whitening"
]

reasonTypes:
[
"Consultation",
"Root Canal",
"Cleaning",
"Braces / Aligners",
"Crown & Bridge",
"Tooth Extraction",
"Filling",
"Follow-up",
"Other"
]

frequencyOptions:
[
"OD (once a day)",
"BD (twice a day)",
"TDS (thrice a day)",
"HS (at bedtime)",
"SOS (as needed)",
"Stat (immediately)"
]

Everything should read from this config.

==================================================
2. DESIGN / VISUAL LANGUAGE
==================================================

Create a premium, clean medical UI.

Background:
#FCFBF9

Primary accent:
#B06A6A

Dark rose:
#9A5454

Gold:
#C2A05A

Body:
#3A3A3A

Design characteristics:
- off-white medical background
- generous whitespace
- rounded cards
- subtle shadows
- thin gold separators
- elegant typography
- calm dental/medical aesthetic
- no excessive gradients
- no childish healthcare illustrations
- no generic startup dashboard appearance

Logo:
Use a temporary small heart-shaped tooth icon.

Logo text:
"Shibui" in elegant script
"Dental Hub" bold below
"Root Canal Specialist" small caps

The logo should be implemented as a reusable component so the real clinic logo can be replaced later without redesigning the application.

==================================================
3. AUTHENTICATION
==================================================

Use Supabase Auth.

Staff login using:
- email
- password

Create/support ONE staff account:

Email:
reception@shibuidental.in

Password:
Shibui@2026

Email confirmation should be disabled for this internal staff account so login works immediately.

IMPORTANT SECURITY:
Do not expose Supabase service-role keys in frontend code.
Use environment variables for sensitive credentials.
Use RLS for all application data.

Login screen:
- full-screen professional female dentist/clinic image
- suitable Unsplash image
- subtle dark rose overlay
- centered glass-style login card
- clinic logo
- Shibui Dental Hub
- Root Canal Specialist
- email/password
- Login button
- gold divider
- trust information:

Dr. Nidhi Nupur Mukul Kumar
BDS, MDS (Endodontics)

Mon to Sat:
09:00 AM - 01:00 PM
04:00 PM - 09:00 PM

Sunday: By appointment only

==================================================
4. APP SHELL
==================================================

Desktop:
Left sidebar.

Mobile/iPad:
Responsive sidebar that can collapse into a bottom navigation or compact navigation.

Main navigation:

1. Dashboard
2. Appointments
3. New Prescription
4. Patients
5. Calendar
6. Reminders / WhatsApp

Sidebar header:
Logo + Shibui Dental Hub

Keep navigation extremely simple.

==================================================
5. DATABASE — SUPABASE
==================================================

Use Supabase PostgreSQL.

Enable RLS on every application table.

Create clearly named policies allowing authenticated staff to read/write clinic data.

TABLE 1: patients

id uuid primary key default gen_random_uuid()

patient_uid text unique not null

name text not null

age int

sex text

phone text

notes text

created_at timestamptz default now()

IMPORTANT:
Every patient must receive a unique human-friendly Patient ID.

Example:

SHB-000001
SHB-000002
SHB-000003

This Patient ID must NEVER change.

The Patient ID becomes the primary identifier staff can use to retrieve the complete patient history.

Search patients by:
- Patient ID
- Name
- Phone

==================================================
TABLE 2: appointments
==================================================

id uuid primary key default gen_random_uuid()

patient_id uuid references patients(id) nullable

patient_name text not null

phone text not null

reason text

appointment_date date not null

slot_time text not null

status text not null default 'booked'

Allowed:
booked
done
cancelled
no_show

notes text

created_at timestamptz default now()

==================================================
TABLE 3: prescriptions
==================================================

id uuid primary key default gen_random_uuid()

patient_id uuid references patients(id)

appointment_id uuid references appointments(id) nullable

rx_date date not null default current_date

vitals jsonb

chief_complaint text

diagnosis text

medicines jsonb

facilities_advised text[]

advice text

tests text

follow_up_date date

created_at timestamptz default now()

Medicines structure:

[
  {
    "name": "",
    "dosage": "",
    "frequency": "",
    "duration": "",
    "notes": ""
  }
]

==================================================
6. PATIENT ID / COMPLETE HISTORY
==================================================

This is a CORE feature.

Every patient gets one permanent unique Patient ID.

Example:

SHB-000124

When receptionist searches:

SHB-000124

the application must immediately display:

Patient profile
+
all previous appointments
+
all previous prescriptions
+
follow-ups
+
diagnosis
+
medicines
+
vitals
+
advice
+
tests

Never create duplicate patient profiles if the phone number already exists.

If a phone number matches an existing patient during appointment booking or prescription creation, link to the existing patient.

Patient ID must be visible prominently on the patient profile and prescription screen.

Allow:
"Copy Patient ID"

==================================================
7. DASHBOARD
==================================================

Dashboard should be the landing page after login.

Show four compact statistics:

Today's Appointments
Upcoming Appointments
Total Patients
Prescriptions This Week

Show two large quick actions:

+ Book Appointment
+ New Prescription

Below:

Today's Remaining Appointments

Each appointment card should show:
- patient name
- Patient ID
- phone
- reason
- time
- status

Use one-tap actions.

==================================================
8. APPOINTMENT BOOKING
==================================================

Create a reusable hook:

useBooking

ALL appointment slot logic should live here.

Booking form:

Patient Name
Phone
Reason
Date
Time Slot
Optional Notes

Reason dropdown must come from clinic config.

MONDAY-SATURDAY:

09:00 AM - 01:00 PM
04:00 PM - 09:00 PM

Generate 30-minute slots.

Example:

09:00
09:30
10:00
10:30
...
12:30

and

04:00
04:30
05:00
...
08:30

Do NOT allow booking outside clinic hours.

Disable already-booked slots.

If Sunday:
allow appointment booking but clearly display:

"Sunday — By Appointment Only"

When saving:
1. Check whether phone belongs to an existing patient.
2. If yes → attach patient_id.
3. If no → automatically create patient and generate unique Patient ID.
4. Create appointment.

Do not create duplicate patients.

==================================================
9. DAY VIEW
==================================================

Appointments page must contain a doctor's daily agenda.

Date selector:
Previous Day
Today
Next Day

Show all appointments for selected day.

Sort by time.

Each appointment card:

Patient Name
Patient ID
Phone
Reason
Time
Status

Status:

Booked → rose
Done → green
Cancelled → grey
No-show → grey

One-tap status actions:

Done
Cancelled
No-show

Do not make receptionist navigate through multiple pages to update status.

Each appointment should have:

"Create Prescription"

Clicking it should open New Prescription and automatically populate:

Patient
Patient ID
Phone
Appointment ID
Date

==================================================
10. CALENDAR — IMPORTANT
==================================================

Create a proper working clinic calendar.

The calendar must ACTUALLY SHOW APPOINTMENT EVENTS.

Previous implementation issue:
"Calendar me show nahi hora"

Fix this properly.

Calendar must fetch appointments from Supabase and render them as actual calendar events.

Requirements:
- Month view
- Week view if practical
- Day view
- Click event → appointment details
- Event date must correspond exactly to appointment_date
- Event time must correspond to slot_time
- Status should be visually distinguishable
- Clicking an event should allow:
  - view patient
  - mark Done
  - Cancel
  - No-show
  - Create Prescription

Use a reliable calendar implementation such as FullCalendar or an equivalent React calendar library if needed.

Do not build a fake static calendar.

All calendar events must come from Supabase appointments.

==================================================
11. DIGITAL PRESCRIPTION — HERO FEATURE
==================================================

This is the most important feature.

The clinic already has an EXISTING PHYSICAL PRESCRIPTION TEMPLATE / LETTERHEAD.

I have provided reference photographs of the actual prescription pad.

USE THE ATTACHED REFERENCE IMAGES AS THE DESIGN REFERENCE.

DO NOT invent a completely different prescription design.

The digital prescription must closely reproduce the existing clinic prescription pad layout.

IMPORTANT:
The existing physical template will be printed on.

Therefore, the system must support:

A) Printing directly onto the EXISTING physical prescription template

B) Optional complete digital prescription preview if required

The print layout must align with the existing paper template.

Keep the prescription print component completely separate from the application UI:

PrescriptionPrintTemplate.tsx

This component should be easy to fine-tune later.

==================================================
12. PRESCRIPTION ORDER / LAYOUT
==================================================

The prescription information must follow a logical medical order.

Order:

1. Patient information
2. Vitals
3. Chief Complaint
4. Diagnosis
5. Rx / Medicines
6. Facilities / Treatment information
7. Advice
8. Tests
9. Follow-up

The visual order should also respect the actual clinic template shown in the attached reference images.

==================================================
13. PRESCRIPTION FORM
==================================================

Fields:

Patient Search / Patient ID

Patient Name
Age
Sex:
- M
- F
- Other

Phone

Date

Optional vitals:

BP
Weight
Temperature
SpO2

IMPORTANT:
BP and Weight must be clearly available.

Then:

Chief Complaint

Diagnosis

Rx Medicines

Repeatable medicine rows:

Medicine Name
Dosage
Frequency
Duration
Notes

Frequency dropdown comes from:

frequencyOptions

Buttons:

+ Add Medicine

Delete medicine

Medicine API:
Integrate a medicine search/autocomplete API if a suitable API is configured.

The architecture should support medicine API credentials through environment variables.

DO NOT hardcode secret API keys.

If the medicine API is not configured, the prescription system must still work using normal manual medicine entry.

==================================================
14. FACILITIES
==================================================

Show all 13 facilities on the prescription side column exactly as the clinic template.

IMPORTANT CORRECTION:

DO NOT add checkmarks/ticks beside facilities.

All facilities should remain listed on the side exactly as part of the existing template.

Do not dynamically remove facilities.

Do not replace the complete facility list with only selected facilities.

The physical/digital prescription should preserve the complete list:

Digital X-Ray
Child Dental Treatment
Braces
Clear Aligners
Teeth Cleaning
Dentures
Crown & Bridge
Root Canal Treatment
Gum Problems Treatment
Implants
Oral Surgery (Major / Minor)
Smile Design
Teeth Whitening

If the application needs to store facilities_advised, keep the data field for future use, but DO NOT show tick marks in the current printed template.

==================================================
15. PRESCRIPTION LETTERHEAD
==================================================

Match the provided reference prescription template.

Top-left:

Dr. Nidhi Nupur Mukul Kumar

BDS, MDS (Endodontics)

Reg. No.: A-30080

Top-right:

Heart-shaped tooth placeholder logo

Shibui
Dental Hub
Root Canal Specialist

Use rose branding.

Include the decorative rose curved corner/swoosh elements and thin gold lines shown in the actual template.

Patient information line:

Name: ______
Age: ______
Sex: ______
Date: ______

Main prescription area:

Rx

Medicines table.

Then:

Advice
Tests
Follow-up

Footer:

WhatsApp: 8390974572
Phone: 8788564733
Email: nupurnidhi90@gmail.com

Full clinic address

Clinic timings

==================================================
16. EXISTING TEMPLATE PRINTING — VERY IMPORTANT
==================================================

There are TWO printing modes.

MODE 1 — PRINT ON EXISTING PRE-PRINTED LETTERHEAD

This is the primary requirement.

The receptionist will place the clinic's existing prescription paper/template into the printer.

The browser/application should print ONLY the dynamic patient/prescription information in the correct coordinates.

Do NOT print the existing letterhead graphics again in this mode.

The CSS must have exact A4 dimensions and positioning so text lands in the correct location on the physical template.

Provide a print calibration-friendly structure so margins/offsets can easily be adjusted later.

MODE 2 — DIGITAL FULL PRESCRIPTION

For PDF/download/share purposes, render the complete digital prescription including the letterhead design.

Keep these modes separate.

==================================================
17. PRINTING / PRINTER COMMAND
==================================================

Printing must use the SYSTEM'S NORMAL PRINTER.

When staff clicks:

Print Prescription

the browser/system print dialog should open and send the print job through the operating system's available printer.

Do NOT attempt to install drivers.

Do NOT require a proprietary printer.

Use browser print APIs/window.print() with print-specific CSS.

The printed output must be A4.

Print CSS must hide:
- sidebar
- navigation
- dashboard
- buttons
- app UI
- backgrounds not belonging to the prescription

Only the prescription print component should appear in the print output.

Make the print layout stable across Chrome on Windows and iPad where possible.

==================================================
18. DOWNLOAD PDF
==================================================

Add:

Download PDF

The generated PDF must be A4.

It should use the SAME prescription design as the digital letterhead.

Do not create a visually different PDF.

The prescription should be suitable for:
- downloading
- storing
- sharing
- sending through WhatsApp

==================================================
19. PATIENTS
==================================================

Create Patients page.

Search by:
- Patient ID
- Name
- Phone

Patient list should be clean and fast.

Click patient → Patient Detail.

Patient Detail should show:

Patient Name
Patient ID
Age
Sex
Phone
Notes

Then:

APPOINTMENT HISTORY

Timeline/table:
Date
Reason
Time
Status

Then:

PRESCRIPTION HISTORY

Each prescription should show:
Date
Diagnosis
Chief Complaint
Follow-up date

Click prescription:
Open complete prescription.

Actions:
View
Edit if appropriate
Print
Download PDF
Share/send

==================================================
20. MEDICAL HISTORY BY PATIENT ID
==================================================

Patient ID must be the central link between all clinical information.

Example:

SHB-000045

Opening this patient must retrieve all related data from Supabase.

Timeline should combine:

Appointments
Prescriptions
Follow-ups

Chronological order.

A doctor should be able to understand the patient's previous treatment without searching through separate records.

==================================================
21. REMINDER SYSTEM — PATIENT + DOCTOR
==================================================

Build a complete reminder architecture.

Reminder types:

1. Appointment reminder
2. Follow-up reminder
3. Missed/no-show reminder
4. Doctor daily appointment reminder
5. Upcoming appointment reminder

WhatsApp should be the primary communication channel.

Integrate WhatsApp using an official WhatsApp Business/Meta WhatsApp Cloud API or another properly configured WhatsApp provider.

IMPORTANT:
Do not fake WhatsApp sending.

Create an integration layer/service such as:

whatsappService.ts

Credentials must be stored using environment variables.

Example:

WHATSAPP_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_BUSINESS_ACCOUNT_ID

Do not expose secrets in frontend code.

If WhatsApp credentials are not configured, show the reminder as:

"WhatsApp integration not configured"

instead of pretending it was sent.

==================================================
22. WHATSAPP REMINDER FLOW
==================================================

When an appointment is created:

Patient reminder can be scheduled.

Example message concept:

"Hello [Patient Name],
This is a reminder from Shibui Dental Hub regarding your dental appointment on [Date] at [Time].
Please contact us if you need to reschedule."

Follow-up reminder:

"Hello [Patient Name],
This is a reminder from Shibui Dental Hub for your follow-up scheduled on [Date]."

Doctor/reception reminder:

"Today's appointments:
[Patient] — [Time]
[Patient] — [Time]
..."

The exact templates should be configurable in code/constants.

==================================================
23. REMINDER AUTOMATION
==================================================

Use Supabase Edge Functions / scheduled backend jobs / Vercel cron where appropriate.

Do not depend on a browser tab being open for automated reminders.

Reminder system should be server-side.

Track:

reminder status
scheduled_at
sent_at
delivery status
error message

Avoid sending duplicate reminders.

If the same reminder has already been sent, do not send it again.

==================================================
24. MEDICAL AGENT / ASSISTANT ARCHITECTURE
==================================================

Create the architecture for a future "Medical Agent" / reminder assistant.

The agent can eventually help with:

- appointment reminders
- follow-up reminders
- patient communication
- basic administrative workflows
- summarizing patient history for the doctor

IMPORTANT:
Do not allow an AI agent to independently diagnose patients or prescribe medication.

AI should only assist the doctor/staff with administrative or informational tasks.

Keep this architecture modular so an AI/LLM provider can be connected later.

==================================================
25. REMINDERS UI
==================================================

Create a simple Reminders page.

Show:

Scheduled
Sent
Failed

Each reminder:

Patient
Patient ID
Type
Date
Channel
Status

Actions:
- Send now
- Retry
- View patient

==================================================
26. APPOINTMENT + PRESCRIPTION CONNECTION
==================================================

The complete workflow should be:

Receptionist books appointment
↓
Patient gets unique Patient ID
↓
Appointment stored
↓
Appointment appears in Day View
↓
Appointment appears in Calendar
↓
Patient arrives
↓
Doctor marks appointment Done
↓
Doctor/receptionist clicks Create Prescription
↓
Patient information auto-fills
↓
Prescription created
↓
Prescription saved against Patient ID
↓
Prescription appears in patient's history
↓
Prescription can be printed
↓
Prescription can be downloaded as PDF
↓
Follow-up date can create reminder
↓
WhatsApp reminder can be sent

This complete flow must work end-to-end.

==================================================
27. VALIDATION
==================================================

Friendly inline validation.

Required:

Patient Name
Phone
Appointment Date
Appointment Time

Prescription:
Patient
Date
and appropriate clinical fields.

Do not show technical error messages to receptionist.

Use messages such as:

"Please enter patient's name."

"Please select an appointment time."

"This phone number is already linked to an existing patient."

==================================================
28. PERFORMANCE
==================================================

The app should feel extremely fast.

Requirements:

- Supabase queries should be efficient
- Avoid unnecessary re-fetches
- Loading skeletons
- optimistic UI where safe
- debounced patient search
- responsive interactions
- no unnecessary animations
- mobile-first
- iPad touch-friendly
- buttons should have sufficiently large touch targets

==================================================
29. IPAD SUPPORT
==================================================

The entire application must work comfortably on iPad.

Ensure:

- responsive layouts
- touch-friendly buttons
- no hover-only functionality
- appointment cards usable with touch
- prescription form comfortable on tablet
- calendar usable on tablet
- sidebar adapts correctly
- no horizontal scrolling
- input fields are appropriately sized

==================================================
30. DATA SAFETY
==================================================

Use Supabase RLS.

Authenticated staff can:

SELECT
INSERT
UPDATE
DELETE

on the required clinic tables.

Clearly name policies, e.g.:

authenticated_staff_can_read_patients
authenticated_staff_can_insert_patients
authenticated_staff_can_update_patients
authenticated_staff_can_read_appointments
etc.

Never expose service-role credentials in frontend.

Use environment variables.

==================================================
31. CODE STRUCTURE
==================================================

Keep code modular.

Suggested structure:

src/
  components/
    clinic/
    appointments/
    patients/
    prescriptions/
    calendar/
    reminders/
    ui/

  pages/
    Login
    Dashboard
    Appointments
    Calendar
    NewPrescription
    Patients
    PatientDetail
    Reminders

  hooks/
    useBooking.ts
    usePatients.ts
    useAppointments.ts
    usePrescriptions.ts
    useReminders.ts

  services/
    whatsappService.ts
    medicineService.ts
    pdfService.ts

  config/
    clinic.ts

  components/prescription/
    PrescriptionForm.tsx
    PrescriptionPreview.tsx
    PrescriptionPrintTemplate.tsx
    ExistingTemplatePrint.tsx

Keep prescription print styling isolated so the doctor can fine-tune exact print coordinates later.

==================================================
32. UI DETAILS
==================================================

Dashboard should feel like a real clinic workspace.

Do NOT overload the UI.

Receptionist should immediately understand:

"What's happening today?"

"Who is coming next?"

"How do I book someone?"

"How do I create a prescription?"

"How do I find a patient's history?"

Use clear labels instead of technical terminology.

Example:

GOOD:
"Book Appointment"

BAD:
"Create Appointment Record"

GOOD:
"Patient History"

BAD:
"Clinical Data Repository"

==================================================
33. IMPORTANT EXISTING TEMPLATE REQUIREMENT
==================================================

The two attached photographs are the actual clinic prescription/reference documents.

Study them carefully.

The existing prescription layout has:

- doctor information at top-left
- Shibui Dental Hub branding at top-right
- rose/gold decorative elements
- patient details section
- facilities column on the left
- Rx section
- handwritten/clinical treatment area
- footer contact details

The application must respect this existing physical design.

DO NOT redesign the clinic's prescription into a generic software-generated prescription.

The goal is:

DIGITAL DATA → EXISTING CLINIC PRESCRIPTION FORMAT → PHYSICAL PRINT

The receptionist should be able to put the existing prescription pad into the printer and click Print.

==================================================
34. CURRENT CORRECTIONS / NON-NEGOTIABLE REQUIREMENTS
==================================================

These are specifically important:

1. Existing prescription template must be preserved.
2. Printing must support printing directly onto the existing pre-printed template.
3. Prescription information order must be logical and match the clinic's actual format.
4. Add BP and Weight fields.
5. Build complete patient + doctor WhatsApp reminder architecture.
6. Patient must have a permanent unique Patient ID.
7. Patient ID must retrieve complete appointment + prescription history.
8. Calendar events MUST actually appear from Supabase appointments.
9. All 13 facilities remain listed on the side.
10. DO NOT put ticks/checkmarks beside facilities.
11. Printer should use the system/browser's normal printing mechanism.
12. iPad compatibility is mandatory.
13. Medicine API must be optional/configurable through environment variables.
14. WhatsApp API must be optional/configurable through environment variables.
15. Never fake an API integration or pretend a WhatsApp message was sent.
16. Supabase should be used for persistent data and authentication.
17. Deployment target is Vercel.
18. Do not create unnecessary settings tables/settings pages.
19. Clinic constants remain in ONE config file.
20. Keep the prescription print component separate and easy to fine-tune.

==================================================
35. FINAL QUALITY BAR
==================================================

Before considering the application complete, verify the following end-to-end:

AUTH:
✓ Staff can log in immediately.

PATIENT:
✓ New patient gets SHB-XXXXXX ID.
✓ Existing patient is found by phone.
✓ Patient history is preserved.

APPOINTMENT:
✓ Appointment can be booked.
✓ Correct 30-minute slots appear.
✓ Already booked slots become unavailable.
✓ Sunday shows "By Appointment Only".
✓ Appointment appears in Day View.
✓ Appointment appears in Calendar.

PRESCRIPTION:
✓ Appointment can open New Prescription.
✓ Patient data auto-fills.
✓ BP + Weight exist.
✓ Medicines can be dynamically added/removed.
✓ Frequency comes from config.
✓ All 13 facilities remain visible.
✓ No facility tick marks.
✓ Prescription saves to Supabase.
✓ Prescription appears in Patient History.

PRINT:
✓ Existing physical template printing mode works.
✓ Dynamic data is positioned on the existing template.
✓ Browser/system print dialog opens.
✓ A4 print CSS works.
✓ App UI does not print.
✓ Full digital prescription can be downloaded as PDF.

HISTORY:
✓ Patient ID opens complete history.
✓ Previous prescriptions can be reopened.
✓ Previous prescriptions can be printed/downloaded.

REMINDERS:
✓ Appointment reminders architecture works.
✓ Follow-up reminders architecture works.
✓ Patient reminders support WhatsApp.
✓ Doctor/reception reminders support WhatsApp.
✓ No duplicate reminders.
✓ Failed messages can be retried.
✓ API keys are never exposed client-side.

RESPONSIVENESS:
✓ Desktop
✓ Mobile
✓ iPad

The final result should look and behave like a real, polished dental clinic management system rather than a demo/prototype.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f416aefc-b07f-4b1b-a9c3-8af9ae41e4d6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
