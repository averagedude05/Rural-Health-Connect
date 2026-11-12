import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class FindDoctorsQueryDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  clinicId?: number;

  @IsOptional()
  @IsString()
  specialization?: string;
}
