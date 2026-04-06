/*
  # Create Vajra Wallet system

  1. New tables
    - `wallet_accounts`
      - Stores each user's current in-app wallet balance
    - `wallet_transactions`
      - Stores top-ups, debits, refunds, and manual adjustments

  2. New functions
    - `create_wallet_paid_order`
      - Atomically checks wallet balance, creates order + order items, records payment, and debits wallet
    - `credit_wallet_topup`
      - Atomically credits wallet after a successful Cashfree top-up verification

  3. Security
    - Users can view only their own wallet data
    - Wallet mutations happen only through RPC functions
*/

CREATE TABLE IF NOT EXISTS public.wallet_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance numeric(12,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  currency text NOT NULL DEFAULT 'INR',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_account_id uuid NOT NULL REFERENCES public.wallet_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_transaction_id uuid REFERENCES public.payment_transactions(id) ON DELETE SET NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  transaction_type text NOT NULL CHECK (
    transaction_type IN ('topup', 'debit', 'credit', 'refund', 'adjustment')
  ),
  direction text NOT NULL CHECK (direction IN ('credit', 'debit')),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  balance_after numeric(12,2) NOT NULL CHECK (balance_after >= 0),
  status text NOT NULL DEFAULT 'success' CHECK (status IN ('pending', 'success', 'failed')),
  topup_order_id text UNIQUE,
  gateway_payment_id text,
  note text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wallet_accounts_user_id_idx
  ON public.wallet_accounts(user_id);

CREATE INDEX IF NOT EXISTS wallet_transactions_user_id_idx
  ON public.wallet_transactions(user_id);

CREATE INDEX IF NOT EXISTS wallet_transactions_order_id_idx
  ON public.wallet_transactions(order_id);

CREATE INDEX IF NOT EXISTS wallet_transactions_created_at_idx
  ON public.wallet_transactions(created_at DESC);

ALTER TABLE public.wallet_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own wallet account" ON public.wallet_accounts;
DROP POLICY IF EXISTS "Users can view own wallet transactions" ON public.wallet_transactions;

CREATE POLICY "Users can view own wallet account"
  ON public.wallet_accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own wallet transactions"
  ON public.wallet_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_wallet_accounts_updated_at ON public.wallet_accounts;
DROP TRIGGER IF EXISTS set_wallet_transactions_updated_at ON public.wallet_transactions;

CREATE TRIGGER set_wallet_accounts_updated_at
BEFORE UPDATE ON public.wallet_accounts
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_wallet_transactions_updated_at
BEFORE UPDATE ON public.wallet_transactions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.create_wallet_paid_order(
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
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_item jsonb;
  v_user_id uuid;
  v_restaurant_is_open boolean;
  v_wallet_account_id uuid;
  v_wallet_balance numeric(12,2);
  v_balance_after numeric(12,2);
  v_payment_transaction_id uuid;
  v_wallet_transaction_id uuid;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to use Vajra Wallet.';
  END IF;

  IF COALESCE(BTRIM(p_customer_name), '') = '' THEN
    RAISE EXCEPTION 'Customer name is required.';
  END IF;

  IF LENGTH(BTRIM(p_customer_name)) > 100 THEN
    RAISE EXCEPTION 'Customer name is too long.';
  END IF;

  IF COALESCE(BTRIM(p_customer_phone), '') = '' THEN
    RAISE EXCEPTION 'Customer phone is required.';
  END IF;

  IF LENGTH(BTRIM(p_customer_phone)) > 20 THEN
    RAISE EXCEPTION 'Customer phone is too long.';
  END IF;

  IF COALESCE(BTRIM(p_delivery_address), '') = '' THEN
    RAISE EXCEPTION 'Delivery address is required.';
  END IF;

  IF LENGTH(BTRIM(p_delivery_address)) > 500 THEN
    RAISE EXCEPTION 'Delivery address is too long.';
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

  IF p_total_amount IS NULL OR p_total_amount <= 0 THEN
    RAISE EXCEPTION 'Total amount must be greater than zero.';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item.';
  END IF;

  INSERT INTO public.wallet_accounts (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT id, balance
  INTO v_wallet_account_id, v_wallet_balance
  FROM public.wallet_accounts
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF v_wallet_account_id IS NULL THEN
    RAISE EXCEPTION 'Wallet account could not be created.';
  END IF;

  IF COALESCE(v_wallet_balance, 0) < p_total_amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance.';
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
    BTRIM(p_restaurant_name),
    BTRIM(p_customer_name),
    BTRIM(p_customer_phone),
    BTRIM(p_delivery_address),
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

  v_balance_after := v_wallet_balance - p_total_amount;

  INSERT INTO public.payment_transactions (
    user_id,
    order_id,
    amount,
    currency,
    payment_method,
    payment_gateway_id,
    status,
    gateway_response
  )
  VALUES (
    v_user_id,
    v_order_id,
    p_total_amount,
    'INR',
    'vajra_wallet',
    CONCAT('wallet-order-', v_order_id::text),
    'success',
    jsonb_build_object(
      'source', 'vajra_wallet',
      'balance_before', v_wallet_balance,
      'balance_after', v_balance_after
    )
  )
  RETURNING id INTO v_payment_transaction_id;

  UPDATE public.wallet_accounts
  SET balance = v_balance_after
  WHERE id = v_wallet_account_id;

  INSERT INTO public.wallet_transactions (
    wallet_account_id,
    user_id,
    payment_transaction_id,
    order_id,
    transaction_type,
    direction,
    amount,
    balance_after,
    status,
    note,
    metadata
  )
  VALUES (
    v_wallet_account_id,
    v_user_id,
    v_payment_transaction_id,
    v_order_id,
    'debit',
    'debit',
    p_total_amount,
    v_balance_after,
    'success',
    'Order paid with Vajra Wallet',
    jsonb_build_object(
      'restaurant_id', p_restaurant_id,
      'restaurant_name', BTRIM(p_restaurant_name)
    )
  )
  RETURNING id INTO v_wallet_transaction_id;

  UPDATE public.orders
  SET
    payment_id = v_payment_transaction_id,
    payment_status = 'success',
    payment_method = 'vajra_wallet'
  WHERE id = v_order_id;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'payment_transaction_id', v_payment_transaction_id,
    'wallet_transaction_id', v_wallet_transaction_id,
    'balance_after', v_balance_after
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_wallet_paid_order(
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

GRANT EXECUTE ON FUNCTION public.create_wallet_paid_order(
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

CREATE OR REPLACE FUNCTION public.credit_wallet_topup(
  p_gateway_order_id text,
  p_gateway_payment_id text,
  p_amount numeric,
  p_gateway_response jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_wallet_account_id uuid;
  v_wallet_balance numeric(12,2);
  v_balance_after numeric(12,2);
  v_existing_transaction_id uuid;
  v_existing_payment_transaction_id uuid;
  v_payment_transaction_id uuid;
  v_wallet_transaction_id uuid;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to top up Vajra Wallet.';
  END IF;

  IF COALESCE(BTRIM(p_gateway_order_id), '') = '' THEN
    RAISE EXCEPTION 'Gateway order id is required.';
  END IF;

  IF COALESCE(BTRIM(p_gateway_payment_id), '') = '' THEN
    RAISE EXCEPTION 'Gateway payment id is required.';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Top-up amount must be greater than zero.';
  END IF;

  INSERT INTO public.wallet_accounts (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT id, balance
  INTO v_wallet_account_id, v_wallet_balance
  FROM public.wallet_accounts
  WHERE user_id = v_user_id
  FOR UPDATE;

  SELECT id, payment_transaction_id
  INTO v_existing_transaction_id, v_existing_payment_transaction_id
  FROM public.wallet_transactions
  WHERE user_id = v_user_id
    AND topup_order_id = p_gateway_order_id
    AND status = 'success'
  LIMIT 1;

  IF v_existing_transaction_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'payment_transaction_id', v_existing_payment_transaction_id,
      'wallet_transaction_id', v_existing_transaction_id,
      'balance_after', v_wallet_balance
    );
  END IF;

  v_balance_after := COALESCE(v_wallet_balance, 0) + p_amount;

  INSERT INTO public.payment_transactions (
    user_id,
    amount,
    currency,
    payment_method,
    payment_gateway_id,
    status,
    gateway_response
  )
  VALUES (
    v_user_id,
    p_amount,
    'INR',
    'vajra_wallet_topup',
    p_gateway_payment_id,
    'success',
    COALESCE(p_gateway_response, '{}'::jsonb)
  )
  RETURNING id INTO v_payment_transaction_id;

  UPDATE public.wallet_accounts
  SET balance = v_balance_after
  WHERE id = v_wallet_account_id;

  INSERT INTO public.wallet_transactions (
    wallet_account_id,
    user_id,
    payment_transaction_id,
    transaction_type,
    direction,
    amount,
    balance_after,
    status,
    topup_order_id,
    gateway_payment_id,
    note,
    metadata
  )
  VALUES (
    v_wallet_account_id,
    v_user_id,
    v_payment_transaction_id,
    'topup',
    'credit',
    p_amount,
    v_balance_after,
    'success',
    p_gateway_order_id,
    p_gateway_payment_id,
    'Wallet top-up via Cashfree',
    COALESCE(p_gateway_response, '{}'::jsonb)
  )
  RETURNING id INTO v_wallet_transaction_id;

  RETURN jsonb_build_object(
    'payment_transaction_id', v_payment_transaction_id,
    'wallet_transaction_id', v_wallet_transaction_id,
    'balance_after', v_balance_after
  );
END;
$$;

REVOKE ALL ON FUNCTION public.credit_wallet_topup(
  text,
  text,
  numeric,
  jsonb
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.credit_wallet_topup(
  text,
  text,
  numeric,
  jsonb
) TO authenticated;
