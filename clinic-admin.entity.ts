import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm";
import { DoctorSlotStatus } from "@/common/enums/doctor-slot-status.enum";
import { EmergencyRequestStatus } from "@/common/enums/emergency-request-status.enum";
import { User } from "@/modules/users/entities/user.entity";

@Entity({ name: "clinics" })
export class Clinic {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 160 })
  name!: string;

  @Column({ type: "text" })
  address!: string;

  @Column({ type: "varchar", length: 160, nullable: true })
  location!: string | null;

  @Column({ name: "contact_number", type: "varchar", length: 20 })
  contactNumber!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "varchar", length: 20 })
  status!: string;

  @OneToMany(() => AdminProfile, (adminProfile) => adminProfile.clinic)
  adminProfiles!: AdminProfile[];

  @OneToMany(() => ClinicService, (service) => service.clinic)
  services!: ClinicService[];
}

@Entity({ name: "admin_profiles" })
export class AdminProfile {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @OneToOne(() => User, (user) => user.adminProfile, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @RelationId((adminProfile: AdminProfile) => adminProfile.user)
  userId!: string;

  @ManyToOne(() => Clinic, (clinic) => clinic.adminProfiles, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "clinic_id" })
  clinic!: Clinic;

  @RelationId((adminProfile: AdminProfile) => adminProfile.clinic)
  clinicId!: string;

  @Column({ type: "varchar", length: 160 })
  name!: string;
}

@Entity({ name: "clinic_services" })
export class ClinicService {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "clinic_id", type: "uuid" })
  clinicId!: string;

  @ManyToOne(() => Clinic, (clinic) => clinic.services, { onDelete: "CASCADE" })
  @JoinColumn({ name: "clinic_id" })
  clinic!: Clinic;

  @Column({ name: "service_name", type: "varchar", length: 160 })
  serviceName!: string;

  @Column({ name: "availability_status", type: "varchar", length: 20 })
  availabilityStatus!: string;
}

@Entity({ name: "doctor_profiles" })
export class DoctorProfile {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "uuid", unique: true })
  userId!: string;

  @OneToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "clinic_id", type: "uuid" })
  clinicId!: string;

  @ManyToOne(() => Clinic, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "clinic_id" })
  clinic!: Clinic;

  @Column({ type: "varchar", length: 120 })
  name!: string;

  @Column({ type: "varchar", length: 100 })
  specialization!: string;
}

@Entity({ name: "doctor_availabilities" })
export class DoctorAvailability {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "doctor_id", type: "uuid" })
  doctorId!: string;

  @ManyToOne(() => DoctorProfile, { onDelete: "CASCADE" })
  @JoinColumn({ name: "doctor_id" })
  doctor!: DoctorProfile;

  // "date" / "time" columns are returned as plain strings ("2026-05-01", "09:00:00")
  @Column({ name: "available_date", type: "date" })
  availableDate!: string;

  @Column({ name: "start_time", type: "time" })
  startTime!: string;

  @Column({ name: "end_time", type: "time" })
  endTime!: string;

  @Column({
    name: "slot_status",
    type: "enum",
    enum: DoctorSlotStatus,
    enumName: "doctor_availability_status_enum",
    default: DoctorSlotStatus.AVAILABLE,
  })
  slotStatus!: DoctorSlotStatus;
}

@Entity({ name: "appointments" })
export class AppointmentRecord {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "patient_id", type: "uuid" })
  patientId!: string;

  @Column({ name: "doctor_id", type: "uuid" })
  doctorId!: string;

  @Column({ name: "clinic_id", type: "uuid" })
  clinicId!: string;

  @Column({ name: "appointment_type", type: "varchar", length: 20 })
  appointmentType!: string;

  @Column({ name: "appointment_time", type: "timestamp" })
  appointmentTime!: Date;

  @Column({ type: "varchar", length: 20 })
  status!: string;
}

@Entity({ name: "clinic_patient_consents" })
export class ClinicPatientConsentRecord {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "patient_id", type: "uuid" })
  patientId!: string;

  @Column({ name: "clinic_id", type: "uuid" })
  clinicId!: string;

  @Column({ type: "varchar", length: 20 })
  status!: "GRANTED" | "REVOKED";

  @Column({ name: "granted_at", type: "timestamp" })
  grantedAt!: Date;

  @Column({ name: "revoked_at", type: "timestamp", nullable: true })
  revokedAt!: Date | null;
}

@Entity({ name: "emergency_requests" })
export class EmergencyRequestRecord {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "patient_id", type: "uuid" })
  patientId!: string;

  @Column({ name: "clinic_id", type: "uuid", nullable: true })
  clinicId!: string | null;

  @Column({ name: "assigned_doctor_id", type: "uuid", nullable: true })
  assignedDoctorId!: string | null;

  @Column({ type: "text" })
  description!: string;

  @Column({
    type: "enum",
    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    enumName: "emergency_priority_enum",
    default: "MEDIUM",
  })
  priority!: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

  @Column({
    type: "enum",
    enum: EmergencyRequestStatus,
    enumName: "emergency_status_enum",
    default: EmergencyRequestStatus.OPEN,
  })
  status!: EmergencyRequestStatus;
}
