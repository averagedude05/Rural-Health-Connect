
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AdminAuthGuard } from "@/modules/auth/guards/admin-auth.guard";
import { CreateDoctorDto } from "../dto/create-doctor.dto";
import { FindDoctorsQueryDto } from "../dto/find-doctors.query.dto";
import { UpdateDoctorAccountStatusDto } from "../dto/update-doctor-account-status.dto";
import { UpdateDoctorDto } from "../dto/update-doctor.dto";
import { DoctorsService } from "../services/doctors.service";

@Controller("doctors")
@UseGuards(AdminAuthGuard)
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
  findOne(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.doctorsService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateDoctorDto,
  ) {
    return this.doctorsService.update(id, dto);
  }

  @Patch(":id/account-status")
  updateAccountStatus(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateDoctorAccountStatusDto,
  ) {
    return this.doctorsService.updateAccountStatus(id, dto);
  }

  @Delete(":id")
  deactivate(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.doctorsService.deactivate(id);
  }
}
