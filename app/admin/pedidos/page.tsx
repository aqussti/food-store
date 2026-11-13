import Link from "next/link";

import { getAdminPageUser } from "../_lib/page-user";
import type { UserRole } from "@/lib/auth/types";
import { formatCents, formatDateTime } from "@/lib/admin/format";
import {
  ADVANCE_TRANSITIONS,
  listOrders,
  ORDER_STATUS_LABELS,
  ORDER_STATUSES,
  type Order,
  type OrderStatus,
} from "@/lib/admin/orders";
import { ActionForm } from "../_components/action-form";
import { advanceOrderAction, cancelOrderAction } from "./actions";

function isOrderStatus(value: string | undefined): value is OrderStatus {
  return (
    value !== undefined &&
    (ORDER_STATUSES as readonly string[]).includes(value)
  );
}

function canCancel(order: Order, role: UserRole): boolean {
  if (
    role === "cliente" ||
    order.status === "entregado" ||
    order.status === "cancelado"
  ) {
    return false;
  }

  if (
    role !== "superadmin" &&
    (order.status === "en_preparacion" || order.status === "en_camino")
  ) {
    return false;
  }

  return true;
}

function statusBadgeClass(status: OrderStatus): string {
  if (status === "cancelado") {
    return "badge badge-danger";
  }

  if (status === "entregado") {
    return "badge badge-success";
  }

  if (status === "pendiente") {
    return "badge badge-warning";
  }

  return "badge";
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const user = await getAdminPageUser(["empleado", "superadmin"]);

  if (!user) {
    return null;
  }

  const params = await searchParams;
  const status = isOrderStatus(params.estado) ? params.estado : undefined;
  const orders = await listOrders(user, { status });

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h2>Pedidos</h2>
          <p className="muted">
            Avance de estados y cancelación con devolución de stock. La
            confirmación del pago la realiza la tarea #10.
          </p>
        </div>
        <span className="badge">{orders.length} en esta vista</span>
      </div>

      <nav className="filter-tabs" aria-label="Filtrar pedidos por estado">
        <Link
          href="/admin/pedidos"
          className={status === undefined ? "active" : undefined}
        >
          Todos
        </Link>
        {ORDER_STATUSES.map((orderStatus) => (
          <Link
            key={orderStatus}
            href={`/admin/pedidos?estado=${orderStatus}`}
            className={status === orderStatus ? "active" : undefined}
          >
            {ORDER_STATUS_LABELS[orderStatus]}
          </Link>
        ))}
      </nav>

      {orders.length === 0 ? (
        <section className="card">
          <p>
            No hay pedidos para mostrar. Los pedidos aparecerán cuando las
            tareas #9 y #10 estén integradas.
          </p>
        </section>
      ) : (
        <section className="stack">
          {orders.map((order) => {
            const nextStatus = ADVANCE_TRANSITIONS[order.status];

            return (
              <article className="card stack" key={order.id}>
                <div className="admin-topbar">
                  <div>
                    <h3>Pedido {order.id.slice(0, 8)}</h3>
                    <p className="muted">
                      {order.customerName} · {order.customerEmail}
                    </p>
                    <p className="muted">
                      Creado el {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="order-status">
                    <span className={statusBadgeClass(order.status)}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <p className="metric-small">
                      {formatCents(order.totalCents)}
                    </p>
                  </div>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio unitario</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.productName}</td>
                          <td>{item.quantity}</td>
                          <td>{formatCents(item.unitPriceCents)}</td>
                          <td>{formatCents(item.lineTotalCents)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3}>Envío</td>
                        <td>{formatCents(order.shippingCents)}</td>
                      </tr>
                      <tr>
                        <td colSpan={3}>
                          <strong>Total</strong>
                        </td>
                        <td>
                          <strong>{formatCents(order.totalCents)}</strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="order-details">
                  <p>
                    <strong>Dirección de envío:</strong>{" "}
                    {order.shippingAddress ?? "No informada"}
                  </p>
                  {order.cancelReason ? (
                    <p>
                      <strong>Motivo de cancelación:</strong>{" "}
                      {order.cancelReason}
                    </p>
                  ) : null}
                </div>

                <div className="order-actions">
                  {nextStatus ? (
                    <ActionForm
                      action={advanceOrderAction}
                      submitLabel={`Pasar a ${ORDER_STATUS_LABELS[nextStatus]}`}
                    >
                      <input type="hidden" name="id" value={order.id} />
                      <input
                        type="hidden"
                        name="nextStatus"
                        value={nextStatus}
                      />
                    </ActionForm>
                  ) : (
                    <p className="muted">
                      {order.status === "pendiente"
                        ? "Esperando confirmación del pago (#10)."
                        : "Sin más transiciones disponibles."}
                    </p>
                  )}

                  {canCancel(order, user.role) ? (
                    <details>
                      <summary>Cancelar pedido</summary>
                      <ActionForm
                        action={cancelOrderAction}
                        submitLabel="Confirmar cancelación"
                        className="stack"
                        danger
                      >
                        <input type="hidden" name="id" value={order.id} />
                        <label htmlFor={`reason-${order.id}`}>
                          Motivo
                          <textarea
                            id={`reason-${order.id}`}
                            name="reason"
                            required
                            maxLength={500}
                          />
                        </label>
                      </ActionForm>
                    </details>
                  ) : null}
                </div>

                <details>
                  <summary>Historial de estados</summary>
                  {order.history.length === 0 ? (
                    <p className="muted">Todavía no hay cambios registrados.</p>
                  ) : (
                    <ul className="history-list">
                      {order.history.map((entry) => (
                        <li key={entry.id}>
                          {entry.fromStatus
                            ? `${ORDER_STATUS_LABELS[entry.fromStatus]} → `
                            : ""}
                          {ORDER_STATUS_LABELS[entry.toStatus]} ·{" "}
                          {formatDateTime(entry.createdAt)}
                          {entry.changedByName
                            ? ` · ${entry.changedByName}`
                            : ""}
                          {entry.reason ? ` · ${entry.reason}` : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                </details>
              </article>
            );
          })}
        </section>
      )}
    </>
  );
}
