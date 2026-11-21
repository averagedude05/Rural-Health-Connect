import {
  IsDateString,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  newPassword!: string;
}

export class LoginDto {
  @IsString()
  @Length(11, 20)
  phone!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}

export class RefreshTokenDto {
  @IsString()
  @MinLength(20)
  refreshToken!: string;
}

export class RegisterPatientDto {
  @IsString()
  @Matches(/^\+?\d{11,19}$/, {
    message:
      "phone must contain only digits (optional leading +), 11-20 characters",
  })
  phone!: string;

  // Keep the existing bcrypt-compatible password length limit during hash migration.
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @IsString()
  @Length(1, 160)
  name!: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  emergencyContact?: string;
}



