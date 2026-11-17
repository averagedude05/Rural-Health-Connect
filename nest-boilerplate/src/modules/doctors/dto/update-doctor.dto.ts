
import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class UpdateDoctorDto {
  // Doctor's Full Name
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  fullName?: string;

  // Doctor's Specialization
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  specialization?: string;
}
