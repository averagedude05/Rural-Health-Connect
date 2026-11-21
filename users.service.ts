import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as argon2 from "argon2";
import {
  DataSource,
  EntityManager,
  FindOptionsWhere,
  ILike,
  Repository,
} from "typeorm";
import { AccountStatus } from "@/common/enums/account-status.enum";
import { Role } from "@/common/enums/role.enum";
import {
  escapeLikePattern,
  isUniqueViolation,
} from "@/common/helpers/database-error.helper";
import { PatientsService } from "@/modules/patients/patients.service";
import { CreatePatientAccountDto } from "./dto/user.dto";
import { ListUsersQueryDto } from "./dto/user.dto";
import { UpdateUserDto } from "./dto/user.dto";
import { User } from "./entities/user.entity";

const PHONE_TAKEN = "Phone number is already registered";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly patientsService: PatientsService,
  ) {}

  // ---------------------------------------------------------------- READ

  getUsers(query: ListUsersQueryDto = new ListUsersQueryDto()) {
    const where: FindOptionsWhere<User> = {};
    if (query.role) where.role = query.role;
    if (query.accountStatus) where.accountStatus = query.accountStatus;
    if (query.search) {
      where.phone = ILike(`%${escapeLikePattern(query.search)}%`);
    }
    return this.usersRepository.find({
      where,
      order: { createdAt: "DESC" },
      take: query.limit,
      skip: query.offset,
    });
  }

  /** Same as findOneById but throws 404 - use it behind an endpoint. */
  async findById(id: string): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  findOneById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  findByPhone(phone: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { phone } });
  }

  // password_hash is `select: false`, so it has to be asked for explicitly.
  findByPhoneWithPassword(phone: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder("user")
      .addSelect("user.passwordHash")
      .where("user.phone = :phone", { phone })
      .getOne();
  }

  findByIdWithPassword(id: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder("user")
      .addSelect("user.passwordHash")
      .where("user.id = :id", { id })
      .getOne();
  }

  // -------------------------------------------------------------- CREATE

  /**
   * Creates a login account (users row). Reused by every feature that needs an
   * account - patient registration, "admin adds a doctor", ... - so hashing and
   * the duplicate-phone rule live in exactly one place.
   * Pass `manager` to run inside a caller's transaction.
   */
  async createAccount(
    input: { role: string; phone: string; password: string },
    manager?: EntityManager,
  ): Promise<User> {
    const passwordHash = await argon2.hash(input.password, {
      type: argon2.argon2id,
    });
    const users = manager ? manager.getRepository(User) : this.usersRepository;

    if (await users.exists({ where: { phone: input.phone } })) {
      throw new ConflictException(PHONE_TAKEN);
    }

    try {
      return await users.save(
        users.create({
          role: input.role,
          phone: input.phone,
          passwordHash,
          accountStatus: AccountStatus.ACTIVE,
        }),
      );
    } catch (error) {
      // two requests with the same phone racing past the check above
      if (isUniqueViolation(error)) throw new ConflictException(PHONE_TAKEN);
      throw error;
    }
  }

  /** users row + patient_profiles row, all or nothing. */
  createPatient(dto: CreatePatientAccountDto) {
    return this.dataSource.transaction(async (manager) => {
      const user = await this.createAccount(
        { role: Role.PATIENT, phone: dto.phone, password: dto.password },
        manager,
      );
      const profile = await this.patientsService.createForUser(
        user.id,
        {
          name: dto.name,
          dateOfBirth: dto.dateOfBirth ?? null,
          address: dto.address ?? null,
          emergencyContact: dto.emergencyContact ?? null,
        },
        manager,
      );

      // never return passwordHash
      return {
        user: {
          id: user.id,
          role: user.role,
          phone: user.phone,
          accountStatus: user.accountStatus,
          createdAt: user.createdAt,
        },
        patientProfile: {
          id: profile.id,
          name: profile.name,
          dateOfBirth: profile.dateOfBirth,
          address: profile.address,
          emergencyContact: profile.emergencyContact,
        },
      };
    });
  }

  // -------------------------------------------------------------- UPDATE

  async updateUser(id: string, dto: UpdateUserDto) {
    if (dto.phone === undefined && dto.password === undefined) {
      throw new BadRequestException("Send a phone and/or a password to update");
    }

    const user = await this.findById(id);

    if (dto.phone !== undefined && dto.phone !== user.phone) {
      if (await this.usersRepository.exists({ where: { phone: dto.phone } })) {
        throw new ConflictException(PHONE_TAKEN);
      }
      user.phone = dto.phone;
    }
    if (dto.password !== undefined) {
      user.passwordHash = await argon2.hash(dto.password, {
        type: argon2.argon2id,
      });
    }

    try {
      await this.usersRepository.save(user);
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException(PHONE_TAKEN);
      throw error;
    }

    return {
      id: user.id,
      role: user.role,
      phone: user.phone,
      accountStatus: user.accountStatus,
    };
  }

  async updateStatus(id: string, accountStatus: AccountStatus) {
    const user = await this.findById(id);
    if (user.role === Role.ADMIN && accountStatus !== AccountStatus.ACTIVE) {
      throw new BadRequestException(
        "The system administrator cannot be deactivated here",
      );
    }
    user.accountStatus = accountStatus;
    const saved = await this.usersRepository.save(user);
    return saved;
  }

  // -------------------------------------------------------------- DELETE

  /**
   * "Delete" is a soft delete (account is suspended): users are referenced by
   * profiles, appointments and medical records, which must be kept.
   */
  deleteUser(id: string) {
    return this.updateStatus(id, AccountStatus.SUSPENDED);
  }
}




