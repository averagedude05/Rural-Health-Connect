
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DoctorProfile } from "@/modules/doctors/entities/doctor-profile.entity";

export enum LabRequestStatus {
  REQUESTED = "REQUESTED",
  ASSIGNED = "ASSIGNED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

@Entity("lab_requests")
export class LabRequest {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "patient_id", type: "uuid" })
  patientId!: string;

  @ManyToOne(() => DoctorProfile, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "doctor_id" })
  doctor!: DoctorProfile;

  @Column({ name: "technician_id", type: "uuid", nullable: true })
  technicianId!: string | null;

  @Column({ name: "test_name", type: "varchar", length: 160 })
  testName!: string;

  @Column({
    type: "enum",
    enum: LabRequestStatus,
    enumName: "lab_request_status_enum",
    default: LabRequestStatus.REQUESTED,
  })
  status!: LabRequestStatus;

  @Column({
    name: "requested_at",
    type: "timestamp",
    default: () => "now()",
  })
  requestedAt!: Date;

  @Column({ name: "file_path", type: "text", nullable: true })
  filePath!: string | null;

  @Column({
    name: "result_uploaded_at",
    type: "timestamp",
    nullable: true,
  })
  resultUploadedAt!: Date | null;
}
