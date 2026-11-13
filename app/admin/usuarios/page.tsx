import { USER_ROLES, USER_ROLE_LABELS, type UserRole } from "@/lib/auth/types";
import { formatDateTime } from "@/lib/admin/format";
import { listUsers } from "@/lib/admin/users";
import { AccessDenied } from "../_components/access-denied";
import { getAdminPageUser } from "../_lib/page-user";
import { ActionForm } from "../_components/action-form";
import { setUserActiveAction, updateUserRoleAction } from "./actions";

function roleBadgeClass(role: UserRole): string {
  if (role === "superadmin") {
    return "badge badge-warning";
  }

  if (role === "empleado") {
    return "badge badge-success";
  }

  return "badge";
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const currentUser = await getAdminPageUser(["superadmin"]);

  if (!currentUser) {
    return (
      <AccessDenied message="Solo un Superadmin puede gestionar usuarios y roles." />
    );
  }

  const params = await searchParams;
  const search = params.q?.trim() ?? "";
  const users = await listUsers(currentUser, search);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h2>Usuarios y roles</h2>
          <p className="muted">
            Solo Superadmin. No se puede quitar el último Superadmin activo ni
            desactivar la propia cuenta.
          </p>
        </div>
        <span className="badge">{users.length} usuarios</span>
      </div>

      <section className="card">
        <form method="get" className="search-form">
          <label htmlFor="user-search">
            Buscar por nombre o correo
            <input
              id="user-search"
              name="q"
              type="search"
              defaultValue={search}
              placeholder="Ej. nombre@correo.com"
            />
          </label>
          <button type="submit" className="button button-secondary">
            Buscar
          </button>
        </form>
      </section>

      <section className="card">
        <h3>Listado de usuarios</h3>
        {users.length === 0 ? (
          <p>
            No hay usuarios {search ? "que coincidan con la búsqueda" : "registrados"}.
          </p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol actual</th>
                  <th>Estado</th>
                  <th>Alta</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isSelf = user.id === currentUser.id;

                  return (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.name}</strong>
                        <div className="muted">{user.email}</div>
                        {isSelf ? (
                          <div className="badge badge-success">Tu cuenta</div>
                        ) : null}
                      </td>
                      <td>
                        <span className={roleBadgeClass(user.role)}>
                          {USER_ROLE_LABELS[user.role]}
                        </span>
                        {isSelf ? null : (
                          <details>
                            <summary>Cambiar rol</summary>
                            <ActionForm
                              action={updateUserRoleAction}
                              submitLabel="Guardar rol"
                              className="stack"
                            >
                              <input type="hidden" name="id" value={user.id} />
                              <label htmlFor={`role-${user.id}`}>
                                Nuevo rol
                                <select
                                  id={`role-${user.id}`}
                                  name="role"
                                  defaultValue={user.role}
                                >
                                  {USER_ROLES.map((role) => (
                                    <option key={role} value={role}>
                                      {USER_ROLE_LABELS[role]}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </ActionForm>
                          </details>
                        )}
                      </td>
                      <td>
                        {user.isActive ? (
                          <span className="badge badge-success">Activo</span>
                        ) : (
                          <span className="badge badge-danger">Inactivo</span>
                        )}
                      </td>
                      <td>{formatDateTime(user.createdAt)}</td>
                      <td>
                        {isSelf ? (
                          <span className="muted">—</span>
                        ) : (
                          <ActionForm
                            action={setUserActiveAction}
                            submitLabel={
                              user.isActive ? "Desactivar" : "Activar"
                            }
                            danger={user.isActive}
                          >
                            <input type="hidden" name="id" value={user.id} />
                            <input
                              type="hidden"
                              name="active"
                              value={user.isActive ? "false" : "true"}
                            />
                          </ActionForm>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
