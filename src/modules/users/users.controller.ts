import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { AccessTokenGuard } from "@/modules/access/access-token.guard";
import { CreateUserDto, UpdateUserDto, UserResponseDto } from "./dto/user.dto";
import { AdminUsersGuard } from "./admin-users.guard";
import { UsersService } from "./users.service";
import { User } from "./entities/user.entity";

interface AuthenticatedRequest extends Request {
  user: { sub: string; role: string };
}

@Controller("users")
@UseGuards(AccessTokenGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AdminUsersGuard)
  async getAllUsers(): Promise<UserResponseDto[]> {
    return (await this.usersService.findAll()).map((user) => this.toResponse(user));
  }

  @Get("me")
  async getCurrentUser(
    @Req() request: AuthenticatedRequest,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findById(request.user.sub);
    if (!user) throw new NotFoundException("User not found");
    return this.toResponse(user);
  }

  @Get(":id")
  @UseGuards(AdminUsersGuard)
  async getUserById(@Param("id") id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException("User not found");
    return this.toResponse(user);
  }

  @Post()
  @UseGuards(AdminUsersGuard)
  async createUser(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.toResponse(await this.usersService.create(dto));
  }

  @Patch(":id")
  @UseGuards(AdminUsersGuard)
  async updateUser(
    @Param("id") id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.toResponse(await this.usersService.update(id, dto));
  }

  @Delete(":id")
  @UseGuards(AdminUsersGuard)
  deleteUser(@Param("id") id: string): Promise<{ message: string }> {
    return this.usersService.remove(id);
  }

  private toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      role: user.role,
      phone: user.phone,
      accountStatus: user.accountStatus,
      createdAt: user.createdAt,
    };
  }
}


