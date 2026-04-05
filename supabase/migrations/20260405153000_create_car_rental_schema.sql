/*
  # Create Car Rental Schema

  1. New tables
    - `rental_vehicles`
      - Stores rentable campus vehicles
    - `rental_bookings`
      - Stores user rental requests

  2. Security
    - Only authenticated users can view vehicles
    - Users can create and view only their own rental bookings

  3. Seed data
    - Adds a few sample vehicles so the module works immediately
*/

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.rental_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  seats integer NOT NULL DEFAULT 4,
  transmission text NOT NULL DEFAULT 'Manual',
  fuel_type text NOT NULL DEFAULT 'Petrol',
  price_per_hour numeric NOT NULL CHECK (price_per_hour >= 0),
  deposit_amount numeric NOT NULL DEFAULT 0 CHECK (deposit_amount >= 0),
  pickup_location text,
  availability_notes text,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rental_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL REFERENCES public.rental_vehicles(id) ON DELETE CASCADE,
  customer_name text NOT NULL CHECK (btrim(customer_name) <> ''),
  customer_phone text NOT NULL CHECK (btrim(customer_phone) <> ''),
  start_datetime timestamptz NOT NULL,
  end_datetime timestamptz NOT NULL,
  rental_hours numeric NOT NULL CHECK (rental_hours > 0),
  handoff_type text NOT NULL CHECK (handoff_type IN ('delivery_to_user', 'self_pickup')),
  terms_accepted boolean NOT NULL DEFAULT false,
  terms_accepted_at timestamptz,
  notes text,
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rental_bookings_valid_time_range CHECK (end_datetime > start_datetime)
);

CREATE INDEX IF NOT EXISTS rental_bookings_user_id_idx ON public.rental_bookings(user_id);
CREATE INDEX IF NOT EXISTS rental_bookings_vehicle_id_idx ON public.rental_bookings(vehicle_id);
CREATE INDEX IF NOT EXISTS rental_vehicles_is_available_idx ON public.rental_vehicles(is_available);

ALTER TABLE public.rental_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_bookings ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS set_rental_bookings_updated_at ON public.rental_bookings;

CREATE TRIGGER set_rental_bookings_updated_at
BEFORE UPDATE ON public.rental_bookings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP POLICY IF EXISTS "Authenticated users can view rental vehicles" ON public.rental_vehicles;
DROP POLICY IF EXISTS "Users can view own rental bookings" ON public.rental_bookings;
DROP POLICY IF EXISTS "Users can create own rental bookings" ON public.rental_bookings;

CREATE POLICY "Authenticated users can view rental vehicles"
  ON public.rental_vehicles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own rental bookings"
  ON public.rental_bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own rental bookings"
  ON public.rental_bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

INSERT INTO public.rental_vehicles (
  id,
  name,
  brand,
  description,
  image_url,
  seats,
  transmission,
  fuel_type,
  price_per_hour,
  deposit_amount,
  pickup_location,
  availability_notes,
  is_available
)
VALUES
  (
    '9d79df58-d7f4-4f73-9d79-4d5f6ad4c001',
    'Venue Campus Run',
    'Hyundai',
    'Compact campus-friendly SUV for short local rides, errands, and flexible hourly bookings.',
    '',
    5,
    'Manual',
    'Petrol',
    199,
    1500,
    'The Vajra rental desk, Main Gate',
    'Best for hostel pickup, market runs, and evening rentals.',
    true
  ),
  (
    '9d79df58-d7f4-4f73-9d79-4d5f6ad4c002',
    'Baleno City Lite',
    'Maruti Suzuki',
    'Smooth hatchback for practical campus-to-city travel with simple self-pickup support.',
    '',
    5,
    'Automatic',
    'Petrol',
    179,
    1200,
    'Block 34 parking bay',
    'Popular for self-pickup rentals and lighter daily use.',
    true
  ),
  (
    '9d79df58-d7f4-4f73-9d79-4d5f6ad4c003',
    'Nexon Weekend Flex',
    'Tata',
    'Comfort-focused SUV for longer bookings where users may want a pickup or delivery handoff.',
    '',
    5,
    'Manual',
    'Diesel',
    229,
    1800,
    'University parking zone near Main Gate',
    'Good for longer hourly blocks and family-size travel.',
    true
  )
ON CONFLICT (id) DO NOTHING;
