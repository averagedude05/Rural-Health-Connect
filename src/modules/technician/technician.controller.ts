import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { TechnicianService } from "./technician.service";
import { CreateTechnicianDto, UpdateTechnicianDto } from "./dto/technician.dto";

@Controller("technicians") 
export class TechnicianController {
  constructor(private readonly TechnicianService: TechnicianService) {}

  @Get()
  async getAllTechnician() {
    return await this.TechnicianService.getAllTechnician();
  }

  @Get(":id")
  async getTechnician(@Param("id") id: string) {
    return await this.TechnicianService.getTechnician(id);
  }

  @Post(":userId")
  async createTechnician(@Param("userId") userId: string,@Body() dto: CreateTechnicianDto) {
    return await this.TechnicianService.createTechnician(dto, userId);
  }

  @Patch(":id")
  async updateTechnician(@Param("id") id: string,@Body() dto: UpdateTechnicianDto,) {
    return await this.TechnicianService.updateTechnician(id, dto);
  }

  @Delete(":id")
  async deleteTechnician(@Param("id") id: string) {
    return await this.TechnicianService.deleteTechnician(id);
  }
}