
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { DoctorAvailabilityStatus } from "../enums/doctor-availability-status.enum";

@Entity("doctor_availabilities")
@Unique(["doctorId", "availableDate", "startTime"])
export class DoctorAvailability {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "doctor_id", type: "uuid" })
  doctorId!: string;

  @Column({ name: "available_date", type: "date" })
  availableDate!: string;

  @Column({ name: "start_time", type: "time" })
  startTime!: string;

  @Column({ name: "end_time", type: "time" })
  endTime!: string;

  @Column({
    name: "slot_status",
    type: "enum",
    enum: DoctorAvailabilityStatus,
    enumName: "doctor_availability_status_enum",
    default: DoctorAvailabilityStatus.AVAILABLE,
  })
  status!: DoctorAvailabilityStatus;
}
