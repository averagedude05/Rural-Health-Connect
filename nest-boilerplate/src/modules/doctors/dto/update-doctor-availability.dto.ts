import { IsIn, IsOptional } from "class-validator";
import { DoctorAvailabilityStatus } from "../enums/doctor-availability-status.enum";

export class UpdateDoctorAvailabilityDto {
  // Appointment booking owns the BOOKED state; doctors can only open or close a slot.
  @IsOptional()
  @IsIn([DoctorAvailabilityStatus.AVAILABLE, DoctorAvailabilityStatus.UNAVAILABLE])
  status?: DoctorAvailabilityStatus.AVAILABLE | DoctorAvailabilityStatus.UNAVAILABLE;
}
