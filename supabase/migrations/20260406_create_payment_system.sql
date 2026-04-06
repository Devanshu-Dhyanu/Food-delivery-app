/*
  # Payment System Tables for Cashfree Integration

  1. New tables:
    - payment_transactions: Stores all payment transaction records
    - payment_logs: Stores payment events and status updates
    - receipts: Stores payment receipts and invoice data

  2. Existing table updates:
    - Add payment-related columns to orders table
    - Add payment-related columns to rental_bookings table

  3. Security:
    - RLS policies for user-specific access
*/

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  rental_booking_id uuid REFERENCES public.rental_bookings(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'INR',
  payment_method text NOT NULL, -- 'upi', 'card', 'netbanking', 'wallet', 'bnpl', 'emi'
  payment_gateway_id text, -- Cashfree transaction ID
  status text NOT NULL DEFAULT 'pending', -- pending, processing, success, failed, refunded
  gateway_response jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'success', 'failed', 'refunded'))
);

-- Create payment_logs table
CREATE TABLE IF NOT EXISTS public.payment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_transaction_id uuid NOT NULL REFERENCES public.payment_transactions(id) ON DELETE CASCADE,
  event text NOT NULL, -- 'initiated', 'authorized', 'captured', 'failed', 'refund_initiated', 'refund_completed'
  event_details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Create receipts table
CREATE TABLE IF NOT EXISTS public.receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_transaction_id uuid NOT NULL REFERENCES public.payment_transactions(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  rental_booking_id uuid REFERENCES public.rental_bookings(id) ON DELETE SET NULL,
  receipt_url text,
  invoice_number text UNIQUE,
  receipt_data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Add payment columns to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_id uuid REFERENCES public.payment_transactions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS receipt_url text;

-- Add payment columns to rental_bookings table
ALTER TABLE public.rental_bookings
ADD COLUMN IF NOT EXISTS payment_id uuid REFERENCES public.payment_transactions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS receipt_url text;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS payment_transactions_user_id_idx ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS payment_transactions_order_id_idx ON public.payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS payment_transactions_rental_booking_id_idx ON public.payment_transactions(rental_booking_id);
CREATE INDEX IF NOT EXISTS payment_transactions_status_idx ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS payment_transactions_created_at_idx ON public.payment_transactions(created_at);
CREATE INDEX IF NOT EXISTS payment_logs_payment_transaction_id_idx ON public.payment_logs(payment_transaction_id);
CREATE INDEX IF NOT EXISTS receipts_payment_transaction_id_idx ON public.receipts(payment_transaction_id);

-- Enable RLS on payment tables
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own payment transactions
CREATE POLICY "Users can view own payment transactions"
  ON public.payment_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own payment transactions (app will validate)
CREATE POLICY "Users can insert own payment transactions"
  ON public.payment_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can view their own payment logs
CREATE POLICY "Users can view own payment logs"
  ON public.payment_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.payment_transactions
      WHERE payment_transactions.id = payment_logs.payment_transaction_id
      AND payment_transactions.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can view their own receipts
CREATE POLICY "Users can view own receipts"
  ON public.receipts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.payment_transactions
      WHERE payment_transactions.id = receipts.payment_transaction_id
      AND payment_transactions.user_id = auth.uid()
    )
  );

-- Function to update payment transaction timestamp
CREATE OR REPLACE FUNCTION public.update_payment_transaction_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for payment_transactions updated_at
CREATE TRIGGER payment_transactions_updated_at_trigger
BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_payment_transaction_updated_at();
