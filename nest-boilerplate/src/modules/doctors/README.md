# Doctors module

This module owns doctor profiles and doctor availability slots, using the fields in the approved ER diagram.

## Endpoints

- `POST /auth/admin/login` - verify an admin phone and password and return a bearer token.
- `POST /auth/doctor/register` - create a doctor user and profile with `PENDING` account status.
- `POST /auth/doctor/login` - log in an approved, active doctor account.
- `POST /doctors` - create a doctor profile for an existing DOCTOR user and clinic.
- `GET /doctors` - list doctor profiles for admins; supports `clinicId` and `specialization` filters.
- `GET /doctors/:id` - get one doctor profile, including one awaiting approval.
- `PATCH /doctors/:id` - update profile details.
- `PATCH /doctors/:id/account-status` - approve or suspend a doctor account.
- `DELETE /doctors/:id` - deactivate a profile.
- `GET /doctors/:doctorId/availability` - list the doctor's schedule.
- `POST /doctors/:doctorId/availability` - add a time slot for an active doctor account.
- `PATCH /doctor-availability/:id` - change an unbooked slot's date/time or open/close it.
- `DELETE /doctor-availability/:id` - delete an unbooked slot.

## Request examples

Public doctor registration:

```json
{
  "phone": "01700000123",
  "password": "a-strong-password",
  "clinicId": 1,
  "fullName": "Dr. Example",
  "specialization": "General Medicine"
}
```

Registration creates a `DOCTOR` user, stores the password as an Argon2 hash, creates the doctor profile, and sets `users.account_status` to `PENDING`. An Admin approves it with `PATCH /doctors/:id/account-status` and `{ "accountStatus": "ACTIVE" }`. The doctor can log in after approval.

Add availability:

```json
{
  "availableDate": "2026-12-01",
  "startTime": "09:00",
  "endTime": "09:30"
}
```

The root `AppModule` imports this module and `main.ts` enables the global `ValidationPipe`. Run the doctor-table migration before using these endpoints.

All `/doctors` profile endpoints require a bearer token for an active Admin account. Doctor registration is public; doctor login is allowed after an Admin sets the account status to `ACTIVE`. Create the first system Admin after running the migration:

```powershell
$env:ADMIN_NAME = "System Admin"
$env:ADMIN_PHONE = "01700000000"
$securePassword = Read-Host "Admin password" -AsSecureString
$env:ADMIN_PASSWORD = [System.Net.NetworkCredential]::new("", $securePassword).Password
pnpm.cmd run admin:create
Remove-Item Env:ADMIN_NAME, Env:ADMIN_PHONE, Env:ADMIN_PASSWORD
Remove-Variable securePassword
```

The seed script stores an Argon2 password hash and creates both the Admin user and its system-wide Admin profile. It does not store the password in the source code.

For Postman, first send `POST /auth/admin/login` with `{ "phone": "...", "password": "..." }`. Copy `accessToken`, then set the Authorization type to **Bearer Token** for `/doctors` requests.

## Validation and group integration

- Doctor profile creation checks that the user exists, has the `DOCTOR` role, and that the clinic exists. The database migration also enforces the user and clinic foreign keys.
- Appointment booking owns the `TAKEN` status and should update a slot inside its transaction. This module does not allow doctors to set `TAKEN` manually.
- Medical records own consultation notes and prescriptions. The doctor workflow should call the agreed Medical Records API instead of creating duplicate tables here.
- Appointment management owns the doctor appointment calendar and appointment actions. The appointment module should use this module's availability records when booking and changing a booking.
- Laboratory and Emergency modules own test/referral requests and emergency queues; the doctor workflow should use those modules instead of duplicating their tables or endpoints.
- Doctor verification status is not stored in the supplied diagram, so this module does not expose a verification endpoint. Add that field and endpoint later if the group updates the agreed ER diagram.
- Profile create/read/update/deactivate routes use an Admin-only JWT guard. Availability route ownership still needs to be connected to the shared doctor login once that workflow is added.
- One group integrator should reconcile changes to `AppModule`, `main.ts`, shared auth roles, and migrations when merging other members' branches.
