
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from "@nestjs/common";
import { Request } from "express";
import { DoctorAuthGuard } from "@/modules/auth/guards/doctor-auth.guard";
import { CreatePrescriptionDto } from "../dto/create-prescription.dto";
import { PrescriptionsService } from "../services/prescriptions.service";

interface DoctorRequest extends Request {
  user: {
    sub: string;
    role: string;
  };
}

@Controller("doctor-dashboard/prescriptions")
@UseGuards(DoctorAuthGuard)
export class PrescriptionsController {
  constructor(
    private readonly prescriptionsService: PrescriptionsService,
  ) {}

  @Post()
  create(
    @Req() req: DoctorRequest,
    @Body() dto: CreatePrescriptionDto,
  ) {
    return this.prescriptionsService.create(req.user.sub, dto);
  }

  @Get()
  findMyPrescriptions(@Req() req: DoctorRequest) {
    return this.prescriptionsService.findMyPrescriptions(req.user.sub);
  }

  @Get(":id")
  findOne(
    @Req() req: DoctorRequest,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.prescriptionsService.findOne(req.user.sub, id);
  }
}
