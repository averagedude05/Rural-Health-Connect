import { IsString, Matches, MaxLength, MinLength } from "class-validator";

export class PatientLoginDto {
  @IsString()
  @Matches(/^\+?[0-9]{8,15}$/)
  phone!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password!: string;
}
