import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Length, Matches, Min } from "class-validator";

export class CreateTechnicianDto{
    @IsNotEmpty()
    @IsString()
    name:string="";

    @IsEmail()
    @IsNotEmpty()
    email!:string;

    @IsInt()
    @Min(18)
    age!:number;

    @IsString()
    @Matches(/^01/,{"message":"phone number must be valid"})
    @Length(11,11)
    phone!:string;

    @IsOptional()
    @IsString()
    @Length(10,)
    address!:string;

    @IsNotEmpty()
    @IsString()
    clinic_id!:string

}

export class UpdateTechnicianDto{
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    name?:string;

    @IsOptional()
    @IsEmail()
    @IsNotEmpty()
    email!:string;

    @IsOptional()
    @IsInt()
    @Min(18)
    age!:number;
    
    @IsOptional()
    @IsString()
    @Matches(/^01/,{"message":"phone number must be valid"})
    @Length(11,11)
    phone!:string;

    @IsOptional()
    @IsString()
    @Length(10,)
    address!:string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    clinic_id!:string


}