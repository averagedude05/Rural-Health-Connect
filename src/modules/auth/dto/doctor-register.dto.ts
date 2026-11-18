
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  Matches,
  MinLength,
} from "class-validator";

export class DoctorRegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^\+?[0-9]{7,15}$/, {
    message: "phone must contain 7 to 15 digits, optionally starting with +",
  })
  phone!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

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
