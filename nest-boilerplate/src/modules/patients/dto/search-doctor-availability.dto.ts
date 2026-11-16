import { IsDateString, IsOptional } from "class-validator";

export class SearchDoctorAvailabilityDto {
  @IsOptional()
  @IsDateString()
  date?: string;
}