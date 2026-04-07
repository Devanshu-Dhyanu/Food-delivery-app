CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_name text NOT NULL CHECK (char_length(btrim(seller_name)) >= 2),
  seller_phone text NOT NULL CHECK (char_length(btrim(seller_phone)) >= 10),
  seller_avatar_url text,
  title text NOT NULL CHECK (char_length(btrim(title)) >= 5),
  description text NOT NULL CHECK (char_length(btrim(description)) >= 20),
  category text NOT NULL CHECK (
    category IN (
      'electronics',
      'furniture',
      'books',
      'fashion',
      'appliances',
      'cycles',
      'gaming',
      'study',
      'hostel-essentials',
      'other'
    )
  ),
  condition text NOT NULL CHECK (condition IN ('new', 'like_new', 'good', 'fair')),
  price numeric NOT NULL DEFAULT 0 CHECK (price >= 0),
  negotiable boolean NOT NULL DEFAULT false,
  location_label text NOT NULL CHECK (char_length(btrim(location_label)) >= 2),
  pickup_details text,
  image_urls text[] NOT NULL DEFAULT '{}'::text[],
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'reserved', 'sold', 'archived')),
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT marketplace_listings_image_count_check CHECK (coalesce(array_length(image_urls, 1), 0) <= 4)
);

CREATE INDEX IF NOT EXISTS marketplace_listings_user_id_idx
  ON public.marketplace_listings(user_id);

CREATE INDEX IF NOT EXISTS marketplace_listings_status_idx
  ON public.marketplace_listings(status);

CREATE INDEX IF NOT EXISTS marketplace_listings_category_idx
  ON public.marketplace_listings(category);

CREATE INDEX IF NOT EXISTS marketplace_listings_created_at_idx
  ON public.marketplace_listings(created_at DESC);

ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS set_marketplace_listings_updated_at ON public.marketplace_listings;

CREATE TRIGGER set_marketplace_listings_updated_at
BEFORE UPDATE ON public.marketplace_listings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP POLICY IF EXISTS "Users can view marketplace listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Users can create own marketplace listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Users can update own marketplace listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Users can delete own marketplace listings" ON public.marketplace_listings;

CREATE POLICY "Users can view marketplace listings"
  ON public.marketplace_listings FOR SELECT
  TO authenticated
  USING (status <> 'archived' OR auth.uid() = user_id);

CREATE POLICY "Users can create own marketplace listings"
  ON public.marketplace_listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own marketplace listings"
  ON public.marketplace_listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own marketplace listings"
  ON public.marketplace_listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
