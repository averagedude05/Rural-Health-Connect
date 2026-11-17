import { IsIn } from "class-validator";

export class UpdateDoctorAccountStatusDto {
  @IsIn(["PENDING", "ACTIVE", "SUSPENDED"])
  accountStatus!: "PENDING" | "ACTIVE" | "SUSPENDED";
}
