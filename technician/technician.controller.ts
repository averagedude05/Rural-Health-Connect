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
import { TechnicianService } from "./technician.service";
import { CreateTechnicianDto, UpdateTechnicianDto } from "./dto/technician.dto";
import { AdminAuthGuard } from "@/modules/auth/guards/admin-auth.guard";
import { LabRequestService } from "../lab-request/lab-request.service";
import { Roles } from "@/src/common/decorators/roles.decorator";
import { Role } from "@/src/common/enums/role.enum";
import { JwtGuard } from "@/src/common/guard/jwt.guard";
import { RolesGuard } from "@/src/common/guard/roles.guard";
import { UpdateLabRequestDto } from "../lab-request/dto/lab-request.dto";
import { CreateUserDto } from "@/modules/users/dto/user.dto";

@Controller("technicians") 
export class TechnicianController {
  constructor(private readonly TechnicianService: TechnicianService,private readonly LabRequestService: LabRequestService) {}
  @Get("assigned")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.LAB_TECHNICIAN)
  async getAssignedRequests(@Req() req: any) {
    return await this.LabRequestService.getAssinedRequests(req.user.id);
  } 
  
  
  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAllTechnician() {
    return await this.TechnicianService.getAllTechnician();
  }
  
  
  
  @Get(":id")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getTechnician(@Param("id") id:string) {
    return await this.TechnicianService.getTechnician(id);
  }


  @Post(":userId")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createTechnician(@Param("userId") userId:string,@Body() dto: CreateTechnicianDto) {
    return await this.TechnicianService.createTechnician(dto, userId);
  }

  @Patch(":id")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateTechnician(@Param("id") id:string,@Body() dto: UpdateTechnicianDto,) {
    return await this.TechnicianService.updateTechnician(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteTechnician(@Param("id") id:string) {
    return await this.TechnicianService.deleteTechnician(id);
  }
  

  @Patch("assigned/:id")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.LAB_TECHNICIAN)
  async updateAssigned(@Req() req: any, @Param("id") id: string, @Body() dto: UpdateLabRequestDto) {
    return await this.LabRequestService.updateAssigned(req.user.id, id, dto);
  }


  
}
