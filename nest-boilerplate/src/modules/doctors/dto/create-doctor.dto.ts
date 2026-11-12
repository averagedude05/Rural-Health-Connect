import { Type } from "class-transformer";
import { IsInt, IsString, MaxLength, Min, MinLength } from "class-validator";

export class CreateDoctorDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  clinicId!: number;

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  fullName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  specialization!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  qualification!: string;
}
