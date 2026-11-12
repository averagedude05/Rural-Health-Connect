import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { CreateDoctorAvailabilityDto } from "../dto/create-doctor-availability.dto";
import { UpdateDoctorAvailabilityDto } from "../dto/update-doctor-availability.dto";
import { DoctorAvailabilityService } from "../services/doctor-availability.service";

@Controller()
export class DoctorAvailabilityController {
  constructor(
    private readonly availabilityService: DoctorAvailabilityService,
  ) {}

  @Get("doctors/:doctorId/availability")
  findForDoctor(@Param("doctorId", ParseIntPipe) doctorId: number) {
    return this.availabilityService.findForDoctor(doctorId);
  }

  @Post("doctors/:doctorId/availability")
  create(
    @Param("doctorId", ParseIntPipe) doctorId: number,
    @Body() dto: CreateDoctorAvailabilityDto,
  ) {
    return this.availabilityService.create(doctorId, dto);
  }

  @Patch("doctor-availability/:id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateDoctorAvailabilityDto,
  ) {
    return this.availabilityService.update(id, dto);
  }

  @Delete("doctor-availability/:id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.availabilityService.remove(id);
  }
}
