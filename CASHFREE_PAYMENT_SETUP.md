# Cashfree Payment Gateway Setup Guide

## Current Status
✅ **Payment UI Components**: Fully implemented
✅ **Checkout Flow**: Integrated with payment step
✅ **Database Schema**: Created with payment tables
⚠️ **API Integration**: Demo mode (simulates payment after 2 seconds)

## Why Cashfree Isn't Opening
The payment gateway UI appears but payment processing isn't integrated with the actual Cashfree API yet. The system is currently in demo mode which simulates successful payments.

## To Enable Real Cashfree Payments

### Step 1: Get Cashfree Credentials
1. Sign up at [Cashfree Dashboard](https://dashboard.cashfree.com)
2. Go to Settings → API Keys
3. Copy your:
   - **Client ID**
   - **Client Secret**

### Step 2: Update Environment Variables
Edit `.env.local` and add your credentials:
```
VITE_CASHFREE_CLIENT_ID=your_actual_client_id
VITE_CASHFREE_CLIENT_SECRET=your_actual_client_secret
VITE_CASHFREE_ENVIRONMENT=sandbox
```

### Step 3: Check Current Implementation
**File**: `src/components/PaymentOptions.tsx`

**Current Demo Mode** (Lines 32-45):
```typescript
// For demo: Simulate successful payment after 2 seconds
setTimeout(() => {
  const transactionId = `TXN-${Date.now()}`;
  onPaymentSuccess(transactionId);
  setProcessing(false);
}, 2000);
```

### Step 4: Enable Real Payment Processing
Uncomment the actual Cashfree API call (Lines 47-62) and remove the demo setTimeout:

```typescript
// TODO: Integrate with actual Cashfree payment gateway
const response = await fetch('/api/payment/initiate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: user.id,
    amount,
    orderId,
    method: selectedMethod,
    customerEmail: formData?.customerName || 'customer@example.com',
    customerPhone: formData?.customerPhone,
  }),
});

const data = await response.json();
if (!response.ok) throw new Error(data.error || 'Payment initiation failed');
window.location.href = data.paymentLink;
```

### Step 5: Create Backend API Route
You'll need to create a backend API endpoint (`/api/payment/initiate`) that:
1. Initializes Cashfree payment session
2. Returns payment link or session ID
3. Handles payment callbacks

### Step 6: Test Payment Flow
1. Fill checkout form
2. Click "Continue to Payment"
3. Select a payment method
4. Click "Proceed to Payment"
5. You should be redirected to Cashfree payment page

## Payment Methods Supported
- **UPI**: Google Pay, PhonePe, BHIM, Paytm
- **Cards**: Visa, Mastercard, RuPay, Amex
- **Net Banking**: 50+ Indian banks
- **Wallets**: Paytm, Amazon Pay, Mobikwik
- **BNPL**: Simpl, LazyPay, ZestMoney
- **EMI**: Credit & Debit Card EMI

## File Structure
```
src/
  lib/
    cashfree.ts         ← Cashfree API client
    paymentUtils.ts     ← Payment database operations
  components/
    PaymentOptions.tsx  ← Payment method selection ← DEMO MODE HERE
    PaymentConfirmation.tsx
    PaymentProcessing.tsx
    Checkout.tsx        ← Integrates payment flow
```

## Quick Fixes Completed
1. ✅ Removed duplicate payment screen code in Checkout.tsx
2. ✅ Added "Proceed to Payment" button in PaymentOptions
3. ✅ Added error handling and processing states
4. ✅ Created environment configuration template
5. ✅ Properly integrated payment flow into checkout

## Next Step to Get Real Payments Working
Replace lines 32-45 in `PaymentOptions.tsx` with actual Cashfree API integration and create the `/api/payment/initiate` backend endpoint in your server.

---

**Current Demo Behavior**: 
- Select payment method → Click "Proceed to Payment" → Wait 2 seconds → Order confirmed

**With Real Cashfree**:
- Select payment method → Click "Proceed to Payment" → Redirected to Cashfree gateway  → Complete payment → Auto-confirm order
