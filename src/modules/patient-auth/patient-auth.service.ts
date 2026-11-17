import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { DataSource } from "typeorm";
import * as argon2 from "argon2";
import { RegisterPatientDto } from "./dto/register-patient.dto";
import { PatientLoginDto } from "./dto/patient-login.dto";

@Injectable()
export class PatientAuthService {
  constructor(private readonly dataSource: DataSource, private readonly jwtService: JwtService) {}

  async register(dto: RegisterPatientDto) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const passwordHash = await argon2.hash(dto.password);
        const users = await manager.query(
          `INSERT INTO "users" ("role", "phone", "password_hash", "account_status") VALUES ('PATIENT', $1, $2, 'ACTIVE') RETURNING "id", "phone", "role"`,
          [dto.phone.trim(), passwordHash],
        ) as Array<{ id: string; phone: string; role: string }>;
        const profiles = await manager.query(
          `INSERT INTO "patient_profiles" ("user_id", "name", "date_of_birth", "address", "emergency_contact") VALUES ($1, $2, $3, $4, $5) RETURNING "id", "name"`,
          [users[0].id, dto.name.trim(), dto.dateOfBirth ?? null, dto.address?.trim() ?? null, dto.emergencyContact?.trim() ?? null],
        ) as Array<{ id: string; name: string }>;
        const accessToken = await this.jwtService.signAsync({ sub: users[0].id, role: "PATIENT" });
        return { accessToken, tokenType: "Bearer", patient: { id: profiles[0].id, userId: users[0].id, name: profiles[0].name, phone: users[0].phone, role: users[0].role } };
      });
    } catch (error) {
      const databaseError = error as { driverError?: { code?: string } };
      if (databaseError.driverError?.code === "23505") throw new ConflictException("This phone number is already registered");
      throw error;
    }
  }

  async login(dto: PatientLoginDto) {
    const rows = await this.dataSource.query(
      `SELECT u."id", u."phone", u."role", u."password_hash", u."account_status", p."id" AS "profile_id", p."name" FROM "users" u INNER JOIN "patient_profiles" p ON p."user_id" = u."id" WHERE u."phone" = $1`,
      [dto.phone.trim()],
    ) as Array<{ id: string; phone: string; role: string; password_hash: string; account_status: string; profile_id: string; name: string }>;
    const account = rows[0];
    let valid = false;
    if (account && account.role.toUpperCase() === "PATIENT" && account.account_status === "ACTIVE") {
      try {
        valid = await argon2.verify(account.password_hash, dto.password);
      } catch {
        valid = false;
      }
    }
    if (!valid || !account) throw new UnauthorizedException("Invalid phone number or password");
    const accessToken = await this.jwtService.signAsync({ sub: account.id, role: "PATIENT" });
    return { accessToken, tokenType: "Bearer", patient: { id: account.profile_id, userId: account.id, name: account.name, phone: account.phone, role: "PATIENT" } };
  }
}
