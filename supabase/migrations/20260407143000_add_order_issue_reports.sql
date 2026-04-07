/*
  # Add order issue reports

  1. New tables
    - `order_issue_reports`
      - Stores one post-delivery issue report per order
      - Supports refund review requests

  2. Security
    - Users can view their own issue reports
    - Users can create issue reports only for their own delivered orders
*/

CREATE TABLE IF NOT EXISTS public.order_issue_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  issue_type text NOT NULL,
  description text NOT NULL,
  refund_requested boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'open',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT order_issue_reports_order_id_key UNIQUE (order_id),
  CONSTRAINT order_issue_reports_issue_type_check CHECK (
    issue_type IN ('missing_item', 'wrong_order', 'late_delivery', 'other')
  ),
  CONSTRAINT order_issue_reports_status_check CHECK (
    status IN ('open', 'reviewing', 'resolved', 'refund_approved', 'refund_rejected')
  ),
  CONSTRAINT order_issue_reports_description_check CHECK (
    char_length(btrim(description)) >= 10
  )
);

CREATE INDEX IF NOT EXISTS order_issue_reports_user_id_idx
  ON public.order_issue_reports(user_id);

CREATE INDEX IF NOT EXISTS order_issue_reports_order_id_idx
  ON public.order_issue_reports(order_id);

ALTER TABLE public.order_issue_reports ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS set_order_issue_reports_updated_at ON public.order_issue_reports;

CREATE TRIGGER set_order_issue_reports_updated_at
BEFORE UPDATE ON public.order_issue_reports
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP POLICY IF EXISTS "Users can view own order issue reports" ON public.order_issue_reports;
DROP POLICY IF EXISTS "Users can create own order issue reports" ON public.order_issue_reports;

CREATE POLICY "Users can view own order issue reports"
  ON public.order_issue_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own order issue reports"
  ON public.order_issue_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.orders
      WHERE orders.id = order_issue_reports.order_id
        AND orders.user_id = auth.uid()
        AND orders.status = 'delivered'
    )
  );
