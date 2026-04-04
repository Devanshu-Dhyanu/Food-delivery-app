/*
  # Add delivery feedback collection

  1. New tables
    - `delivery_feedback`
      - Stores a single post-delivery feedback record per order
      - Allows star-only submissions
      - Persists dismissed prompts with `skipped_at`

  2. Security
    - Users can view their own delivery feedback
    - Users can insert feedback only for their own delivered orders
*/

CREATE TABLE IF NOT EXISTS public.delivery_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer,
  feedback_text text,
  skipped_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT delivery_feedback_order_id_key UNIQUE (order_id),
  CONSTRAINT delivery_feedback_rating_range_check CHECK (
    rating IS NULL OR rating BETWEEN 1 AND 5
  ),
  CONSTRAINT delivery_feedback_submission_or_skip_check CHECK (
    (rating IS NOT NULL AND skipped_at IS NULL)
    OR (rating IS NULL AND skipped_at IS NOT NULL)
  ),
  CONSTRAINT delivery_feedback_text_requires_rating_check CHECK (
    feedback_text IS NULL OR rating IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS delivery_feedback_user_id_idx
  ON public.delivery_feedback(user_id);

CREATE INDEX IF NOT EXISTS delivery_feedback_order_id_idx
  ON public.delivery_feedback(order_id);

ALTER TABLE public.delivery_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own delivery feedback" ON public.delivery_feedback;
DROP POLICY IF EXISTS "Users can create own delivery feedback" ON public.delivery_feedback;

CREATE POLICY "Users can view own delivery feedback"
  ON public.delivery_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own delivery feedback"
  ON public.delivery_feedback FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.orders
      WHERE orders.id = delivery_feedback.order_id
        AND orders.user_id = auth.uid()
        AND orders.status = 'delivered'
    )
  );
