/*
  # Add delivery partner mode

  1. New tables
    - `delivery_partner_profiles`
      - Stores delivery partner registration details and live availability

  2. Schema updates
    - Adds delivery assignment fields on `orders`

  3. Security
    - Allows registered delivery partners to view dispatchable orders
    - Allows delivery partners to accept and update only relevant orders
*/

CREATE TABLE IF NOT EXISTS public.delivery_partner_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(btrim(name)) >= 2),
  phone text NOT NULL CHECK (char_length(btrim(phone)) >= 10),
  gender text NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  partner_type text NOT NULL CHECK (partner_type IN ('hosteller', 'non_hosteller', 'teacher')),
  hostel_name text,
  block text,
  room_number text,
  building_number text,
  cabin_number text,
  area_label text,
  is_online boolean NOT NULL DEFAULT false,
  alert_sound_enabled boolean NOT NULL DEFAULT true,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT delivery_partner_profiles_user_id_key UNIQUE (user_id),
  CONSTRAINT delivery_partner_profiles_location_check CHECK (
    (
      partner_type = 'hosteller'
      AND char_length(coalesce(btrim(hostel_name), '')) >= 2
      AND char_length(coalesce(btrim(block), '')) >= 1
      AND char_length(coalesce(btrim(room_number), '')) >= 1
    )
    OR (
      partner_type = 'teacher'
      AND char_length(coalesce(btrim(building_number), '')) >= 1
      AND char_length(coalesce(btrim(cabin_number), '')) >= 1
    )
    OR (
      partner_type = 'non_hosteller'
      AND char_length(coalesce(btrim(area_label), '')) >= 2
    )
  )
);

CREATE INDEX IF NOT EXISTS delivery_partner_profiles_user_id_idx
  ON public.delivery_partner_profiles(user_id);

CREATE INDEX IF NOT EXISTS delivery_partner_profiles_online_idx
  ON public.delivery_partner_profiles(is_online);

ALTER TABLE public.delivery_partner_profiles ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS set_delivery_partner_profiles_updated_at ON public.delivery_partner_profiles;

CREATE TRIGGER set_delivery_partner_profiles_updated_at
BEFORE UPDATE ON public.delivery_partner_profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP POLICY IF EXISTS "Users can view own delivery partner profile" ON public.delivery_partner_profiles;
DROP POLICY IF EXISTS "Users can create own delivery partner profile" ON public.delivery_partner_profiles;
DROP POLICY IF EXISTS "Users can update own delivery partner profile" ON public.delivery_partner_profiles;
DROP POLICY IF EXISTS "Users can delete own delivery partner profile" ON public.delivery_partner_profiles;

CREATE POLICY "Users can view own delivery partner profile"
  ON public.delivery_partner_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own delivery partner profile"
  ON public.delivery_partner_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own delivery partner profile"
  ON public.delivery_partner_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own delivery partner profile"
  ON public.delivery_partner_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivery_partner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS delivery_partner_name text,
ADD COLUMN IF NOT EXISTS delivery_partner_phone text,
ADD COLUMN IF NOT EXISTS delivery_assignment_status text NOT NULL DEFAULT 'unassigned',
ADD COLUMN IF NOT EXISTS delivery_partner_accepted_at timestamptz,
ADD COLUMN IF NOT EXISTS delivery_picked_up_at timestamptz,
ADD COLUMN IF NOT EXISTS delivered_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_delivery_assignment_status_check'
  ) THEN
    ALTER TABLE public.orders
    ADD CONSTRAINT orders_delivery_assignment_status_check
    CHECK (delivery_assignment_status IN ('unassigned', 'assigned', 'picked_up', 'delivered'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS orders_delivery_partner_user_id_idx
  ON public.orders(delivery_partner_user_id);

CREATE INDEX IF NOT EXISTS orders_delivery_assignment_status_idx
  ON public.orders(delivery_assignment_status);

UPDATE public.orders
SET delivery_assignment_status = 'delivered'
WHERE status = 'delivered'
  AND delivery_assignment_status = 'unassigned';

UPDATE public.orders
SET delivered_at = COALESCE(delivered_at, updated_at)
WHERE status = 'delivered'
  AND delivered_at IS NULL;

UPDATE public.orders
SET delivery_picked_up_at = COALESCE(delivery_picked_up_at, updated_at)
WHERE status = 'out_for_delivery'
  AND delivery_picked_up_at IS NULL;

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create own order items" ON public.order_items;
DROP POLICY IF EXISTS "Delivery partners can update delivery orders" ON public.orders;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR (
      EXISTS (
        SELECT 1
        FROM public.delivery_partner_profiles
        WHERE delivery_partner_profiles.user_id = auth.uid()
      )
      AND (
        (
          delivery_partner_user_id IS NULL
          AND delivery_assignment_status = 'unassigned'
          AND status IN ('pending', 'confirmed', 'preparing')
        )
        OR delivery_partner_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create own orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Delivery partners can update delivery orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.delivery_partner_profiles
      WHERE delivery_partner_profiles.user_id = auth.uid()
    )
    AND (
      (
        delivery_partner_user_id IS NULL
        AND delivery_assignment_status = 'unassigned'
        AND status IN ('pending', 'confirmed', 'preparing')
      )
      OR delivery_partner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.delivery_partner_profiles
      WHERE delivery_partner_profiles.user_id = auth.uid()
    )
    AND (
      delivery_partner_user_id = auth.uid()
      OR (
        delivery_partner_user_id IS NULL
        AND delivery_assignment_status = 'unassigned'
        AND status IN ('pending', 'confirmed', 'preparing')
      )
    )
  );

CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.orders
      WHERE orders.id = order_items.order_id
        AND (
          orders.user_id = auth.uid()
          OR (
            EXISTS (
              SELECT 1
              FROM public.delivery_partner_profiles
              WHERE delivery_partner_profiles.user_id = auth.uid()
            )
            AND (
              (
                orders.delivery_partner_user_id IS NULL
                AND orders.delivery_assignment_status = 'unassigned'
                AND orders.status IN ('pending', 'confirmed', 'preparing')
              )
              OR orders.delivery_partner_user_id = auth.uid()
            )
          )
        )
    )
  );

CREATE POLICY "Users can create own order items"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );
