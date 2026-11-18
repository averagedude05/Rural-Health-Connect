import { Body, Controller, Post } from "@nestjs/common";
import { AdminLoginDto } from "./dto/admin-login.dto";
import { DoctorRegisterDto } from "./dto/doctor-register.dto";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("admin/login")
  adminLogin(@Body() dto: AdminLoginDto) {
    return this.authService.adminLogin(dto);
  }

  @Post("doctor/register")
  doctorRegister(@Body() dto: DoctorRegisterDto) {
    return this.authService.doctorRegister(dto);
  }

  @Post("doctor/login")
  doctorLogin(@Body() dto: AdminLoginDto) {
    return this.authService.doctorLogin(dto);
  }

  @Post("technician/login")
  technicianLogin(@Body() dto: AdminLoginDto) {
    return this.authService.technicianLogin(dto);
  }
}
