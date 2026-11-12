import { USER_ROLES, type CurrentUser, type UserRole } from "./types";

export class AuthorizationError extends Error {
  readonly status: 401 | 403;

  constructor(message: string, status: 401 | 403) {
    super(message);
    this.name = "AuthorizationError";
    this.status = status;
  }
}

export function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === "string" &&
    (USER_ROLES as readonly string[]).includes(value)
  );
}

/** Los usuarios de Better Auth pueden tener `role` nulo; se interpretan como clientes. */
export function normalizeRole(value: string | null | undefined): UserRole {
  if (value == null || value.trim() === "") {
    return "cliente";
  }

  if (!isUserRole(value)) {
    throw new AuthorizationError("El rol del usuario no es válido.", 403);
  }

  return value;
}

export function requireAuthenticatedUser(
  user: CurrentUser | null,
): CurrentUser {
  if (!user) {
    throw new AuthorizationError("Necesitás iniciar sesión.", 401);
  }

  if (!user.isActive) {
    throw new AuthorizationError("La cuenta está desactivada.", 403);
  }

  return user;
}

export function requireRole(
  user: CurrentUser | null,
  allowedRoles: readonly UserRole[],
): CurrentUser {
  const currentUser = requireAuthenticatedUser(user);

  if (!allowedRoles.includes(currentUser.role)) {
    throw new AuthorizationError(
      "No tenés permisos para realizar esta acción.",
      403,
    );
  }

  return currentUser;
}

export function canManageCatalog(user: CurrentUser | null): boolean {
  return (
    user?.isActive === true &&
    (user.role === "empleado" || user.role === "superadmin")
  );
}

export function canManageOrders(user: CurrentUser | null): boolean {
  return canManageCatalog(user);
}

export function canManageUsers(user: CurrentUser | null): boolean {
  return user?.isActive === true && user.role === "superadmin";
}
