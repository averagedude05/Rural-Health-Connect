import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
} from "@nestjs/common";

import { labrequestService } from "./lab-request.service";
import {
    CreateLabRequestDto,
    UpdateLabRequestDto
} from "./dto/lab-request.dto";

@Controller("lab-requests")
export class LabRequestController {

    constructor(private readonly labRequestService: labrequestService) {}

    @Get()
    async getAllLabRequests() {
        return await this.labRequestService.getAllRequests();
    }

    @Get(":id")
    async getLabRequest(@Param("id") id: string) {
        return await this.labRequestService.getLabRequest(id);
    }
    

    //needs update
    @Post()
    async createLabRequest(@Body() dto: CreateLabRequestDto) {
        return await this.labRequestService.createLabRequest(dto,"123");
    }

    @Patch(":id")
    async updateLabRequest(@Param("id") id: string, @Body() dto: UpdateLabRequestDto
    ) {
        return await this.labRequestService.updateLabRequest(id, dto);
    }

    @Delete(":id")
    async deleteLabRequest(@Param("id") id: string) {
        return await this.labRequestService.deleteRequest(id);
    }
}