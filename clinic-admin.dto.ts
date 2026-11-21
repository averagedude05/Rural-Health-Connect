import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { AccountStatus } from "@/common/enums/account-status.enum";
import { ClinicServiceAvailability } from "@/src/common/enums/clinic-service-availability.enum";
import { ClinicStatus } from "@/common/enums/clinic-status.enum";
import { DoctorSlotStatus } from "@/common/enums/doctor-slot-status.enum";
import { EmergencyRequestStatus } from "@/common/enums/emergency-request-status.enum";

export class AppointmentQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset = 0;
}

export class ChangeDoctorStatusDto {
  @IsEnum(AccountStatus)
  accountStatus!: AccountStatus;
}

export class CreateClinicProfileDto {
  @IsString()
  @Length(1, 160)
  name!: string;

  @IsString()
  @Length(1, 2000)
  address!: string;

  @IsOptional()
  @IsString()
  @Length(1, 160)
  location?: string;

  @IsString()
  @Length(1, 20)
  contactNumber!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;
}

export class CreateClinicServiceDto {
  @IsString()
  @Length(1, 160)
  serviceName!: string;

  @IsOptional()
  @IsEnum(ClinicServiceAvailability)
  availabilityStatus?: ClinicServiceAvailability;
}

export class CreateDoctorAvailabilityDto {
  @IsDateString({ strict: true })
  availableDate!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
  startTime!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
  endTime!: string;
}

export class CreateDoctorDto {
  @IsString()
  @Matches(/^\+?\d{11,19}$/, {
    message:
      "phone must contain only digits (optional leading +), 11-20 characters",
  })
  phone!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @IsString()
  @Length(1, 120)
  name!: string;

  @IsString()
  @Length(1, 100)
  specialization!: string;
}

export class EmergencyRequestQueryDto {
  @IsOptional()
  @IsEnum(EmergencyRequestStatus)
  status?: EmergencyRequestStatus;
}

export class MonthQueryDto {
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: "month must use YYYY-MM format",
  })
  month!: string;
}

export class UpdateClinicProfileDto {
  @IsOptional()
  @IsString()
  @Length(1, 160)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  address?: string;

  @IsOptional()
  @IsString()
  @Length(1, 160)
  location?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  contactNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;
}

export class UpdateClinicServiceDto {
  @IsOptional()
  @IsString()
  @Length(1, 160)
  serviceName?: string;

  @IsOptional()
  @IsEnum(ClinicServiceAvailability)
  availabilityStatus?: ClinicServiceAvailability;
}

export class UpdateClinicStatusDto {
  @IsEnum(ClinicStatus)
  status!: ClinicStatus;
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

/** Every field is optional, but at least one must be sent. */
export class UpdateDoctorAvailabilityDto {
  @IsOptional()
  @IsDateString({ strict: true })
  availableDate?: string;

  @IsOptional()
  @Matches(TIME_PATTERN)
  startTime?: string;

  @IsOptional()
  @Matches(TIME_PATTERN)
  endTime?: string;

  // TAKEN is set by the booking flow only - never by an admin.
  @IsOptional()
  @IsIn([DoctorSlotStatus.AVAILABLE, DoctorSlotStatus.UNAVAILABLE])
  slotStatus?: DoctorSlotStatus.AVAILABLE | DoctorSlotStatus.UNAVAILABLE;
}

export class UpdateDoctorDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  specialization?: string;
}

export class UpdateEmergencyRequestDto {
  @IsOptional()
  @IsEnum(EmergencyRequestStatus)
  status?: EmergencyRequestStatus;

  @IsOptional()
  @IsUUID()
  assignedDoctorId?: string;
}

