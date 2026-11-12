import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { DoctorVerificationStatus } from "../enums/doctor-verification-status.enum";

@Entity("doctor_profiles")
@Unique(["userId"])
export class DoctorProfile {
  @PrimaryGeneratedColumn()
  id!: number;

  // These IDs connect this feature to the shared User and Clinic modules.
  @Column({ name: "user_id", type: "integer" })
  userId!: number;

  @Column({ name: "clinic_id", type: "integer" })
  clinicId!: number;

  @Column({ name: "full_name", type: "varchar", length: 120 })
  fullName!: string;

  @Column({ type: "varchar", length: 100 })
  specialization!: string;

  @Column({ type: "varchar", length: 200 })
  qualification!: string;

  @Column({
    name: "verification_status",
    type: "enum",
    enum: DoctorVerificationStatus,
    enumName: "doctor_verification_status_enum",
    default: DoctorVerificationStatus.PENDING,
  })
  verificationStatus!: DoctorVerificationStatus;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
