import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
} from "@nestjs/common";

import { LabRequestService } from "./lab-request.service";
import {CreateLabRequestDto,UpdateLabRequestDto} from "./dto/lab-request.dto";

@Controller("lab-requests")
export class LabRequestController {
    constructor(private readonly LabRequestService: LabRequestService) {}

    @Get()
    async getAllLabRequests() {
        return await this.LabRequestService.getAllRequests();
    }

    @Get(":id")
    async getLabRequest(@Param("id") id: string) {
        return await this.LabRequestService.getLabRequest(id);
    }
    

    //needs update
    @Post(":doctorId")
    async createLabRequest(@Param("doctorId") doctorId:string,@Body() dto: CreateLabRequestDto) {
        return await this.LabRequestService.createLabRequest(dto,doctorId);
    }

    @Patch(":id")
    async updateLabRequest(@Param("id") id: string, @Body() dto: UpdateLabRequestDto
    ) {
        return await this.LabRequestService.updateLabRequest(id, dto);
    }

    @Delete(":id")
    async deleteLabRequest(@Param("id") id: string) {
        return await this.LabRequestService.deleteRequest(id);
    }
}