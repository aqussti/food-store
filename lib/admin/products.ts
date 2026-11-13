import { randomUUID } from "node:crypto";

import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/auth/roles";
import type { CurrentUser } from "@/lib/auth/types";
import { ConflictError, NotFoundError, ValidationError } from "./errors";
import {
  booleanValue,
  nonNegativeCents,
  nonNegativeInteger,
  optionalString,
  requiredString,
  slugify,
} from "./validation";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Product = {
  id: string;
  categoryId: string | null;
  categoryName: string | null;
  name: string;
  description: string | null;
  priceCents: number;
  stock: number;
  minStock: number;
  imageUrl: string | null;
  isActive: boolean;
  lowStock: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CategoryInput = {
  name: string;
  slug?: string | null;
  description?: string | null;
  isActive?: boolean;
};

export type ProductInput = {
  categoryId?: string | null;
  name: string;
  description?: string | null;
  priceCents: number;
  stock: number;
  minStock: number;
  imageUrl?: string | null;
  isActive?: boolean;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

type ProductRow = {
  id: string;
  category_id: string | null;
  category_name: string | null;
  name: string;
  description: string | null;
  price_cents: number;
  stock: number;
  min_stock: number;
  image_url: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: row.category_name,
    name: row.name,
    description: row.description,
    priceCents: row.price_cents,
    stock: row.stock,
    minStock: row.min_stock,
    imageUrl: row.image_url,
    isActive: row.is_active,
    lowStock: row.stock <= row.min_stock,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

function catalogActor(actor: CurrentUser | null): CurrentUser {
  return requireRole(actor, ["empleado", "superadmin"]);
}

function categoryValues(input: CategoryInput) {
  const name = requiredString(input.name, "El nombre", 120);
  const slugSource = optionalString(input.slug, "El slug", 80);
  const slug = slugSource ? slugify(slugSource) : slugify(name);

  return {
    name,
    slug,
    description: optionalString(input.description, "La descripción", 2_000),
    isActive: booleanValue(input.isActive, true),
  };
}

function productValues(input: ProductInput) {
  const name = requiredString(input.name, "El nombre", 160);
  const categoryId = optionalString(input.categoryId, "La categoría", 100);

  return {
    name,
    categoryId,
    description: optionalString(input.description, "La descripción", 2_000),
    priceCents: nonNegativeCents(input.priceCents, "El precio"),
    stock: nonNegativeInteger(input.stock, "El stock"),
    minStock: nonNegativeInteger(input.minStock, "El stock mínimo"),
    imageUrl: optionalString(input.imageUrl, "La URL de imagen", 2_000),
    isActive: booleanValue(input.isActive, true),
  };
}

async function ensureCategoryExists(categoryId: string | null): Promise<void> {
  if (!categoryId) {
    return;
  }

  const result = await getDb().query(
    "select 1 from food_store_categories where id = $1",
    [categoryId],
  );

  if (!result.rowCount) {
    throw new ValidationError("La categoría seleccionada no existe.");
  }
}

export async function listCategories(
  actor: CurrentUser | null,
  options: { includeInactive?: boolean } = {},
): Promise<Category[]> {
  catalogActor(actor);

  const result = await getDb().query<CategoryRow>(
    `select id, name, slug, description, is_active, created_at, updated_at
     from food_store_categories
     where $1::boolean or is_active
     order by name asc`,
    [options.includeInactive === true],
  );

  return result.rows.map(mapCategory);
}

export async function createCategory(
  actor: CurrentUser | null,
  input: CategoryInput,
): Promise<Category> {
  catalogActor(actor);
  const values = categoryValues(input);

  try {
    const result = await getDb().query<CategoryRow>(
      `insert into food_store_categories (id, name, slug, description, is_active)
       values ($1, $2, $3, $4, $5)
       returning id, name, slug, description, is_active, created_at, updated_at`,
      [randomUUID(), values.name, values.slug, values.description, values.isActive],
    );

    return mapCategory(result.rows[0]);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError("Ya existe una categoría con ese slug.");
    }

    throw error;
  }
}

export async function updateCategory(
  actor: CurrentUser | null,
  categoryId: string,
  input: CategoryInput,
): Promise<Category> {
  catalogActor(actor);
  const values = categoryValues(input);

  try {
    const result = await getDb().query<CategoryRow>(
      `update food_store_categories
       set name = $2, slug = $3, description = $4, is_active = $5, updated_at = now()
       where id = $1
       returning id, name, slug, description, is_active, created_at, updated_at`,
      [
        categoryId,
        values.name,
        values.slug,
        values.description,
        values.isActive,
      ],
    );

    if (!result.rows[0]) {
      throw new NotFoundError("La categoría no existe.");
    }

    return mapCategory(result.rows[0]);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError("Ya existe una categoría con ese slug.");
    }

    throw error;
  }
}

export async function deleteCategory(
  actor: CurrentUser | null,
  categoryId: string,
): Promise<void> {
  catalogActor(actor);

  const result = await getDb().query(
    `update food_store_categories
     set is_active = false, updated_at = now()
     where id = $1`,
    [categoryId],
  );

  if (!result.rowCount) {
    throw new NotFoundError("La categoría no existe.");
  }
}

export async function listProducts(
  actor: CurrentUser | null,
  options: {
    includeInactive?: boolean;
    lowStockOnly?: boolean;
    search?: string;
  } = {},
): Promise<Product[]> {
  catalogActor(actor);

  const result = await getDb().query<ProductRow>(
    `select p.id, p.category_id, c.name as category_name, p.name, p.description,
            p.price_cents, p.stock, p.min_stock, p.image_url, p.is_active,
            p.created_at, p.updated_at
     from food_store_products p
     left join food_store_categories c on c.id = p.category_id
     where ($1::boolean or p.is_active)
       and (not $2::boolean or p.stock <= p.min_stock)
       and ($3::text is null or p.name ilike '%' || $3 || '%')
     order by p.is_active desc, p.name asc`,
    [
      options.includeInactive === true,
      options.lowStockOnly === true,
      options.search?.trim() || null,
    ],
  );

  return result.rows.map(mapProduct);
}

export async function createProduct(
  actor: CurrentUser | null,
  input: ProductInput,
): Promise<Product> {
  catalogActor(actor);
  const values = productValues(input);
  await ensureCategoryExists(values.categoryId);

  const result = await getDb().query<ProductRow>(
    `insert into food_store_products
       (id, category_id, name, description, price_cents, stock, min_stock, image_url, is_active)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     returning id, category_id, null::text as category_name, name, description,
               price_cents, stock, min_stock, image_url, is_active, created_at, updated_at`,
    [
      randomUUID(),
      values.categoryId,
      values.name,
      values.description,
      values.priceCents,
      values.stock,
      values.minStock,
      values.imageUrl,
      values.isActive,
    ],
  );

  return mapProduct(result.rows[0]);
}

export async function updateProduct(
  actor: CurrentUser | null,
  productId: string,
  input: ProductInput,
): Promise<Product> {
  catalogActor(actor);
  const values = productValues(input);
  await ensureCategoryExists(values.categoryId);

  const result = await getDb().query<ProductRow>(
    `update food_store_products p
     set category_id = $2, name = $3, description = $4, price_cents = $5,
         stock = $6, min_stock = $7, image_url = $8, is_active = $9,
         updated_at = now()
     where p.id = $1
     returning p.id, p.category_id,
               (select c.name from food_store_categories c where c.id = p.category_id) as category_name,
               p.name, p.description, p.price_cents, p.stock, p.min_stock,
               p.image_url, p.is_active, p.created_at, p.updated_at`,
    [
      productId,
      values.categoryId,
      values.name,
      values.description,
      values.priceCents,
      values.stock,
      values.minStock,
      values.imageUrl,
      values.isActive,
    ],
  );

  if (!result.rows[0]) {
    throw new NotFoundError("El producto no existe.");
  }

  return mapProduct(result.rows[0]);
}

export async function deleteProduct(
  actor: CurrentUser | null,
  productId: string,
): Promise<void> {
  catalogActor(actor);

  const result = await getDb().query(
    `update food_store_products
     set is_active = false, updated_at = now()
     where id = $1`,
    [productId],
  );

  if (!result.rowCount) {
    throw new NotFoundError("El producto no existe.");
  }
}

export async function countLowStockProducts(
  actor: CurrentUser | null,
): Promise<number> {
  catalogActor(actor);

  const result = await getDb().query<{ count: string }>(
    `select count(*)::text as count
     from food_store_products
     where is_active and stock <= min_stock`,
  );

  return Number(result.rows[0]?.count ?? 0);
}

export async function countActiveProducts(
  actor: CurrentUser | null,
): Promise<number> {
  catalogActor(actor);

  const result = await getDb().query<{ count: string }>(
    "select count(*)::text as count from food_store_products where is_active",
  );

  return Number(result.rows[0]?.count ?? 0);
}
