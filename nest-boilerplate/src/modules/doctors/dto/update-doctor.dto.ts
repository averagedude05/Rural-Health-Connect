import { Type } from "class-transformer";
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class UpdateDoctorDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  clinicId?: number;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  specialization?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  qualification?: string;
}
