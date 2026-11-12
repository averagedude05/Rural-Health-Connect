# Doctors module

This module owns doctor profiles, their verification state, and doctor availability slots.

## Endpoints

- `POST /doctors` - create a doctor profile; new profiles start as `PENDING`.
- `GET /doctors` - list active profiles; supports `clinicId` and `specialization` filters.
- `GET /doctors/:id` - get one active profile.
- `PATCH /doctors/:id` - update profile details.
- `PATCH /doctors/:id/verification` - set `PENDING`, `VERIFIED`, or `REJECTED`.
- `DELETE /doctors/:id` - deactivate a profile.
- `GET /doctors/:doctorId/availability` - list the doctor's schedule.
- `POST /doctors/:doctorId/availability` - add a time slot. Only verified doctors can add slots.
- `PATCH /doctor-availability/:id` - open or close an unbooked slot.
- `DELETE /doctor-availability/:id` - delete an unbooked slot.

## Request examples

Create a profile:

```json
{
  "userId": 1,
  "clinicId": 1,
  "fullName": "Dr. Example",
  "specialization": "General Medicine",
  "qualification": "MBBS"
}
```

Add availability:

```json
{
  "availableDate": "2026-12-01",
  "startTime": "09:00",
  "endTime": "09:30"
}
```

The root `AppModule` imports this module and `main.ts` enables the global `ValidationPipe`. Run the doctor-table migration before using these endpoints.

## Group integration

- `userId` and `clinicId` are kept as IDs until the shared User and Clinic entities are agreed. The group integrator should add foreign keys in a follow-up migration using the final table names.
- Appointment booking owns the `BOOKED` status and should update a slot inside its transaction. This module does not allow doctors to set `BOOKED` manually.
- Medical records own consultation notes and prescriptions. The doctor workflow should call the agreed Medical Records API instead of creating duplicate tables here.
- The starter repository has no healthcare login strategy or role definitions yet. Before group use, protect profile creation/deactivation and verification with the agreed JWT roles (clinic admin/doctor), and restrict schedule edits to the owning doctor.
- One group integrator should reconcile changes to `AppModule`, `main.ts`, shared auth roles, and migrations when merging other members' branches.
