import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from "@nestjs/common";
import { MedicalRecordService } from "./medical-record.service";
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from "./dto/medical-record.dto";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";
import { RolesGuard } from "@/common/guard/roles.guard";
import { JwtGuard } from "@/common/guard/jwt.guard";

@Controller("medical-records")
export class MedicalRecordController {
    constructor(private readonly medicalRecordService: MedicalRecordService) {}

    @Get()
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.CLINIC_ADMIN, Role.DOCTOR)
    async getAllRecords() {
        return await this.medicalRecordService.getAllRecords();
    }
    
    @UseGuards(JwtGuard, RolesGuard)
    @Roles( Role.DOCTOR )
    @Get(":id")
    async getRecord(@Param("id") id: string) {
        return await this.medicalRecordService.getRecord(id);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.DOCTOR)
    @Post()
    async createRecord(@Body() dto: CreateMedicalRecordDto) {
        return await this.medicalRecordService.createRecord(dto);
    }

    @Patch(":id")
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.DOCTOR)
    async updateRecord(@Param("id") id: string, @Body() dto: UpdateMedicalRecordDto) {
        return await this.medicalRecordService.updateRecord(id, dto);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.CLINIC_ADMIN)
    @Delete(":id")
    async deleteRecord(@Param("id") id: string) {
        return await this.medicalRecordService.deleteRecord(id);
    }
}
