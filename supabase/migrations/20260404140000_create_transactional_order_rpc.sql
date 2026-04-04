/*
  # Create transactional order RPC

  1. New function
    - `create_order_with_items`
      - Inserts into `orders` and `order_items` in a single transaction
      - Uses the authenticated user from `auth.uid()`
      - Allows multiple orders, but prevents partial writes

  2. Security
    - Explicitly grants execute access to authenticated users only
*/

CREATE OR REPLACE FUNCTION public.create_order_with_items(
  p_customer_name text,
  p_customer_phone text,
  p_delivery_address text,
  p_restaurant_id uuid,
  p_restaurant_name text,
  p_subtotal_amount numeric,
  p_delivery_fee numeric,
  p_total_amount numeric,
  p_items jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_item jsonb;
  v_user_id uuid;
  v_restaurant_is_open boolean;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to place an order.';
  END IF;

  IF COALESCE(BTRIM(p_customer_name), '') = '' THEN
    RAISE EXCEPTION 'Customer name is required.';
  END IF;

  IF COALESCE(BTRIM(p_customer_phone), '') = '' THEN
    RAISE EXCEPTION 'Customer phone is required.';
  END IF;

  IF COALESCE(BTRIM(p_delivery_address), '') = '' THEN
    RAISE EXCEPTION 'Delivery address is required.';
  END IF;

  IF p_restaurant_id IS NULL THEN
    RAISE EXCEPTION 'Restaurant id is required.';
  END IF;

  IF COALESCE(BTRIM(p_restaurant_name), '') = '' THEN
    RAISE EXCEPTION 'Restaurant name is required.';
  END IF;

  SELECT is_open
  INTO v_restaurant_is_open
  FROM public.restaurants
  WHERE id = p_restaurant_id;

  IF v_restaurant_is_open IS NULL THEN
    RAISE EXCEPTION 'Restaurant not found.';
  END IF;

  IF v_restaurant_is_open = false THEN
    RAISE EXCEPTION 'This restaurant is currently closed.';
  END IF;

  IF p_subtotal_amount IS NULL OR p_subtotal_amount < 0 THEN
    RAISE EXCEPTION 'Subtotal amount must be zero or greater.';
  END IF;

  IF p_delivery_fee IS NULL OR p_delivery_fee < 0 THEN
    RAISE EXCEPTION 'Delivery fee must be zero or greater.';
  END IF;

  IF p_total_amount IS NULL OR p_total_amount < 0 THEN
    RAISE EXCEPTION 'Total amount must be zero or greater.';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item.';
  END IF;

  INSERT INTO public.orders (
    user_id,
    restaurant_id,
    restaurant_name,
    customer_name,
    customer_phone,
    delivery_address,
    subtotal_amount,
    delivery_fee,
    total_amount,
    status
  )
  VALUES (
    v_user_id,
    p_restaurant_id,
    p_restaurant_name,
    p_customer_name,
    p_customer_phone,
    p_delivery_address,
    p_subtotal_amount,
    p_delivery_fee,
    p_total_amount,
    'pending'
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN
    SELECT value
    FROM jsonb_array_elements(p_items)
  LOOP
    IF COALESCE(BTRIM(v_item->>'menu_item_id'), '') = '' THEN
      RAISE EXCEPTION 'Each order item must include menu_item_id.';
    END IF;

    IF COALESCE((v_item->>'quantity')::integer, 0) <= 0 THEN
      RAISE EXCEPTION 'Each order item must include a quantity greater than zero.';
    END IF;

    IF COALESCE((v_item->>'price')::numeric, -1) < 0 THEN
      RAISE EXCEPTION 'Each order item must include a valid price.';
    END IF;

    IF COALESCE(BTRIM(v_item->>'item_name'), '') = '' THEN
      RAISE EXCEPTION 'Each order item must include item_name.';
    END IF;

    INSERT INTO public.order_items (
      order_id,
      menu_item_id,
      quantity,
      price,
      item_name
    )
    VALUES (
      v_order_id,
      (v_item->>'menu_item_id')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'price')::numeric,
      v_item->>'item_name'
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_order_with_items(
  text,
  text,
  text,
  uuid,
  text,
  numeric,
  numeric,
  numeric,
  jsonb
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_order_with_items(
  text,
  text,
  text,
  uuid,
  text,
  numeric,
  numeric,
  numeric,
  jsonb
) TO authenticated;
