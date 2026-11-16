
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
  ArrayMinSize,
} from "class-validator";
import { Type } from "class-transformer";

export class PrescriptionMedicineDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  dosage!: string;

  @IsString()
  @IsNotEmpty()
  frequency!: string;

  @IsString()
  @IsNotEmpty()
  duration!: string;

  @IsOptional()
  @IsString()
  instructions?: string;
}

export class CreatePrescriptionDto {
  @IsUUID()
  patientId!: string;

  @IsString()
  @IsNotEmpty()
  diagnosis!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PrescriptionMedicineDto)
  medicines!: PrescriptionMedicineDto[];

  @IsOptional()
  @IsString()
  advice?: string;
}
