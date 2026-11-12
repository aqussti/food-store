import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/auth/roles";
import type { CurrentUser, UserRole } from "@/lib/auth/types";
import { isUserRole } from "@/lib/auth/roles";
import { ConflictError, NotFoundError, ValidationError } from "./errors";
import { booleanValue } from "./validation";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function mapUser(row: UserRow): AdminUser {
  const role = row.role ?? "cliente";

  if (!isUserRole(role)) {
    throw new ValidationError("El usuario tiene un rol no válido.");
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function superadminActor(actor: CurrentUser | null): CurrentUser {
  return requireRole(actor, ["superadmin"]);
}

async function loadUser(userId: string): Promise<AdminUser> {
  const result = await getDb().query<UserRow>(
    `select id, name, email, role, is_active as "isActive",
            "createdAt", "updatedAt"
     from food_store_users
     where id = $1`,
    [userId],
  );

  if (!result.rows[0]) {
    throw new NotFoundError("El usuario no existe.");
  }

  return mapUser(result.rows[0]);
}

export async function listUsers(
  actor: CurrentUser | null,
  search = "",
): Promise<AdminUser[]> {
  superadminActor(actor);

  const result = await getDb().query<UserRow>(
    `select id, name, email, role, is_active as "isActive",
            "createdAt", "updatedAt"
     from food_store_users
     where $1::text is null
        or name ilike '%' || $1 || '%'
        or email ilike '%' || $1 || '%'
     order by "createdAt" desc`,
    [search.trim() || null],
  );

  return result.rows.map(mapUser);
}

export async function updateUserRole(
  actor: CurrentUser | null,
  userId: string,
  roleInput: unknown,
): Promise<AdminUser> {
  const currentUser = superadminActor(actor);

  if (!isUserRole(roleInput)) {
    throw new ValidationError("El rol seleccionado no es válido.");
  }

  if (userId === currentUser.id) {
    throw new ConflictError(
      "No podés cambiar tu propio rol. Pedile a otro Superadmin que lo haga.",
    );
  }

  const nextRole = roleInput;
  const client = await getDb().connect();

  try {
    await client.query("begin");

    const activeSuperadmins = await client.query<{ id: string }>(
      `select id from food_store_users
       where role = 'superadmin' and is_active = true
       for update`,
    );

    const target = await client.query<{
      id: string;
      role: string | null;
      is_active: boolean;
    }>(
      `select id, role, is_active
       from food_store_users
       where id = $1
       for update`,
      [userId],
    );

    if (!target.rows[0]) {
      throw new NotFoundError("El usuario no existe.");
    }

    const targetRow = target.rows[0];

    if (
      targetRow.role === "superadmin" &&
      targetRow.is_active &&
      nextRole !== "superadmin" &&
      activeSuperadmins.rowCount === 1
    ) {
      throw new ConflictError(
        "No se puede quitar el rol al último Superadmin activo.",
      );
    }

    await client.query(
      `update food_store_users
       set role = $2, "updatedAt" = now()
       where id = $1`,
      [userId, nextRole],
    );

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }

  return loadUser(userId);
}

export async function setUserActive(
  actor: CurrentUser | null,
  userId: string,
  activeInput: unknown,
): Promise<AdminUser> {
  const currentUser = superadminActor(actor);
  const nextActive = booleanValue(activeInput, true);

  if (userId === currentUser.id && !nextActive) {
    throw new ConflictError("No podés desactivar tu propia cuenta.");
  }
  const client = await getDb().connect();

  try {
    await client.query("begin");

    const activeSuperadmins = await client.query<{ id: string }>(
      `select id from food_store_users
       where role = 'superadmin' and is_active = true
       for update`,
    );

    const target = await client.query<{
      id: string;
      role: string | null;
      is_active: boolean;
    }>(
      `select id, role, is_active
       from food_store_users
       where id = $1
       for update`,
      [userId],
    );

    if (!target.rows[0]) {
      throw new NotFoundError("El usuario no existe.");
    }

    const targetRow = target.rows[0];

    if (
      targetRow.role === "superadmin" &&
      targetRow.is_active &&
      !nextActive &&
      activeSuperadmins.rowCount === 1
    ) {
      throw new ConflictError(
        "No se puede desactivar al último Superadmin activo.",
      );
    }

    await client.query(
      `update food_store_users
       set is_active = $2, "updatedAt" = now()
       where id = $1`,
      [userId, nextActive],
    );

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }

  return loadUser(userId);
}

export async function countActiveUsers(
  actor: CurrentUser | null,
): Promise<number> {
  superadminActor(actor);

  const result = await getDb().query<{ count: string }>(
    "select count(*)::text as count from food_store_users where is_active = true",
  );

  return Number(result.rows[0]?.count ?? 0);
}
