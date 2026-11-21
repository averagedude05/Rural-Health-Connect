import * as argon2 from "argon2";
import { DataSource } from "typeorm";
import { dataSourceOptions } from "@/config/.";
import { AccountStatus } from "@/common/enums/account-status.enum";
import { Role } from "@/common/enums/role.enum";
import { User } from "@/modules/users/entities/user.entity";

async function seedSystemAdmin(): Promise<void> {
  const phone = process.env.SYSTEM_ADMIN_SEED_PHONE;
  const password = process.env.SYSTEM_ADMIN_SEED_PASSWORD;

  if (!phone || !password) {
    throw new Error(
      "SYSTEM_ADMIN_SEED_PHONE and SYSTEM_ADMIN_SEED_PASSWORD must be set in .env",
    );
  }

  if (password.length < 12) {
    throw new Error("System admin password must be at least 12 characters");
  }

  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();

  try {
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });
    const result = await dataSource.transaction(async (manager) => {
      const users = manager.getRepository(User);
      let user = await users.findOne({ where: { phone } });

      if (user && user.role !== Role.ADMIN) {
        throw new Error(
          "This phone number already belongs to a non-admin account",
        );
      }

      if (!user) {
        user = users.create({
          role: Role.ADMIN,
          phone,
          passwordHash,
          accountStatus: AccountStatus.ACTIVE,
        });
      } else {
        user.passwordHash = passwordHash;
        user.accountStatus = AccountStatus.ACTIVE;
      }

      const savedUser = await users.save(user);
      return {
        userId: savedUser.id,
        role: savedUser.role,
        phone: savedUser.phone,
        accountStatus: savedUser.accountStatus,
      };
    });

    console.log("System admin seed completed:", result);
  } finally {
    await dataSource.destroy();
  }
}

seedSystemAdmin().catch((error: unknown) => {
  console.error("System admin seed failed:", error);
  process.exitCode = 1;
});

