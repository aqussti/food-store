import { randomUUID } from "node:crypto";

import { getDb } from "@/lib/db";
import { AuthorizationError, requireRole } from "@/lib/auth/roles";
import type { CurrentUser } from "@/lib/auth/types";
import { ConflictError, NotFoundError } from "./errors";
import { requiredString } from "./validation";

export const ORDER_STATUSES = [
  "pendiente",
  "confirmado",
  "en_preparacion",
  "en_camino",
  "entregado",
  "cancelado",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  en_preparacion: "En preparación",
  en_camino: "En camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export const ADVANCE_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus>> = {
  confirmado: "en_preparacion",
  en_preparacion: "en_camino",
  en_camino: "entregado",
};

export type OrderItem = {
  id: string;
  productId: string | null;
  productName: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
};

export type OrderHistoryEntry = {
  id: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedByName: string | null;
  reason: string | null;
  createdAt: Date;
};

export type Order = {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  shippingAddress: string | null;
  cancelReason: string | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  history: OrderHistoryEntry[];
};

export type OrderMetrics = {
  pending: number;
  active: number;
  delivered: number;
  cancelled: number;
  revenueCents: number;
};

type OrderRow = {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  status: OrderStatus;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  shipping_address: string | null;
  cancel_reason: string | null;
  cancelled_at: Date | null;
  created_at: Date;
  updated_at: Date;
  items: OrderItem[] | null;
  history: Array<{
    id: string;
    fromStatus: OrderStatus | null;
    toStatus: OrderStatus;
    changedByName: string | null;
    reason: string | null;
    createdAt: string | Date;
  }> | null;
};

const ORDER_SELECT = `
  select o.id, o.customer_id, u.name as customer_name, u.email as customer_email,
         o.status, o.subtotal_cents, o.shipping_cents, o.total_cents,
         o.shipping_address, o.cancel_reason, o.cancelled_at,
         o.created_at, o.updated_at,
         (
           select coalesce(json_agg(json_build_object(
             'id', i.id,
             'productId', i.product_id,
             'productName', i.product_name,
             'unitPriceCents', i.unit_price_cents,
             'quantity', i.quantity,
             'lineTotalCents', i.line_total_cents
           ) order by i.id), '[]'::json)
           from food_store_order_items i
           where i.order_id = o.id
         ) as items,
         (
           select coalesce(json_agg(json_build_object(
             'id', h.id,
             'fromStatus', h.from_status,
             'toStatus', h.to_status,
             'changedByName', hu.name,
             'reason', h.reason,
             'createdAt', h.created_at
           ) order by h.created_at), '[]'::json)
           from food_store_order_status_history h
           left join food_store_users hu on hu.id = h.changed_by
           where h.order_id = o.id
         ) as history
  from food_store_orders o
  join food_store_users u on u.id = o.customer_id
`;

function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    status: row.status,
    subtotalCents: row.subtotal_cents,
    shippingCents: row.shipping_cents,
    totalCents: row.total_cents,
    shippingAddress: row.shipping_address,
    cancelReason: row.cancel_reason,
    cancelledAt: row.cancelled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: row.items ?? [],
    history: (row.history ?? []).map((entry) => ({
      ...entry,
      createdAt: new Date(entry.createdAt),
    })),
  };
}

function ordersActor(actor: CurrentUser | null): CurrentUser {
  return requireRole(actor, ["empleado", "superadmin"]);
}

function superadminActor(actor: CurrentUser | null): CurrentUser {
  return requireRole(actor, ["superadmin"]);
}

async function getOrderById(
  actor: CurrentUser | null,
  orderId: string,
): Promise<Order> {
  ordersActor(actor);

  const result = await getDb().query<OrderRow>(
    `${ORDER_SELECT} where o.id = $1`,
    [orderId],
  );

  if (!result.rows[0]) {
    throw new NotFoundError("El pedido no existe.");
  }

  return mapOrder(result.rows[0]);
}

export async function listOrders(
  actor: CurrentUser | null,
  options: { status?: OrderStatus; limit?: number } = {},
): Promise<Order[]> {
  ordersActor(actor);

  const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
  const result = await getDb().query<OrderRow>(
    `${ORDER_SELECT}
     where ($1::text is null or o.status = $1)
     order by o.created_at desc
     limit $2`,
    [options.status ?? null, limit],
  );

  return result.rows.map(mapOrder);
}

export async function advanceOrder(
  actor: CurrentUser | null,
  orderId: string,
  nextStatus: OrderStatus,
): Promise<Order> {
  const currentUser = ordersActor(actor);
  const client = await getDb().connect();

  try {
    await client.query("begin");

    const current = await client.query<{ status: OrderStatus }>(
      "select status from food_store_orders where id = $1 for update",
      [orderId],
    );

    if (!current.rows[0]) {
      throw new NotFoundError("El pedido no existe.");
    }

    const currentStatus = current.rows[0].status;
    const expected = ADVANCE_TRANSITIONS[currentStatus];

    if (!expected) {
      if (currentStatus === "pendiente") {
        throw new ConflictError(
          "El pedido todavía no está confirmado por el pago.",
        );
      }

      throw new ConflictError(
        `El pedido está en estado ${ORDER_STATUS_LABELS[currentStatus]} y ya no puede avanzar.`,
      );
    }

    if (nextStatus !== expected) {
      throw new ConflictError(
        `No se puede pasar de ${ORDER_STATUS_LABELS[currentStatus]} a ${ORDER_STATUS_LABELS[nextStatus]}. El siguiente estado es ${ORDER_STATUS_LABELS[expected]}.`,
      );
    }

    await client.query(
      `update food_store_orders
       set status = $2, updated_at = now()
       where id = $1`,
      [orderId, nextStatus],
    );

    await client.query(
      `insert into food_store_order_status_history
         (id, order_id, from_status, to_status, changed_by)
       values ($1, $2, $3, $4, $5)`,
      [randomUUID(), orderId, currentStatus, nextStatus, currentUser.id],
    );

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }

  return getOrderById(actor, orderId);
}

export async function cancelOrder(
  actor: CurrentUser | null,
  orderId: string,
  reasonInput: string,
): Promise<Order> {
  const currentUser = ordersActor(actor);
  const reason = requiredString(reasonInput, "El motivo de cancelación", 500);
  const client = await getDb().connect();

  try {
    await client.query("begin");

    const current = await client.query<{ status: OrderStatus }>(
      "select status from food_store_orders where id = $1 for update",
      [orderId],
    );

    if (!current.rows[0]) {
      throw new NotFoundError("El pedido no existe.");
    }

    const currentStatus = current.rows[0].status;

    if (currentStatus === "entregado" || currentStatus === "cancelado") {
      throw new ConflictError(
        `El pedido está ${ORDER_STATUS_LABELS[currentStatus].toLowerCase()} y no se puede cancelar.`,
      );
    }

    if (
      (currentStatus === "en_preparacion" || currentStatus === "en_camino") &&
      currentUser.role !== "superadmin"
    ) {
      throw new AuthorizationError(
        "Solo el Superadmin puede cancelar un pedido en preparación o en camino.",
        403,
      );
    }

    if (currentStatus !== "pendiente") {
      await client.query(
        `update food_store_products p
         set stock = p.stock + i.quantity, updated_at = now()
         from food_store_order_items i
         where i.order_id = $1 and p.id = i.product_id`,
        [orderId],
      );
    }

    await client.query(
      `update food_store_orders
       set status = 'cancelado', cancel_reason = $2, cancelled_by = $3,
           cancelled_at = now(), updated_at = now()
       where id = $1`,
      [orderId, reason, currentUser.id],
    );

    await client.query(
      `insert into food_store_order_status_history
         (id, order_id, from_status, to_status, changed_by, reason)
       values ($1, $2, $3, 'cancelado', $4, $5)`,
      [randomUUID(), orderId, currentStatus, currentUser.id, reason],
    );

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }

  return getOrderById(actor, orderId);
}

export async function getOrderMetrics(
  actor: CurrentUser | null,
): Promise<OrderMetrics> {
  superadminActor(actor);

  const result = await getDb().query<{
    pending: string;
    active: string;
    delivered: string;
    cancelled: string;
    revenue_cents: string;
  }>(
    `select
       count(*) filter (where status = 'pendiente')::text as pending,
       count(*) filter (where status in ('confirmado', 'en_preparacion', 'en_camino'))::text as active,
       count(*) filter (where status = 'entregado')::text as delivered,
       count(*) filter (where status = 'cancelado')::text as cancelled,
       coalesce(
         sum(total_cents) filter (
           where status in ('confirmado', 'en_preparacion', 'en_camino', 'entregado')
         ),
         0
       )::text as revenue_cents
     from food_store_orders`,
  );

  const row = result.rows[0];

  return {
    pending: Number(row?.pending ?? 0),
    active: Number(row?.active ?? 0),
    delivered: Number(row?.delivered ?? 0),
    cancelled: Number(row?.cancelled ?? 0),
    revenueCents: Number(row?.revenue_cents ?? 0),
  };
}

export async function countOrdersForEmployee(
  actor: CurrentUser | null,
): Promise<{ pending: number; active: number }> {
  ordersActor(actor);

  const result = await getDb().query<{ pending: string; active: string }>(
    `select
       count(*) filter (where status = 'pendiente')::text as pending,
       count(*) filter (where status in ('confirmado', 'en_preparacion', 'en_camino'))::text as active
     from food_store_orders`,
  );

  return {
    pending: Number(result.rows[0]?.pending ?? 0),
    active: Number(result.rows[0]?.active ?? 0),
  };
}
