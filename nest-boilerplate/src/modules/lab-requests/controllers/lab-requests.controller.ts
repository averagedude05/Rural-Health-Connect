
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
import { CreateLabRequestDto } from "../dto/create-lab-request.dto";
import { LabRequestsService } from "../services/lab-requests.service";

interface DoctorRequest extends Request {
  user: {
    sub: string;
    role: string;
  };
}

@Controller("doctor-dashboard/lab-requests")
@UseGuards(DoctorAuthGuard)
export class LabRequestsController {
  constructor(
    private readonly labRequestsService: LabRequestsService,
  ) {}

  @Post()
  create(
    @Req() req: DoctorRequest,
    @Body() dto: CreateLabRequestDto,
  ) {
    return this.labRequestsService.create(req.user.sub, dto);
  }

  @Get()
  findMyRequests(@Req() req: DoctorRequest) {
    return this.labRequestsService.findMyRequests(req.user.sub);
  }

  @Get(":id")
  findOne(
    @Req() req: DoctorRequest,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.labRequestsService.findOne(req.user.sub, id);
  }
}
