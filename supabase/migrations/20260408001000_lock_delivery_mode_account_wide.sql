/*
  # Lock delivery mode account-wide

  1. Schema updates
    - Adds `account_mode` to `delivery_partner_profiles`
    - Uses account mode as the single source of truth across devices

  2. Backfill
    - Existing online partners are migrated to `delivery`
    - Everyone else defaults to `customer`
*/

ALTER TABLE public.delivery_partner_profiles
ADD COLUMN IF NOT EXISTS account_mode text NOT NULL DEFAULT 'customer';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'delivery_partner_profiles_account_mode_check'
  ) THEN
    ALTER TABLE public.delivery_partner_profiles
    ADD CONSTRAINT delivery_partner_profiles_account_mode_check
    CHECK (account_mode IN ('customer', 'delivery'));
  END IF;
END $$;

UPDATE public.delivery_partner_profiles
SET account_mode = CASE
  WHEN is_online THEN 'delivery'
  ELSE 'customer'
END
WHERE account_mode NOT IN ('customer', 'delivery')
   OR account_mode IS NULL;

CREATE INDEX IF NOT EXISTS delivery_partner_profiles_account_mode_idx
  ON public.delivery_partner_profiles(account_mode);
