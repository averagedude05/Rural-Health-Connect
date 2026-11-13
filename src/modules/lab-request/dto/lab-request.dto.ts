import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class CreateLabRequestDto {
    @IsNotEmpty()
    @IsString()
    patient_id: string="";

    @IsNotEmpty()
    @IsString()
    test_name: string = "";
}

export class UpdateLabRequestDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    technician_id?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    status?: string;
}
