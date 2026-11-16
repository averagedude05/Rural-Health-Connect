
import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { DoctorAuthGuard } from "@/modules/auth/guards/doctor-auth.guard";
import { UpdateDoctorDto } from "../dto/update-doctor.dto";
import { DoctorsService } from "../services/doctors.service";

interface DoctorRequest extends Request {
  user: {
    sub: string;
    role: string;
  };
}

@Controller("doctor-dashboard")
@UseGuards(DoctorAuthGuard)
export class DoctorDashboardController {
  constructor(private readonly doctorsService: DoctorsService) {}

  // Get Doctor's Own Profile
  @Get("profile")
  async getMyProfile(@Req() req: DoctorRequest) {
    const profile = await this.doctorsService.findMyProfile(req.user.sub);

    return {
      section: "My Profile",
      profile,
    };
  }

  // Update Doctor's Own Profile
  @Patch("profile")
  async updateMyProfile(
    @Req() req: DoctorRequest,
    @Body() dto: UpdateDoctorDto,
  ) {
    const profile = await this.doctorsService.updateMyProfile(
      req.user.sub,
      dto,
    );

    return {
      section: "My Profile",
      message: "Profile updated successfully",
      profile,
    };
  }
}
