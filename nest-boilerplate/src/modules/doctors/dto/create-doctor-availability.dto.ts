import { IsDateString, Matches } from "class-validator";

export class CreateDoctorAvailabilityDto {
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "availableDate must use YYYY-MM-DD format",
  })
  availableDate!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "startTime must use 24-hour HH:mm format",
  })
  startTime!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "endTime must use 24-hour HH:mm format",
  })
  endTime!: string;
}
