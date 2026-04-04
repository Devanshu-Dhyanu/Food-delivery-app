/*
  # Store restaurant snapshots and price breakdown on orders

  1. Schema updates
    - Adds restaurant information directly on `orders`
    - Stores subtotal and delivery fee separately while preserving final total

  2. Backfill
    - Fills subtotal and delivery fee for existing orders based on the current fixed fee flow
*/

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE SET NULL;

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS restaurant_name text;

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS subtotal_amount numeric;

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivery_fee numeric;

CREATE INDEX IF NOT EXISTS orders_restaurant_id_idx ON public.orders(restaurant_id);

UPDATE public.orders
SET
  subtotal_amount = COALESCE(subtotal_amount, GREATEST(total_amount - 20, 0)),
  delivery_fee = COALESCE(delivery_fee, 20)
WHERE subtotal_amount IS NULL
   OR delivery_fee IS NULL;
