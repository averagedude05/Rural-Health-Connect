import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccessModule } from "@/modules/access/access.module";
import { User } from "@/src/modules/users/entities/user.entity";
import { AdminUsersGuard } from "@/src/modules/users/admin-users.guard";
import { UsersController } from "@/src/modules/users/users.controller";
import { UsersService } from "@/src/modules/users/users.service";

@Module({
  imports: [AccessModule, TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [AdminUsersGuard, UsersService],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
