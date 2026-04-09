// Payment utility functions for handling transactions, receipts, and invoices
import { supabase } from './supabase';

export interface PaymentRecord {
  id: string;
  payment_gateway_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'refunded';
  created_at: string;
}

export interface ReceiptData {
  orderId?: string;
  rentalBookingId?: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  timestamp: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

/**
 * Create payment transaction record in database
 */
export async function createPaymentTransaction(
  userId: string,
  orderId: string | null,
  rentalBookingId: string | null,
  amount: number,
  paymentMethod: string,
  gatewayResponse: any
) {
  try {
    const { data, error } = await supabase
      .from('payment_transactions')
      .insert([
        {
          user_id: userId,
          order_id: orderId,
          rental_booking_id: rentalBookingId,
          amount,
          payment_method: paymentMethod,
          status: 'pending',
          gateway_response: gatewayResponse,
          currency: 'INR',
        },
      ])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating payment transaction:', error);
    throw error;
  }
}

/**
 * Update payment transaction status
 */
export async function updatePaymentStatus(
  transactionId: string,
  status: string,
  gatewayId?: string,
  gatewayResponse?: any
) {
  try {
    const updateData: any = { status, updated_at: new Date().toISOString() };
    if (gatewayId) updateData.payment_gateway_id = gatewayId;
    if (gatewayResponse) updateData.gateway_response = gatewayResponse;

    const { data, error } = await supabase
      .from('payment_transactions')
      .update(updateData)
      .eq('id', transactionId)
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
}

/**
 * Add payment log entry
 */
export async function logPaymentEvent(
  transactionId: string,
  event: string,
  details?: any
) {
  try {
    const { error } = await supabase.from('payment_logs').insert([
      {
        payment_transaction_id: transactionId,
        event,
        event_details: details || {},
      },
    ]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error logging payment event:', error);
    throw error;
  }
}

/**
 * Generate invoice number
 */
export function generateInvoiceNumber(): string {
  const date = new Date();
  const random = Math.floor(Math.random() * 10000);
  return `INV-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${random}`;
}

/**
 * Create receipt record
 */
export async function createReceipt(
  transactionId: string,
  orderId: string | null,
  rentalBookingId: string | null,
  receiptData: ReceiptData
) {
  try {
    const invoiceNumber = generateInvoiceNumber();

    const { data, error } = await supabase
      .from('receipts')
      .insert([
        {
          payment_transaction_id: transactionId,
          order_id: orderId,
          rental_booking_id: rentalBookingId,
          invoice_number: invoiceNumber,
          receipt_data: receiptData,
        },
      ])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating receipt:', error);
    throw error;
  }
}

/**
 * Get payment history for user
 */
export async function getPaymentHistory(
  userId: string,
  limit: number = 10
) {
  try {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select(
        `
        id,
        amount,
        payment_method,
        status,
        created_at,
        order_id,
        rental_booking_id,
        receipts (invoice_number, receipt_data)
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
}

/**
 * Get receipt by transaction ID
 */
export async function getReceipt(transactionId: string) {
  try {
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('payment_transaction_id', transactionId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching receipt:', error);
    throw error;
  }
}

/**
 * Generate invoice HTML
 */
export function generateInvoiceHTML(receipt: any, paymentData: any): string {
  const receiptData = receipt.receipt_data;
  const date = new Date(receipt.created_at);

  const itemsHTML = receiptData.items
    .map(
      (item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(
        item.quantity * item.price
      ).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${receipt.invoice_number}</title>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { border-bottom: 3px solid #fb923c; padding-bottom: 20px; margin-bottom: 30px; }
        .company-name { color: #fb923c; font-size: 24px; font-weight: bold; }
        .invoice-title { font-size: 20px; font-weight: bold; margin: 20px 0 10px 0; }
        .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
        .detail-section h3 { margin: 0 0 10px 0; font-size: 12px; color: #666; }
        .detail-section p { margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background-color: #f5f5f5; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #ddd; }
        .total-section { text-align: right; margin: 20px 0; }
        .total-row { font-size: 18px; font-weight: bold; color: #fb923c; }
        .footer { border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="company-name">The Vajra</div>
          <div>Campus platform for daily essentials</div>
        </div>

        <div class="invoice-title">Invoice #${receipt.invoice_number}</div>

        <div class="invoice-details">
          <div class="detail-section">
            <h3>Bill To:</h3>
            <p>${paymentData.userEmail}</p>
            <p>${paymentData.userPhone}</p>
          </div>
          <div class="detail-section">
            <h3>Invoice Details:</h3>
            <p>Date: ${date.toLocaleDateString()}</p>
            <p>Time: ${date.toLocaleTimeString()}</p>
            <p>Transaction ID: ${receipt.payment_transaction_id}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div class="total-section">
          <div>Amount: ₹${receiptData.amount.toFixed(2)}</div>
          <div class="total-row">Total: ₹${receiptData.amount.toFixed(2)}</div>
          <div style="font-size: 12px; color: #666; margin-top: 10px;">
            Payment Method: ${receiptData.paymentMethod}
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your order! This is a digitally generated invoice.</p>
          <p>For any queries, contact us at info@vajracognixia.in</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Format payment amount
 */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

/**
 * Get payment method display name
 */
export function getPaymentMethodDisplay(method: string): string {
  const methods: Record<string, string> = {
    upi: 'UPI',
    card: 'Card',
    netbanking: 'Net Banking',
    wallet: 'Wallet',
    bnpl: 'Buy Now Pay Later',
    emi: 'EMI',
  };
  return methods[method] || method;
}
