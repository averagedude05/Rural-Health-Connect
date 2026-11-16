
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";

import { DoctorAuthGuard } from "@/modules/auth/guards/doctor-auth.guard";
import { CreateDoctorAvailabilityDto } from "../dto/create-doctor-availability.dto";
import { UpdateDoctorAvailabilityDto } from "../dto/update-doctor-availability.dto";
import { DoctorAvailabilityService } from "../services/doctor-availability.service";

interface DoctorRequest extends Request {
  user: {
    sub: string;
    role: string;
  };
}

@Controller()
export class DoctorAvailabilityController {
  constructor(
    private readonly availabilityService: DoctorAvailabilityService,
  ) {}

  // Public: View a doctor's availability
  @Get("doctors/:doctorId/availability")
  findForDoctor(
    @Param("doctorId", new ParseUUIDPipe()) doctorId: string,
  ) {
    return this.availabilityService.findForDoctor(doctorId);
  }

  // Doctor: Create own availability
  @Post("doctor-dashboard/availability")
  @UseGuards(DoctorAuthGuard)
  create(
    @Req() req: DoctorRequest,
    @Body() dto: CreateDoctorAvailabilityDto,
  ) {
    return this.availabilityService.create(req.user.sub, dto);
  }

  // Doctor: Update own availability
  @Patch("doctor-dashboard/availability/:id")
  @UseGuards(DoctorAuthGuard)
  update(
    @Req() req: DoctorRequest,
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateDoctorAvailabilityDto,
  ) {
    return this.availabilityService.update(req.user.sub, id, dto);
  }

  // Doctor: Delete own availability
  @Delete("doctor-dashboard/availability/:id")
  @UseGuards(DoctorAuthGuard)
  remove(
    @Req() req: DoctorRequest,
    @Param("id", new ParseUUIDPipe()) id: string,
  ) {
    return this.availabilityService.remove(req.user.sub, id);
  }
}
