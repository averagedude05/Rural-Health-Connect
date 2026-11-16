import { IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class SearchDoctorsDto {
  @IsOptional()
  @IsUUID()
  clinicId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  specialization?: string;
}