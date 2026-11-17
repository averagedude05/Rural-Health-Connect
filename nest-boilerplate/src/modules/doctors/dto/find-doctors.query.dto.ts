
import { IsOptional, IsString, IsUUID } from "class-validator";

export class FindDoctorsQueryDto {
  @IsOptional()
  @IsUUID()
  clinicId?: string;

  @IsOptional()
  @IsString()
  specialization?: string;
}
