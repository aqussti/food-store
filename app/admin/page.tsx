import Link from "next/link";

import { getAdminPageUser } from "./_lib/page-user";
import { formatCents } from "@/lib/admin/format";
import {
  countActiveProducts,
  countLowStockProducts,
  listProducts,
} from "@/lib/admin/products";
import {
  countOrdersForEmployee,
  getOrderMetrics,
} from "@/lib/admin/orders";
import { countActiveUsers } from "@/lib/admin/users";

export default async function AdminDashboardPage() {
  const user = await getAdminPageUser(["empleado", "superadmin"]);

  if (!user) {
    return null;
  }

  const [activeProducts, lowStockCount, lowStockProducts, orderCounts] =
    await Promise.all([
      countActiveProducts(user),
      countLowStockProducts(user),
      listProducts(user, { lowStockOnly: true }),
      countOrdersForEmployee(user),
    ]);

  const [orderMetrics, activeUsers] =
    user.role === "superadmin"
      ? await Promise.all([getOrderMetrics(user), countActiveUsers(user)])
      : [null, null];

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h2>Resumen</h2>
          <p className="muted">
            Estado operativo de productos, stock y pedidos.
          </p>
        </div>
        <Link className="button button-secondary" href="/admin/productos">
          Gestionar productos
        </Link>
      </div>

      <section className="admin-grid" aria-label="Indicadores">
        <article className="card">
          <h3>Productos activos</h3>
          <p className="metric">{activeProducts}</p>
        </article>
        <article className="card">
          <h3>Stock bajo</h3>
          <p className="metric">{lowStockCount}</p>
        </article>
        <article className="card">
          <h3>Pedidos pendientes</h3>
          <p className="metric">{orderCounts.pending}</p>
        </article>
        <article className="card">
          <h3>Pedidos en curso</h3>
          <p className="metric">{orderCounts.active}</p>
        </article>
        {orderMetrics ? (
          <>
            <article className="card">
              <h3>Ventas confirmadas</h3>
              <p className="metric">
                {formatCents(orderMetrics.revenueCents)}
              </p>
            </article>
            <article className="card">
              <h3>Usuarios activos</h3>
              <p className="metric">{activeUsers}</p>
            </article>
            <article className="card">
              <h3>Pedidos entregados</h3>
              <p className="metric">{orderMetrics.delivered}</p>
            </article>
            <article className="card">
              <h3>Pedidos cancelados</h3>
              <p className="metric">{orderMetrics.cancelled}</p>
            </article>
          </>
        ) : null}
      </section>

      <section className="card">
        <div className="admin-topbar">
          <div>
            <h2>Alerta de stock bajo</h2>
            <p className="muted">
              Productos activos cuyo stock actual es menor o igual al mínimo.
            </p>
          </div>
          <Link className="button button-secondary" href="/admin/productos">
            Ver todos
          </Link>
        </div>

        {lowStockProducts.length === 0 ? (
          <p>No hay productos con stock bajo.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Stock</th>
                  <th>Mínimo</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.categoryName ?? "Sin categoría"}</td>
                    <td>
                      <span className="badge badge-danger">
                        {product.stock}
                      </span>
                    </td>
                    <td>{product.minStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
