-- Fundación compartida para las tareas #6, #12, #13 y #14 de Fausto.
-- Es aditiva e idempotente: no elimina tablas ni datos existentes.
-- Requiere las tablas de autenticación de #5 (Better Auth) ya creadas.

DO $$
BEGIN
  IF to_regclass('public.food_store_users') IS NULL THEN
    RAISE EXCEPTION 'Falta public.food_store_users. Ejecutá primero las migraciones de autenticación de #5.';
  END IF;
END
$$;

ALTER TABLE public.food_store_users
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

ALTER TABLE public.food_store_users
  ALTER COLUMN role SET DEFAULT 'cliente';

UPDATE public.food_store_users
SET role = 'cliente'
WHERE role IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'food_store_users_role_check'
      AND conrelid = 'public.food_store_users'::regclass
  ) THEN
    ALTER TABLE public.food_store_users
      ADD CONSTRAINT food_store_users_role_check
      CHECK (role IS NULL OR role IN ('cliente', 'empleado', 'superadmin'))
      NOT VALID;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS food_store_users_role_idx
  ON public.food_store_users (role);

CREATE TABLE IF NOT EXISTS public.food_store_categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.food_store_products (
  id text PRIMARY KEY,
  category_id text REFERENCES public.food_store_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  min_stock integer NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.food_store_orders (
  id text PRIMARY KEY,
  customer_id text NOT NULL REFERENCES public.food_store_users(id),
  status text NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pendiente', 'confirmado', 'en_preparacion', 'en_camino', 'entregado', 'cancelado')),
  subtotal_cents integer NOT NULL CHECK (subtotal_cents >= 0),
  shipping_cents integer NOT NULL DEFAULT 0 CHECK (shipping_cents >= 0),
  total_cents integer NOT NULL CHECK (total_cents >= 0),
  shipping_address text,
  payment_reference text,
  cancel_reason text,
  cancelled_by text REFERENCES public.food_store_users(id) ON DELETE SET NULL,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.food_store_order_items (
  id text PRIMARY KEY,
  order_id text NOT NULL REFERENCES public.food_store_orders(id) ON DELETE CASCADE,
  product_id text REFERENCES public.food_store_products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  unit_price_cents integer NOT NULL CHECK (unit_price_cents >= 0),
  quantity integer NOT NULL CHECK (quantity > 0),
  line_total_cents integer NOT NULL CHECK (line_total_cents >= 0)
);

CREATE TABLE IF NOT EXISTS public.food_store_order_status_history (
  id text PRIMARY KEY,
  order_id text NOT NULL REFERENCES public.food_store_orders(id) ON DELETE CASCADE,
  from_status text CHECK (from_status IS NULL OR from_status IN ('pendiente', 'confirmado', 'en_preparacion', 'en_camino', 'entregado', 'cancelado')),
  to_status text NOT NULL CHECK (to_status IN ('pendiente', 'confirmado', 'en_preparacion', 'en_camino', 'entregado', 'cancelado')),
  changed_by text REFERENCES public.food_store_users(id) ON DELETE SET NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS food_store_products_category_idx
  ON public.food_store_products (category_id);

CREATE INDEX IF NOT EXISTS food_store_products_low_stock_idx
  ON public.food_store_products (stock, min_stock)
  WHERE is_active;

CREATE INDEX IF NOT EXISTS food_store_orders_status_idx
  ON public.food_store_orders (status);

CREATE INDEX IF NOT EXISTS food_store_orders_customer_idx
  ON public.food_store_orders (customer_id);

CREATE INDEX IF NOT EXISTS food_store_order_items_order_idx
  ON public.food_store_order_items (order_id);

CREATE INDEX IF NOT EXISTS food_store_order_status_history_order_idx
  ON public.food_store_order_status_history (order_id, created_at);
