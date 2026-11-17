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
import { RolesGuard } from "@/common/guard/roles.guard";
import { JwtGuard } from "@/src/common/guard/jwt.guard";
import { Role } from "@/common/enums/role.enum"; 
import { Roles } from "@/common/decorators/roles.decorator";
import { Request } from "express";

@Controller("lab-requests")
export class LabRequestController {
    constructor(private readonly LabRequestService: LabRequestService) {}

    @Get()
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.DOCTOR, Role.LAB_TECHNICIAN)
    async getAllLabRequests() {
        return await this.LabRequestService.getAllRequests();
    }

    @Get(":id")
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.DOCTOR, Role.LAB_TECHNICIAN)
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
    @Roles(Role.DOCTOR, Role.ADMIN, Role.LAB_TECHNICIAN)
    async updateLabRequest(@Param("id") id: string, @Body() dto: UpdateLabRequestDto,@Req() req:any) {//@Req() req
        return await this.LabRequestService.updateLabRequest(id, dto,req.user.id, req.user.roles);
    }

    @Delete(":id")
    async deleteLabRequest(@Param("id") id: string) {
        return await this.LabRequestService.deleteRequest(id);
    }
}
