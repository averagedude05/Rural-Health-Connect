import { IsEnum } from "class-validator";
import { DoctorVerificationStatus } from "../enums/doctor-verification-status.enum";

export class VerifyDoctorDto {
  @IsEnum(DoctorVerificationStatus)
  verificationStatus!: DoctorVerificationStatus;
}
