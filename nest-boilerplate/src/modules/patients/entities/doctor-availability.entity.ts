import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("doctor_availabilities")
export class DoctorAvailabilityEntity {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
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
    enum: ["AVAILABLE", "TAKEN", "UNAVAILABLE"],
    enumName: "doctor_availability_status_enum",
    default: "AVAILABLE",
  })
  slotStatus!: "AVAILABLE" | "TAKEN" | "UNAVAILABLE";
}