export enum Role {
  SUPER_ADMIN = "ROLE_SUPER_ADMIN",
  ADMIN = "ROLE_ADMIN",
  USER = "ROLE_USER",
  DEPARTMENT_HEAD = "ROLE_DEPARTMENT_HEAD",
  COURSE_CONVENOR = "ROLE_COURSE_CONVENOR",
  THESIS_ADMIN = "ROLE_THESIS_ADMIN",
  THESIS_CONVENER = "ROLE_THESIS_CONVENER",
  THESIS_MEMBER = "ROLE_THESIS_MEMBER",
  THESIS_SUPERVISOR = "ROLE_USER",
  OPERATOR = "OPERATOR",

  PATIENT = "ROLE_PATIENT",
  DOCTOR = "ROLE_DOCTOR",
  LAB_TECHNICIAN = "ROLE_LAB_TECHNICIAN",
}

// Role hierarchy key:value pairs
export const RoleHierarchy: { [key in Role]: number } = {
  [Role.SUPER_ADMIN]: 8,
  [Role.ADMIN]: 7,
  [Role.DEPARTMENT_HEAD]: 6,
  [Role.COURSE_CONVENOR]: 5,
  [Role.THESIS_ADMIN]: 4,
  [Role.THESIS_CONVENER]: 3,
  [Role.THESIS_MEMBER]: 2,
  [Role.OPERATOR]: 2,
  [Role.USER]: 1,

  // Rural Health Connect roles use exact role matching in RolesGuard.
  [Role.PATIENT]: 1,
  [Role.DOCTOR]: 1,
  [Role.LAB_TECHNICIAN]: 1,

  // THESIS_SUPERVISOR has the same value as USER.
  // [Role.THESIS_SUPERVISOR]: 1,
};
