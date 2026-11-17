
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";

export class CreateLabRequestDto {
  @IsUUID()
  patientId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  testName!: string;
}
