import Link from "next/link";
import type { ReactNode } from "react";

import { AccessDenied } from "./_components/access-denied";
import { getCurrentUser } from "@/lib/auth/current-user";
import { AuthorizationError } from "@/lib/auth/roles";
import { USER_ROLE_LABELS } from "@/lib/auth/types";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  let user = null;

  try {
    user = await getCurrentUser();
  } catch (error) {
    if (!(error instanceof AuthorizationError)) {
      throw error;
    }
  }

  if (!user) {
    return (
      <main className="admin-main">
        <AccessDenied message="Necesitás iniciar sesión con una cuenta habilitada para administrar la tienda." />
      </main>
    );
  }

  if (!user.isActive) {
    return (
      <main className="admin-main">
        <AccessDenied message="Tu cuenta está desactivada. Contactá a un Superadmin." />
      </main>
    );
  }

  if (user.role === "cliente") {
    return (
      <main className="admin-main">
        <AccessDenied message="Tu cuenta es de Cliente. El panel está reservado para Empleados y Superadmins." />
      </main>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Food Store</p>
          <h1>Panel de administración</h1>
          <p>
            {user.name} · {USER_ROLE_LABELS[user.role]}
          </p>
        </div>
        <nav className="admin-nav" aria-label="Secciones de administración">
          <Link href="/admin">Panel</Link>
          <Link href="/admin/productos">Productos</Link>
          <Link href="/admin/categorias">Categorías</Link>
          <Link href="/admin/pedidos">Pedidos</Link>
          {user.role === "superadmin" ? (
            <Link href="/admin/usuarios">Usuarios</Link>
          ) : null}
        </nav>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}
