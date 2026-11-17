import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { ClinicAppointmentsQueryDto, UpdateClinicAppointmentDto, UpdateClinicDto, UpdateClinicServiceDto } from "./dto/clinic-admin.dto";

@Injectable()
export class ClinicAdminService {
  constructor(private readonly dataSource: DataSource) {}

  async findClinics(userId: string) {
    return this.dataSource.query(
      `SELECT c."id", c."name", c."address", c."location", c."contact_number" AS "contactNumber", c."status" FROM "clinics" c INNER JOIN "clinic_admin_assignments" a ON a."clinic_id" = c."id" WHERE a."user_id" = $1 ORDER BY c."name" ASC`,
      [userId],
    );
  }

  async dashboard(clinicId: string) {
    const clinics = await this.dataSource.query(`SELECT "id", "name", "address", "location", "contact_number" AS "contactNumber", "description", "status" FROM "clinics" WHERE "id" = $1`, [clinicId]);
    if (!clinics.length) throw new NotFoundException("Clinic not found");
    const [appointments] = await this.dataSource.query(
      `SELECT COUNT(*)::int AS "total", COUNT(*) FILTER (WHERE "status" = 'BOOKED')::int AS "requested", COUNT(*) FILTER (WHERE "status" = 'APPROVED')::int AS "approved", COUNT(*) FILTER (WHERE "status" = 'COMPLETED')::int AS "completed" FROM "appointments" WHERE "clinic_id" = $1`,
      [clinicId],
    );
    const [doctors] = await this.dataSource.query(`SELECT COUNT(*)::int AS "total" FROM "doctor_profiles" WHERE "clinic_id" = $1`, [clinicId]);
    const [services] = await this.dataSource.query(`SELECT COUNT(*)::int AS "total", COUNT(*) FILTER (WHERE "availability_status" = 'AVAILABLE')::int AS "available" FROM "clinic_services" WHERE "clinic_id" = $1`, [clinicId]);
    return { clinic: clinics[0], appointments, doctors, services };
  }

  async appointments(clinicId: string, query: ClinicAppointmentsQueryDto) {
    const params: unknown[] = [clinicId];
    const filter = query.status ? ` AND a."status" = $2` : "";
    if (query.status) params.push(query.status);
    return this.dataSource.query(
      `SELECT a."id", a."appointment_type" AS "appointmentType", a."appointment_time" AS "appointmentTime", a."status", p."name" AS "patientName", d."name" AS "doctorName" FROM "appointments" a INNER JOIN "patient_profiles" p ON p."id" = a."patient_id" INNER JOIN "doctor_profiles" d ON d."id" = a."doctor_id" WHERE a."clinic_id" = $1${filter} ORDER BY a."appointment_time" DESC`,
      params,
    );
  }

  async updateAppointment(clinicId: string, appointmentId: string, dto: UpdateClinicAppointmentDto) {
    const rows = await this.dataSource.query(
      `UPDATE "appointments" SET "status" = $1 WHERE "id" = $2 AND "clinic_id" = $3 AND "status" = 'BOOKED' RETURNING "id", "status"`,
      [dto.status, appointmentId, clinicId],
    );
    if (rows.length) return rows[0];
    const existing = await this.dataSource.query(`SELECT "id" FROM "appointments" WHERE "id" = $1 AND "clinic_id" = $2`, [appointmentId, clinicId]);
    if (!existing.length) throw new NotFoundException("Appointment not found");
    throw new ConflictException("Only booked appointments can be approved or rejected");
  }
  async updateClinic(clinicId: string, dto: UpdateClinicDto) {
    const values = [dto.name?.trim() ?? null, dto.address?.trim() ?? null, dto.location?.trim() ?? null, dto.contactNumber?.trim() ?? null, dto.description?.trim() ?? null, clinicId];
    const rows = await this.dataSource.query(
      `UPDATE "clinics" SET "name" = COALESCE($1, "name"), "address" = COALESCE($2, "address"), "location" = COALESCE($3, "location"), "contact_number" = COALESCE($4, "contact_number"), "description" = COALESCE($5, "description") WHERE "id" = $6 RETURNING "id", "name", "address", "location", "contact_number" AS "contactNumber", "description", "status"`,
      values,
    );
    if (!rows.length) throw new NotFoundException("Clinic not found");
    return rows[0];
  }

  async updateService(clinicId: string, serviceId: string, dto: UpdateClinicServiceDto) {
    const rows = await this.dataSource.query(
      `UPDATE "clinic_services" SET "availability_status" = $1 WHERE "id" = $2 AND "clinic_id" = $3 RETURNING "id", "service_name" AS "serviceName", "availability_status" AS "availabilityStatus"`,
      [dto.availabilityStatus, serviceId, clinicId],
    );
    if (!rows.length) throw new NotFoundException("Clinic service not found");
    return rows[0];
  }

  async monthlyReport(clinicId: string) {
    return this.dataSource.query(
      `SELECT DATE_TRUNC('month', "appointment_time")::date AS "month", COUNT(*)::int AS "appointments", COUNT(*) FILTER (WHERE "status" = 'COMPLETED')::int AS "completed", COUNT(*) FILTER (WHERE "status" = 'CANCELLED')::int AS "cancelled" FROM "appointments" WHERE "clinic_id" = $1 GROUP BY DATE_TRUNC('month', "appointment_time") ORDER BY "month" DESC LIMIT 12`,
      [clinicId],
    );
  }
}


