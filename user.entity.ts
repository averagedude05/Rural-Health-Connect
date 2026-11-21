import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PatientProfile } from "@/src/modules/patients/entities/patient-profile.entity";
import { AdminProfile } from "@/modules/clinic-admin/entities/clinic-admin.entity";
@Entity({ name: "users" })
export class User {
  @OneToOne(() => AdminProfile, (adminProfile) => adminProfile.user)
  adminProfile?: AdminProfile;

  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 30 })
  role!: string;

  @Column({ type: "varchar", length: 20, unique: true })
  phone!: string;

  @Column({
    name: "password_hash",
    type: "varchar",
    length: 255,
    
  })
  passwordHash!: string;

  @Column({ name: "account_status", type: "varchar", length: 20 })
  accountStatus!: string;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamp",
  })
  createdAt!: Date;

  @OneToOne(() => PatientProfile, (patientProfile) => patientProfile.user)
  patientProfile?: PatientProfile;
}

