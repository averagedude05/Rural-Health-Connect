import { RegisterPatientDto } from "@/src/modules/auth/dto/auth.dto";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { AccountStatus } from "@/common/enums/account-status.enum";
import { Role } from "@/common/enums/role.enum";

export class CreatePatientAccountDto extends RegisterPatientDto {}

export class ListUsersQueryDto {
  @IsOptional()
  @IsIn(Object.values(Role))
  role?: string;

  @IsOptional()
  @IsEnum(AccountStatus)
  accountStatus?: AccountStatus;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 50;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset = 0;
}


export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Matches(/^\+?\d{11,19}$/, {
    message:
      "phone must contain only digits (optional leading +), 11-20 characters",
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password?: string;
}

export class UpdateUserStatusDto {
  @IsEnum(AccountStatus)
  accountStatus!: AccountStatus;
}

