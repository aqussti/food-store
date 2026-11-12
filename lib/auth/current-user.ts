import "server-only";

import { cache } from "react";

import { headers } from "next/headers";

import { getDb } from "@/lib/db";
import { normalizeRole } from "./roles";
import type { CurrentUser } from "./types";

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string | null;
  isActive: boolean;
};

/**
 * Punto de integración con #5 (Agus).
 *
 * En producción esta función debe devolver el usuario de la sesión de Better
 * Auth. Mientras #5 no esté integrado, devuelve null y las rutas administrativas
 * responden 401. Para pruebas locales con `next dev`, se puede impersonar un
 * usuario existente con el header `x-food-store-dev-user-id`; ese atajo no se
 * habilita en producción.
 */
export const getCurrentUser = cache(
  async (): Promise<CurrentUser | null> => {
    if (process.env.NODE_ENV !== "production") {
      const requestHeaders = await headers();
      const devUserId = requestHeaders.get("x-food-store-dev-user-id");

      if (devUserId) {
        return loadCurrentUser(devUserId);
      }
    }

    return null;
  },
);

/** Carga un usuario por id y normaliza su rol para el resto de la aplicación. */
export async function loadCurrentUser(
  userId: string,
): Promise<CurrentUser | null> {
  const result = await getDb().query<UserRow>(
    `select id, email, name, role, is_active as "isActive"
     from food_store_users
     where id = $1`,
    [userId],
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: normalizeRole(row.role),
    isActive: row.isActive,
  };
}
