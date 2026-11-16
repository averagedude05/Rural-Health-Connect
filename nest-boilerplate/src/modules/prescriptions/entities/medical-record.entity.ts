
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DoctorProfile } from "@/modules/doctors/entities/doctor-profile.entity";

export interface PrescriptionMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export enum MedicalRecordAccessStatus {
  PRIVATE = "PRIVATE",
  SHARED = "SHARED",
}

@Entity("medical_records")
export class MedicalRecord {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "patient_id", type: "uuid" })
  patientId!: string;

  @ManyToOne(() => DoctorProfile, { nullable: false, onDelete: "RESTRICT" })
  @JoinColumn({ name: "doctor_id" })
  doctor!: DoctorProfile;

  @Column({ name: "clinic_id", type: "uuid" })
  clinicId!: string;

  @Column({ name: "visit_date", type: "date" })
  visitDate!: string;

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @Column({
    name: "access_status",
    type: "enum",
    enum: MedicalRecordAccessStatus,
    enumName: "medical_record_access_status_enum",
    default: MedicalRecordAccessStatus.PRIVATE,
  })
  accessStatus!: MedicalRecordAccessStatus;

  @Column({ name: "medicine_details", type: "jsonb", nullable: true })
  medicineDetails!: PrescriptionMedicine[] | null;

  @Column({
    name: "prescription_instructions",
    type: "text",
    nullable: true,
  })
  prescriptionInstructions!: string | null;

  @Column({
    name: "prescription_created_at",
    type: "timestamp",
    nullable: true,
  })
  prescriptionCreatedAt!: Date | null;
}
