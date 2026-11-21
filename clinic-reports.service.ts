import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { ClinicAdminService } from "./clinic-admin.service";

/**
 * Read-only analytics and monthly reports (system-wide and per clinic).
 * Aggregations across teammates' tables are written as parameterized SQL.
 */
@Injectable()
export class ClinicReportsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly clinicAdminService: ClinicAdminService,
  ) {}

  // NOTE: emergency_requests.status is a PostgreSQL enum, so upper() cannot be
  // used on it (it only works on text columns such as appointments.status).
  async getSystemAnalytics() {
    const [clinicSummary] = await this.dataSource.query(
      `SELECT count(*)::int AS "clinicCount",
              count(*) FILTER (WHERE upper(status)='ACTIVE')::int AS "activeClinics"
       FROM clinics`,
    );
    const [appointmentSummary] = await this.dataSource.query(
      `SELECT count(*)::int AS "appointmentCount",
              count(DISTINCT patient_id)::int AS "patientVolume",
              count(*) FILTER (WHERE upper(status) IN ('REQUESTED','PENDING','BOOKED'))::int AS "pendingRequests"
       FROM appointments`,
    );
    const [doctorSummary] = await this.dataSource.query(
      `SELECT count(*) FILTER (WHERE u.account_status='ACTIVE')::int AS "activeDoctors"
       FROM doctor_profiles d JOIN users u ON u.id=d.user_id`,
    );
    const [emergencySummary] = await this.dataSource.query(
      `SELECT count(*) FILTER (WHERE status IN ('OPEN','ASSIGNED','IN_PROGRESS'))::int AS "openEmergencyRequests"
       FROM emergency_requests`,
    );
    return {
      ...clinicSummary,
      ...appointmentSummary,
      ...doctorSummary,
      ...emergencySummary,
    };
  }

  async getAnalyticsForClinic(clinicId: string) {
    await this.clinicAdminService.getClinicById(clinicId);
    const [overview] = await this.dataSource.query(
      `SELECT count(*)::int AS "appointmentCount",
              count(DISTINCT patient_id)::int AS "patientVolume",
              count(*) FILTER (WHERE upper(status) IN ('REQUESTED','PENDING','BOOKED'))::int AS "pendingRequests",
              count(*) FILTER (WHERE upper(status)='APPROVED')::int AS "approvedAppointments",
              count(*) FILTER (WHERE upper(status)='REJECTED')::int AS "rejectedAppointments"
       FROM appointments WHERE clinic_id=$1`,
      [clinicId],
    );
    const [doctorCounts] = await this.dataSource.query(
      `SELECT count(*) FILTER (WHERE u.account_status='ACTIVE')::int AS "activeDoctors",
              count(*) FILTER (WHERE u.account_status<>'ACTIVE')::int AS "inactiveDoctors"
       FROM doctor_profiles d JOIN users u ON u.id=d.user_id
       WHERE d.clinic_id=$1`,
      [clinicId],
    );
    return { ...overview, ...doctorCounts };
  }

  // `month` is already validated as YYYY-MM by MonthQueryDto.

  async getSystemMonthlyReport(month: string) {
    const byClinic = await this.dataSource.query(
      `SELECT c.id AS "clinicId", c.name AS "clinicName",
              count(a.id)::int AS "appointmentCount",
              count(DISTINCT a.patient_id)::int AS "patientVolume"
       FROM clinics c
       LEFT JOIN appointments a ON a.clinic_id=c.id
         AND a.appointment_time >= ($1 || '-01')::date
         AND a.appointment_time < (($1 || '-01')::date + INTERVAL '1 month')
       GROUP BY c.id, c.name
       ORDER BY c.name`,
      [month],
    );
    const caseCategories = await this.dataSource.query(
      `SELECT COALESCE(NULLIF(trim(case_category), ''), 'Uncategorized') AS category,
              count(*)::int AS count
       FROM medical_records
       WHERE visit_date >= ($1 || '-01')::date
         AND visit_date < (($1 || '-01')::date + INTERVAL '1 month')
       GROUP BY 1 ORDER BY count DESC, category`,
      [month],
    );
    return { month, byClinic, caseCategories };
  }

  async getMonthlyReportForClinic(clinicId: string, month: string) {
    await this.clinicAdminService.getClinicById(clinicId);
    const [totals] = await this.dataSource.query(
      `SELECT count(*)::int AS "appointmentCount",
              count(DISTINCT patient_id)::int AS "patientVolume"
       FROM appointments
       WHERE clinic_id=$1
         AND appointment_time >= ($2 || '-01')::date
         AND appointment_time < (($2 || '-01')::date + INTERVAL '1 month')`,
      [clinicId, month],
    );
    const caseCategories = await this.dataSource.query(
      `SELECT COALESCE(NULLIF(trim(case_category), ''), 'Uncategorized') AS category,
              count(*)::int AS count
       FROM medical_records
       WHERE clinic_id=$1
         AND visit_date >= ($2 || '-01')::date
         AND visit_date < (($2 || '-01')::date + INTERVAL '1 month')
       GROUP BY 1 ORDER BY count DESC, category`,
      [clinicId, month],
    );
    return { month, ...totals, caseCategories };
  }
}


