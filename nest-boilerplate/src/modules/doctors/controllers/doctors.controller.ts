import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { CreateDoctorDto } from "../dto/create-doctor.dto";
import { FindDoctorsQueryDto } from "../dto/find-doctors.query.dto";
import { UpdateDoctorDto } from "../dto/update-doctor.dto";
import { VerifyDoctorDto } from "../dto/verify-doctor.dto";
import { DoctorsService } from "../services/doctors.service";

@Controller("doctors")
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  create(@Body() dto: CreateDoctorDto) {
    return this.doctorsService.create(dto);
  }

  @Get()
  findAll(@Query() query: FindDoctorsQueryDto) {
    return this.doctorsService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.doctorsService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateDoctorDto,
  ) {
    return this.doctorsService.update(id, dto);
  }

  @Patch(":id/verification")
  updateVerification(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: VerifyDoctorDto,
  ) {
    return this.doctorsService.updateVerification(id, dto);
  }

  @Delete(":id")
  deactivate(@Param("id", ParseIntPipe) id: number) {
    return this.doctorsService.deactivate(id);
  }
}
