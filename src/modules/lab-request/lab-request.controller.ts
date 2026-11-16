import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from "@nestjs/common";
import { LabRequestService } from "./lab-request.service";
import {CreateLabRequestDto,UpdateLabRequestDto} from "./dto/lab-request.dto";
import { RolesGuard } from "@/src/common/guard/roles.guard";
import { JwtGuard } from "@/src/common/guard/jwt.guard";
import { Role } from "@/src/common/enums/role.enum"; 
import { Roles } from "@/src/common/decorators";
import { Request } from "express";

@Controller("lab-requests")
export class LabRequestController {
    constructor(private readonly LabRequestService: LabRequestService) {}

    @Get()
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.CLINIC_ADMIN, Role.DOCTOR, Role.LAB_TECHNICIAN)
    async getAllLabRequests() {
        return await this.LabRequestService.getAllRequests();
    }

    @Get(":id")
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.CLINIC_ADMIN, Role.DOCTOR, Role.LAB_TECHNICIAN)
    async getLabRequest(@Param("id") id: string) {
        return await this.LabRequestService.getLabRequest(id);
    }
    

    @Post(":doctorId")
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.DOCTOR)
    async createLabRequest(@Param("doctorId") doctorId:string,@Body() dto: CreateLabRequestDto) {
        return await this.LabRequestService.createLabRequest(dto,doctorId);
    }

    @Patch(":id")
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.DOCTOR)
    async updateLabRequest(@Param("id") id: string, @Body() dto: UpdateLabRequestDto,@Req() req:any) {//@Req() req
        return await this.LabRequestService.updateLabRequest(id, dto,req.user.id, req.user.roles);
    }

    @Delete(":id")
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.CLINIC_ADMIN)
    async deleteLabRequest(@Param("id") id: string) {
        return await this.LabRequestService.deleteRequest(id);
    }
}