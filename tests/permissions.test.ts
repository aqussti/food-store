import { describe, expect, it } from "vitest";

import {
  AuthorizationError,
  canManageCatalog,
  canManageOrders,
  canManageUsers,
  isUserRole,
  normalizeRole,
  requireAuthenticatedUser,
  requireRole,
} from "@/lib/auth/roles";
import type { CurrentUser } from "@/lib/auth/types";

const cliente: CurrentUser = {
  id: "user-cliente",
  email: "cliente@example.test",
  name: "Cliente",
  role: "cliente",
  isActive: true,
};

const empleado: CurrentUser = { ...cliente, id: "user-empleado", role: "empleado" };
const superadmin: CurrentUser = {
  ...cliente,
  id: "user-superadmin",
  role: "superadmin",
};
const inactiveEmployee: CurrentUser = { ...empleado, isActive: false };

describe("roles y permisos (#6)", () => {
  it("normaliza un rol nulo o vacío como cliente", () => {
    expect(normalizeRole(null)).toBe("cliente");
    expect(normalizeRole(undefined)).toBe("cliente");
    expect(normalizeRole("   ")).toBe("cliente");
  });

  it("rechaza roles desconocidos", () => {
    expect(() => normalizeRole("admin")).toThrow(AuthorizationError);
    expect(isUserRole("superadmin")).toBe(true);
    expect(isUserRole("root")).toBe(false);
  });

  it("exige sesión y cuenta activa", () => {
    expect(() => requireAuthenticatedUser(null)).toThrowError(
      "Necesitás iniciar sesión.",
    );
    expect(() => requireAuthenticatedUser(inactiveEmployee)).toThrowError(
      "La cuenta está desactivada.",
    );
    expect(requireAuthenticatedUser(empleado)).toBe(empleado);
  });

  it("verifica permisos en el servidor", () => {
    expect(() => requireRole(cliente, ["empleado", "superadmin"])).toThrow(
      AuthorizationError,
    );
    expect(requireRole(empleado, ["empleado", "superadmin"])).toBe(empleado);
    expect(() => requireRole(empleado, ["superadmin"])).toThrow(
      AuthorizationError,
    );
  });

  it("expone las capacidades esperadas por rol", () => {
    expect(canManageCatalog(cliente)).toBe(false);
    expect(canManageCatalog(empleado)).toBe(true);
    expect(canManageCatalog(superadmin)).toBe(true);
    expect(canManageOrders(empleado)).toBe(true);
    expect(canManageUsers(empleado)).toBe(false);
    expect(canManageUsers(superadmin)).toBe(true);
    expect(canManageCatalog(inactiveEmployee)).toBe(false);
  });
});
