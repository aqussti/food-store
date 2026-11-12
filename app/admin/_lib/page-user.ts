import { getCurrentUser } from "@/lib/auth/current-user";
import type { CurrentUser, UserRole } from "@/lib/auth/types";

/**
 * Guard de páginas administrativas. Devuelve null en lugar de lanzar para que
 * el layout pueda mostrar el mensaje de acceso restringido sin errores de
 * renderizado. Las acciones y los servicios vuelven a verificar el rol.
 */
export async function getAdminPageUser(
  allowedRoles: readonly UserRole[],
): Promise<CurrentUser | null> {
  const user = await getCurrentUser();

  if (!user || !user.isActive || !allowedRoles.includes(user.role)) {
    return null;
  }

  return user;
}
