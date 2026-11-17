
import * as argon2 from "argon2";
import { DataSource } from "typeorm";
import { dataSourceOptions } from "@/config/database.config";

const createSystemAdmin = async (): Promise<void> => {
  const name = process.env.ADMIN_NAME?.trim();
  const phone = process.env.ADMIN_PHONE?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !phone || !password) {
    throw new Error(
      "Set ADMIN_NAME, ADMIN_PHONE, and ADMIN_PASSWORD in this PowerShell session first.",
    );
  }

  if (password.length < 8) {
    throw new Error("Admin password must contain at least 8 characters.");
  }

  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();

  try {
    await dataSource.transaction(async (manager) => {
      const existingUsers = (await manager.query(
        `SELECT "id", "role" FROM "users" WHERE "phone" = $1 FOR UPDATE`,
        [phone],
      )) as Array<{ id: string; role: string }>;

      let userId: string;
      if (existingUsers.length > 0) {
        if (existingUsers[0].role.toUpperCase() !== "ADMIN") {
          throw new Error(
            "This phone number is already used by a non-admin user.",
          );
        }
        userId = existingUsers[0].id;
      } else {
        const passwordHash = await argon2.hash(password);
        const createdUsers = (await manager.query(
          `INSERT INTO "users" ("role", "phone", "password_hash", "account_status")
           VALUES ('ADMIN', $1, $2, 'ACTIVE')
           RETURNING "id"`,
          [phone, passwordHash],
        )) as Array<{ id: string }>;
        userId = createdUsers[0].id;
      }

      await manager.query(
        `INSERT INTO "admin_profiles" ("user_id", "name")
         VALUES ($1, $2)
         ON CONFLICT ("user_id") DO UPDATE SET "name" = EXCLUDED."name"`,
        [userId, name],
      );
    });
  } finally {
    await dataSource.destroy();
  }

  console.log("System admin account is ready.");
};

createSystemAdmin().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
