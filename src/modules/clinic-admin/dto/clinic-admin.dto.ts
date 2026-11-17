import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateClinicDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  contactNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  description?: string;
}

export class UpdateClinicServiceDto {
  @IsString()
  @IsIn(["AVAILABLE", "UNAVAILABLE"])
  availabilityStatus!: string;
}

export class ClinicAppointmentsQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(["BOOKED", "APPROVED", "REJECTED", "COMPLETED", "CANCELLED", "NO_SHOW"])
  status?: string;
}

export class UpdateClinicAppointmentDto {
  @IsString()
  @IsIn(["APPROVED", "REJECTED"])
  status!: string;
}

