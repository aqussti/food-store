ALTER TABLE food_store_users ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT '';
ALTER TABLE food_store_users ADD COLUMN IF NOT EXISTS address text NOT NULL DEFAULT '';
ALTER TABLE food_store_orders ADD COLUMN IF NOT EXISTS checkout_key text;
CREATE UNIQUE INDEX IF NOT EXISTS food_store_checkout_unique ON food_store_orders(customer_id, checkout_key);
CREATE TABLE IF NOT EXISTS food_store_payment_attempts (
 id text PRIMARY KEY, order_id text NOT NULL REFERENCES food_store_orders(id) ON DELETE CASCADE,
 approved boolean NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
