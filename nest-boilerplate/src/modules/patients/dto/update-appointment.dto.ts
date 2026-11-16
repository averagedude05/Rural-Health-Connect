import { IsDateString, IsIn, IsOptional } from "class-validator";

export class UpdateAppointmentDto {
  @IsOptional()
  @IsDateString()
  appointmentTime?: string;

  @IsOptional()
  @IsIn(["IN_PERSON", "ONLINE"])
  appointmentType?: "IN_PERSON" | "ONLINE";
}
