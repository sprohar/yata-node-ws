/**
 * Common error codes for the Prisma Client.
 * @see https://www.prisma.io/docs/reference/api-reference/error-reference
 */
export enum PrismaClientErrorCode {
  /**
   * Unique constraint failed on the {constraint}
   */
  UNIQUE_CONSTRAINT_VIOLATION = 'P2002',

  /**
   * "An operation failed because it depends on one or more records that were required but not found. {cause}"
   * @see
   */
  UNIQUE_ATTRIBUTE_NOT_FOUND = 'P2025',
}
