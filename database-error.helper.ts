// PostgreSQL error codes we translate into proper HTTP errors.
const PG_UNIQUE_VIOLATION = "23505";
const PG_FOREIGN_KEY_VIOLATION = "23503";

/**
 * Reads the PostgreSQL error code from a TypeORM QueryFailedError
 * (or from a raw driver error).
 */
export const getPgErrorCode = (error: unknown): string | undefined => {
  const e = error as { code?: string; driverError?: { code?: string } };
  return e?.driverError?.code ?? e?.code;
};

export const isUniqueViolation = (error: unknown): boolean =>
  getPgErrorCode(error) === PG_UNIQUE_VIOLATION;

export const isForeignKeyViolation = (error: unknown): boolean =>
  getPgErrorCode(error) === PG_FOREIGN_KEY_VIOLATION;

/** Escapes % and _ so user input can be used safely inside an ILIKE pattern. */
export const escapeLikePattern = (value: string): string =>
  value.replace(/[\\%_]/g, (char) => `\\${char}`);
