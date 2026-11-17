import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AdminProfile } from "@/src/modules/clinic-admin/entities/admin-profile.entity";
import { PatientProfile } from "@/src/modules/patients/entities/patient-profile.entity";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 30 })
  role!: string;

  @Column({ type: "varchar", length: 20, unique: true })
  phone!: string;

  @Column({ name: "password_hash", type: "varchar", length: 255, select: false })
  passwordHash!: string;

  @Column({ name: "account_status", type: "varchar", length: 20 })
  accountStatus!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @OneToOne(() => PatientProfile, (patientProfile) => patientProfile.user)
  patientProfile?: PatientProfile;

  @OneToOne(() => AdminProfile, (adminProfile) => adminProfile.user)
  adminProfile?: AdminProfile;
}
