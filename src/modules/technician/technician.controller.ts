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
import { TechnicianService } from "./technician.service";
import { CreateTechnicianDto, UpdateTechnicianDto } from "./dto/technician.dto";
import { Roles } from "@/src/common/decorators";
import { Role } from "@/src/common/enums/role.enum";
import { RolesGuard } from "@/src/common/guard/roles.guard";
import { JwtGuard } from "@/src/common/guard/jwt.guard";

@Controller("technicians") 
export class TechnicianController {
  constructor(private readonly TechnicianService: TechnicianService) {}
  
  
  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.CLINIC_ADMIN)
  async getAllTechnician() {
    return await this.TechnicianService.getAllTechnician();
  }

  @Get(":id")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.CLINIC_ADMIN)
  async getTechnician(@Param("id") id:string) {
    return await this.TechnicianService.getTechnician(id);
  }

  @Post(":userId")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.CLINIC_ADMIN)
  async createTechnician(@Param("userId") userId:string,@Body() dto: CreateTechnicianDto) {
    return await this.TechnicianService.createTechnician(dto, userId);
  }

  @Patch(":id")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.CLINIC_ADMIN)
  async updateTechnician(@Param("id") id:string,@Body() dto: UpdateTechnicianDto,) {
    return await this.TechnicianService.updateTechnician(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.CLINIC_ADMIN)
  async deleteTechnician(@Param("id") id:string) {
    return await this.TechnicianService.deleteTechnician(id);
  }
}