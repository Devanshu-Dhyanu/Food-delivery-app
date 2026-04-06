# Cashfree Payment Gateway Integration Guide

## Overview
This guide explains how the Cashfree payment system is integrated into The Vajra food delivery app.

## Setup Instructions

### 1. Get Cashfree Credentials
- Go to [Cashfree Dashboard](https://merchant.cashfree.com)
- Sign up and create an account
- Get your `Client ID` and `Client Secret`
- **Note:** Start with SANDBOX environment for testing

### 2. Environment Configuration
Copy `.env.example` to `.env.local` and fill in:

```env
VITE_CASHFREE_CLIENT_ID=your_client_id
VITE_CASHFREE_CLIENT_SECRET=your_client_secret
VITE_CASHFREE_ENVIRONMENT=sandbox  # Use 'production' for live
```

### 3. Initialize Cashfree in Your App
Add this to `src/main.tsx` or `src/App.tsx`:

```typescript
import { initializeCashfree } from './lib/cashfree';

initializeCashfree({
  clientId: import.meta.env.VITE_CASHFREE_CLIENT_ID,
  clientSecret: import.meta.env.VITE_CASHFREE_CLIENT_SECRET,
  environment: import.meta.env.VITE_CASHFREE_ENVIRONMENT || 'sandbox',
});
```

## File Structure

### New Files Created:
```
src/
├── lib/
│   ├── cashfree.ts              # Cashfree API integration
│   └── paymentUtils.ts          # Payment utilities (DB, invoices, receipts)
├── components/
│   ├── PaymentOptions.tsx       # Payment method selection
│   ├── PaymentProcessing.tsx    # Processing screen
│   └── PaymentConfirmation.tsx  # Success/failure screen
supabase/
└── migrations/
    └── 20260406_create_payment_system.sql  # Database tables
```

### Database Tables Created:
- `payment_transactions` - Payment records
- `payment_logs` - Transaction events
- `receipts` - Invoice/receipt data

### Database Columns Added to Existing Tables:
- `orders.payment_id`
- `orders.payment_status`
- `orders.payment_method`
- `orders.receipt_url`
- `rental_bookings.payment_id`
- `rental_bookings.payment_status`
- `rental_bookings.payment_method`
- `rental_bookings.receipt_url`

## Flow Diagram

```
User Checkout
    ↓
Payment Method Selection (PaymentOptions)
    ↓
Initiate Payment (cashfree.ts)
    ↓
Payment Processing (PaymentProcessing)
    ↓
Cashfree Redirect (UPI/Card/etc)
    ↓
Verify Payment (cashfree.ts)
    ↓
Update DB (paymentUtils.ts)
    ↓
Show Confirmation (PaymentConfirmation)
    ↓
Generate Receipt/Invoice
```

## Usage Examples

### 1. Initiating Payment

```typescript
import { getCashfreeInstance } from './lib/cashfree';
import { createPaymentTransaction } from './lib/paymentUtils';

const cashfree = getCashfreeInstance();

// Start payment
const { sessionId, paymentLink } = await cashfree.initiatePayment({
  amount: 500,
  orderId: 'order-123',
  userId: 'user-456',
  userEmail: 'user@example.com',
  userPhone: '+91-9999999999',
  paymentMethod: 'upi',
  orderNote: 'Food delivery order',
});

// Create transaction record
const transaction = await createPaymentTransaction(
  userId,
  orderId,
  null, // rentalBookingId
  500,
  'upi',
  { sessionId }
);
```

### 2. Verifying Payment

```typescript
const paymentData = await cashfree.verifyPayment(orderId);

if (paymentData.status === 'success') {
  // Update transaction status
  await updatePaymentStatus(
    transactionId,
    'success',
    paymentData.transactionId,
    paymentData.gatewayResponse
  );

  // Log payment event
  await logPaymentEvent(transactionId, 'payment_success', {
    method: paymentData.paymentMethod,
    amount: paymentData.amount,
  });

  // Create receipt
  const receipt = await createReceipt(
    transactionId,
    orderId,
    null,
    receiptData
  );
}
```

### 3. Processing Refunds

```typescript
const refund = await cashfree.processRefund({
  transactionId: 'cf-payment-id',
  amount: 500,
  reason: 'Customer requested cancellation',
});
```

### 4. Getting Payment History

```typescript
const history = await getPaymentHistory(userId, 10);
// Returns last 10 payment transactions
```

### 5. Generating Invoice

```typescript
import { generateInvoiceHTML } from './lib/paymentUtils';

const receipt = await getReceipt(transactionId);
const html = generateInvoiceHTML(receipt, {
  userEmail: 'user@example.com',
  userPhone: '+91-9999999999',
});

// Can be printed or sent via email
```

## Support Payment Methods

### UPI
- Google Pay
- PhonePe
- BHIM
- Paytm
- Other UPI apps

### Cards
- Visa
- Mastercard
- RuPay
- American Express

### Net Banking
- 50+ banks including:
  - SBI, HDFC, ICICI, Axis
  - PNB, BOB, Union Bank, etc.

### Wallets
- Paytm Wallet
- Amazon Pay
- Mobikwik

### Buy Now Pay Later (BNPL)
- Simpl
- LazyPay
- ZestMoney

### EMI
- Credit Card EMI
- Debit Card EMI

## Webhook Handling

To handle payment webhooks (optional but recommended):

```typescript
// Backend endpoint: /api/payment/webhook
// Receive Cashfree webhook notifications
// Update order status automatically
```

## Error Handling

The system handles:
- Payment failures
- Network timeouts
- Invalid payment methods
- Cancelled transactions
- Refund failures

All errors are logged in the `payment_logs` table.

## Security Considerations

✓ SSL/HTTPS required for production
✓ PCI DSS compliance handled by Cashfree
✓ Credentials stored in environment variables
✓ RLS policies protect payment data
✓ Transaction verification on backend
✓ No sensitive data stored in frontend

## Testing

### Test Credentials
- **Client ID:** Provided by Cashfree sandbox
- **Environment:** sandbox
- **Test Cards:** Use Cashfree test card details

### Test Payments
1. Open payment link
2. Select test card/UPI
3. Complete payment flow
4. Verify in Supabase `payment_transactions` table
5. Check receipt generation

## FAQ

### Q: How do I migrate existing orders to use the payment system?
A: Run migration script to add payment columns to existing tables

### Q: Can I test without live Cashfree account?
A: Yes, use sandbox environment with test credentials

### Q: How are invoices generated?
A: `generateInvoiceHTML()` creates formatted HTML invoices

### Q: What happens if payment fails?
A: Transaction is marked as 'failed', user can retry

### Q: Are payments encrypted?
A: Yes, Cashfree handles PCI DSS compliance and SSL encryption

## Support
For issues or questions:
- support@vajracognixia.in
- Cashfree Documentation: https://docs.cashfree.com
