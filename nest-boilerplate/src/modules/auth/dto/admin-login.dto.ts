import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class AdminLoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
