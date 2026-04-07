/*
  # Add order cancellation requests

  1. New tables
    - `order_cancellation_requests`
      - Stores one cancellation request per order
      - Allows users to request cancellation while order is pending or confirmed

  2. Security
    - Users can view their own cancellation requests
    - Users can create cancellation requests only for their own pending or confirmed orders
*/

CREATE TABLE IF NOT EXISTS public.order_cancellation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT order_cancellation_requests_order_id_key UNIQUE (order_id),
  CONSTRAINT order_cancellation_requests_status_check CHECK (
    status IN ('open', 'approved', 'rejected')
  ),
  CONSTRAINT order_cancellation_requests_reason_check CHECK (
    char_length(btrim(reason)) >= 10
  )
);

CREATE INDEX IF NOT EXISTS order_cancellation_requests_user_id_idx
  ON public.order_cancellation_requests(user_id);

CREATE INDEX IF NOT EXISTS order_cancellation_requests_order_id_idx
  ON public.order_cancellation_requests(order_id);

ALTER TABLE public.order_cancellation_requests ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS set_order_cancellation_requests_updated_at ON public.order_cancellation_requests;

CREATE TRIGGER set_order_cancellation_requests_updated_at
BEFORE UPDATE ON public.order_cancellation_requests
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP POLICY IF EXISTS "Users can view own order cancellation requests" ON public.order_cancellation_requests;
DROP POLICY IF EXISTS "Users can create own order cancellation requests" ON public.order_cancellation_requests;

CREATE POLICY "Users can view own order cancellation requests"
  ON public.order_cancellation_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own order cancellation requests"
  ON public.order_cancellation_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.orders
      WHERE orders.id = order_cancellation_requests.order_id
        AND orders.user_id = auth.uid()
        AND orders.status IN ('pending', 'confirmed')
    )
  );
