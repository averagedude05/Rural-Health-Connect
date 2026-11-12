import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { DoctorAvailabilityStatus } from "../enums/doctor-availability-status.enum";

@Entity("doctor_availabilities")
@Unique(["doctorId", "availableDate", "startTime"])
export class DoctorAvailability {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "doctor_id", type: "integer" })
  doctorId!: number;

  @Column({ name: "available_date", type: "date" })
  availableDate!: string;

  @Column({ name: "start_time", type: "time" })
  startTime!: string;

  @Column({ name: "end_time", type: "time" })
  endTime!: string;

  @Column({
    type: "enum",
    enum: DoctorAvailabilityStatus,
    enumName: "doctor_availability_status_enum",
    default: DoctorAvailabilityStatus.AVAILABLE,
  })
  status!: DoctorAvailabilityStatus;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
