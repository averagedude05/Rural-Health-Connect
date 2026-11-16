import { IsDateString, IsIn, IsUUID } from "class-validator";

export class CreateAppointmentDto {
  @IsUUID()
  doctorId!: string;

  @IsUUID()
  clinicId!: string;

  @IsIn(["IN_PERSON", "ONLINE"])
  appointmentType!: "IN_PERSON" | "ONLINE";

  @IsDateString()
  appointmentTime!: string;
}