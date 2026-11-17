
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { DataSource } from "typeorm";
import * as argon2 from "argon2";
import { AdminLoginDto } from "./dto/admin-login.dto";
import { DoctorRegisterDto } from "./dto/doctor-register.dto";

interface AdminAccount {
  id: string;
  phone: string;
  role: string;
  password_hash: string;
  account_status: string;
  name: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  async adminLogin(dto: AdminLoginDto) {
    const accounts = (await this.dataSource.query(
      `SELECT "users"."id", "users"."phone", "users"."role",
              "users"."password_hash", "users"."account_status",
              "admin_profiles"."name"
       FROM "users"
       INNER JOIN "admin_profiles" ON "admin_profiles"."user_id" = "users"."id"
       WHERE "users"."phone" = $1`,
      [dto.phone.trim()],
    )) as AdminAccount[];

    const account = accounts[0];

    if (
      !account ||
      account.role.toUpperCase() !== "ADMIN" ||
      account.account_status !== "ACTIVE"
    ) {
      throw new UnauthorizedException("Invalid phone number or password");
    }

    let passwordMatches = false;

    try {
      passwordMatches = await argon2.verify(
        account.password_hash,
        dto.password,
      );
    } catch {
      passwordMatches = false;
    }

    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid phone number or password");
    }

    const accessToken = await this.jwtService.signAsync({
      sub: account.id,
      role: account.role.toUpperCase(),
    });

    return {
      accessToken,
      tokenType: "Bearer",
      admin: {
        id: account.id,
        name: account.name,
        phone: account.phone,
        role: account.role,
      },
    };
  }

  async doctorRegister(dto: DoctorRegisterDto) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const clinics = (await manager.query(
          `SELECT "id" FROM "clinics" WHERE "id" = $1`,
          [dto.clinicId],
        )) as Array<{ id: string }>;

        if (clinics.length === 0) {
          throw new NotFoundException("Clinic not found");
        }

        const existingUsers = await manager.query(
          `SELECT "id" FROM "users" WHERE "phone" = $1`,
          [dto.phone.trim()],
        );

        if (existingUsers.length > 0) {
          throw new ConflictException(
            "This phone number is already registered",
          );
        }

        const passwordHash = await argon2.hash(dto.password);

        const createdUsers = (await manager.query(
          `INSERT INTO "users" ("role", "phone", "password_hash", "account_status")
           VALUES ('DOCTOR', $1, $2, 'PENDING')
           RETURNING "id"`,
          [dto.phone.trim(), passwordHash],
        )) as Array<{ id: string }>;

        const createdProfiles = (await manager.query(
          `INSERT INTO "doctor_profiles" ("user_id", "clinic_id", "name", "specialization")
           VALUES ($1, $2, $3, $4)
           RETURNING "id"`,
          [
            createdUsers[0].id,
            dto.clinicId,
            dto.fullName.trim(),
            dto.specialization.trim(),
          ],
        )) as Array<{ id: string }>;

        return {
          message: "Doctor registration submitted for admin approval",
          doctorId: createdProfiles[0].id,
          accountStatus: "PENDING",
        };
      });
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      const databaseError = error as { driverError?: { code?: string } };

      if (databaseError.driverError?.code === "23505") {
        throw new ConflictException("This phone number is already registered");
      }

      throw error;
    }
  }

  async doctorLogin(dto: AdminLoginDto) {
    const accounts = (await this.dataSource.query(
      `SELECT "users"."id", "users"."phone", "users"."role",
              "users"."password_hash", "users"."account_status"
       FROM "users"
       INNER JOIN "doctor_profiles" ON "doctor_profiles"."user_id" = "users"."id"
       WHERE "users"."phone" = $1`,
      [dto.phone.trim()],
    )) as Array<{
      id: string;
      phone: string;
      role: string;
      password_hash: string;
      account_status: string;
    }>;

    const account = accounts[0];

    if (
      !account ||
      account.role.toUpperCase() !== "DOCTOR" ||
      account.account_status !== "ACTIVE"
    ) {
      throw new UnauthorizedException(
        "Invalid credentials or doctor account is awaiting approval",
      );
    }

    let passwordMatches = false;

    try {
      passwordMatches = await argon2.verify(
        account.password_hash,
        dto.password,
      );
    } catch {
      passwordMatches = false;
    }

    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid phone number or password");
    }

    const accessToken = await this.jwtService.signAsync({
      sub: account.id,
      role: "DOCTOR",
    });

    return { accessToken, tokenType: "Bearer" };
  }
}
