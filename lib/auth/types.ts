export const USER_ROLES = ["cliente", "empleado", "superadmin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  cliente: "Cliente",
  empleado: "Empleado",
  superadmin: "Superadmin",
};
