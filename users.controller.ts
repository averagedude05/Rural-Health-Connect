import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { ValidationPipe } from "@/common/pipes/validation.pipe";
import { CreatePatientAccountDto } from "./dto/user.dto";
import { ListUsersQueryDto } from "./dto/user.dto";
import { UpdateUserStatusDto } from "./dto/user.dto";
import { UpdateUserDto } from "./dto/user.dto";
import { UsersService } from "./users.service";

// Authentication (JwtGuard) + authorization (RolesGuard) for the whole controller.
@ApiTags("Users")
@ApiBearerAuth()
@Controller("users")
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: "List accounts (filter: role, accountStatus, search)",
  })
  getUsers(@Query(new ValidationPipe()) query: ListUsersQueryDto) {
    return this.usersService.getUsers(query);
  }

  @Get(":id")
  getUser(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.usersService.findById(id);
  }

  @Post("patients")
  createPatient(@Body(new ValidationPipe()) dto: CreatePatientAccountDto) {
    return this.usersService.createPatient(dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Change phone number and/or reset password" })
  updateUser(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body(new ValidationPipe()) dto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, dto);
  }

  @Patch(":id/status")
  updateStatus(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body(new ValidationPipe()) dto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateStatus(id, dto.accountStatus);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft delete: suspends the account" })
  deleteUser(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.usersService.deleteUser(id);
  }
}

