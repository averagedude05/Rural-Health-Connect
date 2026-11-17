export enum Role {
    SUPER_ADMIN = "ROLE_SUPER_ADMIN",
    ADMIN = "ROLE_ADMIN",
    USER = "ROLE_USER",
    OPERATOR = "OPERATOR",
    DOCTOR = "DOCTOR",
    LAB_TECHNICIAN = "LAB_TECHNICIAN",
    CLINIC_ADMIN = "CLINIC_ADMIN",
}

// Role hierarchy key:value pairs
export const RoleHierarchy: { [key in Role]: number } = {
    [Role.SUPER_ADMIN]: 8,
    [Role.ADMIN]: 7,
    [Role.CLINIC_ADMIN]: 3,
    [Role.DOCTOR]: 2,
    [Role.OPERATOR]: 2,
    [Role.LAB_TECHNICIAN]: 2,
    [Role.USER]: 1,
};