import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as argon2 from "argon2";
import { Repository } from "typeorm";
import { CreateUserDto, UpdateUserDto } from "@/src/modules/users/dto/user.dto";
import { User } from "@/src/modules/users/entities/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find({ order: { createdAt: "DESC" } });
  }

  findById(userId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id: userId } });
  }

  findByPhone(phone: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { phone } });
  }

  findByPhoneWithPassword(phone: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder("user")
      .addSelect("user.passwordHash")
      .where("user.phone = :phone", { phone })
      .getOne();
  }

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create({
      phone: dto.phone.trim(),
      passwordHash: await argon2.hash(dto.password),
      role: dto.role,
      accountStatus: dto.accountStatus ?? "PENDING",
    });

    try {
      const created = await this.usersRepository.save(user);
      const safeUser = await this.findById(created.id);
      if (!safeUser) throw new NotFoundException("Created user not found");
      return safeUser;
    } catch (error) {
      const databaseError = error as { driverError?: { code?: string } };
      if (databaseError.driverError?.code === "23505") {
        throw new ConflictException("This phone number is already registered");
      }
      throw error;
    }
  }

  async update(userId: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException("User not found");

    if (dto.phone !== undefined) user.phone = dto.phone.trim();
    if (dto.password !== undefined) {
      user.passwordHash = await argon2.hash(dto.password);
    }
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.accountStatus !== undefined) user.accountStatus = dto.accountStatus;

    try {
      await this.usersRepository.save(user);
    } catch (error) {
      const databaseError = error as { driverError?: { code?: string } };
      if (databaseError.driverError?.code === "23505") {
        throw new ConflictException("This phone number is already registered");
      }
      throw error;
    }

    const safeUser = await this.findById(userId);
    if (!safeUser) throw new NotFoundException("User not found");
    return safeUser;
  }

  async remove(userId: string): Promise<{ message: string }> {
    const result = await this.usersRepository.delete(userId);
    if (!result.affected) throw new NotFoundException("User not found");
    return { message: "User deleted successfully" };
  }
}


