import { IsDateString, IsIn, IsOptional, Matches } from "class-validator";
import { DoctorAvailabilityStatus } from "../enums/doctor-availability-status.enum";

export class UpdateDoctorAvailabilityDto {
  // Appointment booking owns the TAKEN state; doctors can only open or close a slot.
  @IsOptional()
  @IsIn([DoctorAvailabilityStatus.AVAILABLE, DoctorAvailabilityStatus.UNAVAILABLE])
  status?: DoctorAvailabilityStatus.AVAILABLE | DoctorAvailabilityStatus.UNAVAILABLE;

  @IsOptional()
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "availableDate must use YYYY-MM-DD format",
  })
  availableDate?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "startTime must use 24-hour HH:mm format",
  })
  startTime?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "endTime must use 24-hour HH:mm format",
  })
  endTime?: string;
}
