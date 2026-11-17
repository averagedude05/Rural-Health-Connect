import { IsDateString, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateMedicalRecordDto {
    @IsNotEmpty()
    @IsString()
    patient_id!:string;

    @IsNotEmpty()
    @IsString()
    doctor_id!: string;

    @IsNotEmpty()
    @IsString()
    clinic_id!: string;

    @IsNotEmpty()
    @IsString()
    visit_date!: string;

    @IsNotEmpty()
    @IsString()
    notes!: string;

    @IsOptional()
    @IsString()
    access_status?: string;

    @IsNotEmpty()
    @IsObject()
    medicine_details!: Record<string,string>;

    @IsNotEmpty()
    @IsString()
    prescription_instructions!: string;

}

export class UpdateMedicalRecordDto {
   
    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsString()
    access_status?: string;

    @IsOptional()
    @IsObject()
    medicine_details!: Record<string,string>;

    @IsOptional()
    @IsString()
    prescription_instructions?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    visit_date!: string;

}