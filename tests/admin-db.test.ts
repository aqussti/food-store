import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { getDb } from "@/lib/db";
import { AuthorizationError } from "@/lib/auth/roles";
import type { CurrentUser, UserRole } from "@/lib/auth/types";
import { ConflictError } from "@/lib/admin/errors";
import {
  advanceOrder,
  cancelOrder,
  listOrders,
  ORDER_STATUS_LABELS,
} from "@/lib/admin/orders";
import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  listCategories,
  listProducts,
  updateCategory,
  updateProduct,
} from "@/lib/admin/products";
import { setUserActive, updateUserRole } from "@/lib/admin/users";

const hasTestDb = Boolean(process.env.TEST_DATABASE_URL);

const created = {
  users: [] as string[],
  categories: [] as string[],
  products: [] as string[],
  orders: [] as string[],
};

async function insertUser(role: UserRole, active = true): Promise<CurrentUser> {
  const id = `test-user-${randomUUID()}`;
  const email = `${id}@example.test`;
  const name = `Usuario de prueba ${role}`;

  await getDb().query(
    `insert into food_store_users
       (id, name, email, "emailVerified", role, is_active)
     values ($1, $2, $3, true, $4, $5)`,
    [id, name, email, role, active],
  );

  created.users.push(id);

  return { id, name, email, role, isActive: active };
}

async function insertOrder({
  customerId,
  status,
  productId,
  productName,
  unitPriceCents,
  quantity,
}: {
  customerId: string;
  status:
    | "pendiente"
    | "confirmado"
    | "en_preparacion"
    | "en_camino"
    | "entregado"
    | "cancelado";
  productId: string;
  productName: string;
  unitPriceCents: number;
  quantity: number;
}): Promise<string> {
  const id = `test-order-${randomUUID()}`;
  const lineTotalCents = unitPriceCents * quantity;

  await getDb().query(
    `insert into food_store_orders
       (id, customer_id, status, subtotal_cents, shipping_cents, total_cents, shipping_address)
     values ($1, $2, $3, $4, 0, $4, 'Calle de prueba 123')`,
    [id, customerId, status, lineTotalCents],
  );

  await getDb().query(
    `insert into food_store_order_items
       (id, order_id, product_id, product_name, unit_price_cents, quantity, line_total_cents)
     values ($1, $2, $3, $4, $5, $6, $7)`,
    [
      `test-item-${randomUUID()}`,
      id,
      productId,
      productName,
      unitPriceCents,
      quantity,
      lineTotalCents,
    ],
  );

  created.orders.push(id);

  return id;
}

async function stockOf(productId: string): Promise<number> {
  const result = await getDb().query<{ stock: number }>(
    "select stock from food_store_products where id = $1",
    [productId],
  );

  return result.rows[0]?.stock ?? -1;
}

describe.skipIf(!hasTestDb)("comportamiento administrativo (#6, #12, #13 y #14)", () => {
  let employee: CurrentUser;
  let customer: CurrentUser;
  let superadmin: CurrentUser;
  let categoryId: string;

  beforeAll(async () => {
    employee = await insertUser("empleado");
    customer = await insertUser("cliente");
    superadmin = await insertUser("superadmin");

    const category = await createCategory(superadmin, {
      name: `Categoría de prueba ${randomUUID().slice(0, 8)}`,
      description: "Datos temporales de prueba",
    });

    categoryId = category.id;
    created.categories.push(category.id);
  });

  afterAll(async () => {
    const db = getDb();

    if (created.orders.length > 0) {
      await db.query(
        "delete from food_store_orders where id = any($1::text[])",
        [created.orders],
      );
    }

    if (created.products.length > 0) {
      await db.query(
        "delete from food_store_products where id = any($1::text[])",
        [created.products],
      );
    }

    if (created.categories.length > 0) {
      await db.query(
        "delete from food_store_categories where id = any($1::text[])",
        [created.categories],
      );
    }

    if (created.users.length > 0) {
      await db.query(
        "delete from food_store_users where id = any($1::text[])",
        [created.users],
      );
    }

    await db.end();
  });

  async function createTestProduct(stock: number, minStock = 0) {
    const product = await createProduct(superadmin, {
      categoryId,
      name: `Producto de prueba ${randomUUID().slice(0, 8)}`,
      priceCents: 1_000,
      stock,
      minStock,
    });

    created.products.push(product.id);

    return product;
  }

  it("gestiona el catálogo solo con permisos de empleado o superadmin", async () => {
    const product = await createTestProduct(1, 2);

    expect(product.lowStock).toBe(true);

    await expect(
      createProduct(customer, {
        name: "No permitido",
        priceCents: 100,
        stock: 1,
        minStock: 0,
      }),
    ).rejects.toBeInstanceOf(AuthorizationError);

    const visible = await listProducts(employee, { includeInactive: true });
    expect(visible.some((item) => item.id === product.id)).toBe(true);

    await expect(listProducts(customer)).rejects.toBeInstanceOf(
      AuthorizationError,
    );

    const updated = await updateProduct(employee, product.id, {
      categoryId,
      name: `${product.name} actualizado`,
      description: "Descripción actualizada",
      priceCents: 1_500,
      stock: 4,
      minStock: 1,
    });

    expect(updated.priceCents).toBe(1_500);
    expect(updated.stock).toBe(4);
    expect(updated.lowStock).toBe(false);

    await deleteProduct(employee, product.id);

    const activeProducts = await listProducts(employee);
    expect(activeProducts.some((item) => item.id === product.id)).toBe(false);

    const allProducts = await listProducts(employee, { includeInactive: true });
    expect(
      allProducts.find((item) => item.id === product.id)?.isActive,
    ).toBe(false);

    const categoryName = `Categoría temporal ${randomUUID().slice(0, 8)}`;
    const category = await createCategory(employee, {
      name: categoryName,
      slug: `cat-temp-${randomUUID().slice(0, 8)}`,
    });
    created.categories.push(category.id);

    const renamed = await updateCategory(superadmin, category.id, {
      name: `${categoryName} editada`,
      slug: category.slug,
    });
    expect(renamed.name).toBe(`${categoryName} editada`);

    await deleteCategory(employee, category.id);

    const allCategories = await listCategories(employee, {
      includeInactive: true,
    });
    expect(
      allCategories.find((item) => item.id === category.id)?.isActive,
    ).toBe(false);

    await expect(
      createCategory(employee, {
        name: "Slug repetido",
        slug: category.slug,
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("avanza solo al estado siguiente y registra historial", async () => {
    const product = await createTestProduct(10);
    const orderId = await insertOrder({
      customerId: customer.id,
      status: "confirmado",
      productId: product.id,
      productName: product.name,
      unitPriceCents: 1_000,
      quantity: 2,
    });

    await expect(
      advanceOrder(employee, orderId, "en_camino"),
    ).rejects.toBeInstanceOf(ConflictError);

    const preparing = await advanceOrder(
      employee,
      orderId,
      "en_preparacion",
    );
    expect(preparing.status).toBe("en_preparacion");

    const onTheWay = await advanceOrder(employee, orderId, "en_camino");
    expect(onTheWay.status).toBe("en_camino");

    const delivered = await advanceOrder(employee, orderId, "entregado");
    expect(delivered.status).toBe("entregado");
    expect(delivered.history.map((entry) => entry.toStatus)).toEqual([
      "en_preparacion",
      "en_camino",
      "entregado",
    ]);

    await expect(
      cancelOrder(employee, orderId, "Intento inválido"),
    ).rejects.toBeInstanceOf(ConflictError);

    expect(await stockOf(product.id)).toBe(10);

    const listed = await listOrders(employee, { status: "entregado" });
    expect(listed.some((order) => order.id === orderId)).toBe(true);
  });

  it("cancela un pedido confirmado y devuelve stock una sola vez", async () => {
    const product = await createTestProduct(10);
    const orderId = await insertOrder({
      customerId: customer.id,
      status: "confirmado",
      productId: product.id,
      productName: product.name,
      unitPriceCents: 1_000,
      quantity: 2,
    });

    const cancelled = await cancelOrder(
      employee,
      orderId,
      "El cliente cambió de opinión",
    );

    expect(cancelled.status).toBe("cancelado");
    expect(cancelled.cancelReason).toBe("El cliente cambió de opinión");
    expect(await stockOf(product.id)).toBe(12);

    await expect(
      cancelOrder(employee, orderId, "Segundo intento"),
    ).rejects.toBeInstanceOf(ConflictError);

    expect(await stockOf(product.id)).toBe(12);
    expect(cancelled.history.at(-1)?.toStatus).toBe("cancelado");
  });

  it("reserva la cancelación en preparación o en camino al Superadmin", async () => {
    const product = await createTestProduct(10);
    const orderId = await insertOrder({
      customerId: customer.id,
      status: "confirmado",
      productId: product.id,
      productName: product.name,
      unitPriceCents: 1_000,
      quantity: 2,
    });

    await advanceOrder(employee, orderId, "en_preparacion");

    await expect(
      cancelOrder(employee, orderId, "Sin autorización"),
    ).rejects.toBeInstanceOf(AuthorizationError);

    const orders = await listOrders(employee, { status: "en_preparacion" });
    expect(
      orders.find((order) => order.id === orderId)?.status,
    ).toBe("en_preparacion");
    expect(await stockOf(product.id)).toBe(10);

    const cancelled = await cancelOrder(
      superadmin,
      orderId,
      "Pedido demorado",
    );
    expect(cancelled.status).toBe("cancelado");
    expect(await stockOf(product.id)).toBe(12);
  });

  it("no repone stock al cancelar un pedido pendiente de pago", async () => {
    const product = await createTestProduct(10);
    const orderId = await insertOrder({
      customerId: customer.id,
      status: "pendiente",
      productId: product.id,
      productName: product.name,
      unitPriceCents: 1_000,
      quantity: 3,
    });

    const cancelled = await cancelOrder(
      employee,
      orderId,
      "Pedido abandonado",
    );

    expect(cancelled.status).toBe("cancelado");
    expect(await stockOf(product.id)).toBe(10);
  });

  it("protege la propia cuenta y permite administrar otros usuarios", async () => {
    const secondSuperadmin = await insertUser("superadmin");

    await expect(
      updateUserRole(superadmin, superadmin.id, "cliente"),
    ).rejects.toBeInstanceOf(ConflictError);

    await expect(
      setUserActive(superadmin, superadmin.id, false),
    ).rejects.toBeInstanceOf(ConflictError);

    const demoted = await updateUserRole(
      superadmin,
      secondSuperadmin.id,
      "empleado",
    );
    expect(demoted.role).toBe("empleado");

    const deactivated = await setUserActive(
      superadmin,
      secondSuperadmin.id,
      false,
    );
    expect(deactivated.isActive).toBe(false);

    const reactivated = await setUserActive(
      superadmin,
      secondSuperadmin.id,
      true,
    );
    expect(reactivated.isActive).toBe(true);
  });

  it("describe los estados conocidos del pedido", () => {
    expect(ORDER_STATUS_LABELS.en_preparacion).toBe("En preparación");
  });
});
