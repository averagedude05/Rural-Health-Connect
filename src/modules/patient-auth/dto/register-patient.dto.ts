import { IsDateString, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class RegisterPatientDto {
  @IsString()
  @Matches(/^\+?[0-9]{8,15}$/)
  phone!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(128)
  password!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name!: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  emergencyContact?: string;
}
