import "server-only";

import { cache } from "react";

import { headers } from "next/headers";

import { getAuth } from "@/lib/auth";
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

// Agus / Codex / #5: verified session in every environment; no test headers.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await getAuth().api.getSession({ headers: await headers() });
  return session ? loadCurrentUser(session.user.id) : null;
});

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
