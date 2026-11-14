import { IsNotEmpty, IsString, IsOptional, IsIn } from "class-validator";

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
    @IsIn(["REQUESTED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    @IsNotEmpty()
    status?: string;
}
