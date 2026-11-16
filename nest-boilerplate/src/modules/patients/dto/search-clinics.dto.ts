import { IsOptional, IsString, MaxLength } from "class-validator";

export class SearchClinicsDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  service?: string;
}