import {
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class UserResponseDto {
  id!: string;
  role!: string;
  phone!: string;
  accountStatus!: string;
  createdAt!: Date;
}

export class CreateUserDto {
  @IsString()
  @Matches(/^\+?[0-9]{7,20}$/)
  phone!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(128)
  password!: string;

  @IsString()
  @IsIn(["PATIENT", "DOCTOR", "ADMIN", "LAB_TECHNICIAN"])
  role!: string;

  @IsOptional()
  @IsString()
  @IsIn(["PENDING", "ACTIVE", "SUSPENDED"])
  accountStatus?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{7,20}$/)
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(128)
  password?: string;

  @IsOptional()
  @IsString()
  @IsIn(["PATIENT", "DOCTOR", "ADMIN", "LAB_TECHNICIAN"])
  role?: string;

  @IsOptional()
  @IsString()
  @IsIn(["PENDING", "ACTIVE", "SUSPENDED"])
  accountStatus?: string;
}
