
import { IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class CreateDoctorDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  clinicId!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  fullName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  specialization!: string;
}
