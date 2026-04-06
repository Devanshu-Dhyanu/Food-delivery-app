import { useState } from 'react';
import { CreditCard, Smartphone, Banknote, Wallet, Calendar, Zap, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'upi' | 'card' | 'netbanking' | 'wallet' | 'bnpl' | 'emi';
}

interface PaymentOptionsProps {
  onSelectMethod: (method: string) => void;
  selectedMethod: string | null;
  amount: number;
  onPaymentSuccess: (transactionId: string) => void;
  onPaymentFailure?: (error: string) => void;
  formData?: { customerName: string; customerPhone: string; deliveryAddress: string };
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'upi',
    name: 'UPI',
    description: 'Google Pay, PhonePe, BHIM, Paytm',
    icon: <Smartphone className="w-6 h-6" />,
    category: 'upi',
  },
  {
    id: 'card',
    name: 'Debit/Credit Card',
    description: 'Visa, Mastercard, RuPay, Amex',
    icon: <CreditCard className="w-6 h-6" />,
    category: 'card',
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    description: '50+ Banks - SBI, HDFC, ICICI, Axis',
    icon: <Banknote className="w-6 h-6" />,
    category: 'netbanking',
  },
  {
    id: 'wallet',
    name: 'Wallets',
    description: 'Paytm, Amazon Pay, Mobikwik',
    icon: <Wallet className="w-6 h-6" />,
    category: 'wallet',
  },
  {
    id: 'bnpl',
    name: 'Buy Now Pay Later',
    description: 'Simpl, LazyPay, ZestMoney',
    icon: <Calendar className="w-6 h-6" />,
    category: 'bnpl',
  },
  {
    id: 'emi',
    name: 'EMI',
    description: 'Credit/Debit Card EMI',
    icon: <Zap className="w-6 h-6" />,
    category: 'emi',
  },
];

export default function PaymentOptions({
  onSelectMethod,
  selectedMethod,
  amount,
  onPaymentSuccess,
  onPaymentFailure,
  formData,
}: PaymentOptionsProps) {
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePaymentInitiate = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('User authentication required');
      }

      // Generate order ID
      const orderId = `ORD-${Date.now()}`;
      
      // Initiate Cashfree payment
      const clientId = import.meta.env.VITE_CASHFREE_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_CASHFREE_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        throw new Error('Cashfree credentials not configured');
      }

      // Prepare payment request
      const paymentRequest = {
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: user.id,
          customer_email: user.email || 'customer@example.com',
          customer_phone: formData?.customerPhone || '9000090000',
          customer_name: formData?.customerName || 'Customer',
        },
        order_meta: {
          return_url: `${window.location.origin}/payment/callback`,
          notify_url: `${window.location.origin}/api/payment/webhook`,
        },
        order_note: `Order for ${formData?.customerName}`,
      };

      // Call Cashfree API to create order
      const createOrderResponse = await fetch('https://sandbox.cashfree.com/pg/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-version': '2023-08-01',
          'x-client-id': clientId,
          'x-client-secret': clientSecret,
        },
        body: JSON.stringify(paymentRequest),
      });

      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json();
        throw new Error(errorData.message || 'Failed to create payment');
      }

      const orderData = await createOrderResponse.json();

      // Get payment session to open payment UI
      const sessionResponse = await fetch(
        `https://sandbox.cashfree.com/pg/orders/${orderId}/pay`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-version': '2023-08-01',
            'x-client-id': clientId,
            'x-client-secret': clientSecret,
          },
          body: JSON.stringify({
            payment_method: selectedMethod,
          }),
        }
      );

      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json();
        throw new Error(errorData.message || 'Payment session failed');
      }

      const sessionData = await sessionResponse.json();

      // Redirect to Cashfree payment page
      if (sessionData.data?.url) {
        window.location.href = sessionData.data.url;
      } else if (sessionData.data?.payment_session_id) {
        // Alternative: Use Cashfree SDK
        const paymentLink = `https://sandbox.cashfree.com/pg/pay/${sessionData.data.payment_session_id}`;
        window.location.href = paymentLink;
      } else {
        throw new Error('No payment URL received from Cashfree');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment processing failed';
      console.error('Payment error:', err);
      setError(message);
      onPaymentFailure?.(message);
      setProcessing(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Select Payment Method</h2>
        <p className="text-gray-400">
          Pay <span className="text-orange-300">₹{amount.toFixed(2)}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method.id}
            onClick={() => onSelectMethod(method.id)}
            onMouseEnter={() => setHoveredMethod(method.id)}
            onMouseLeave={() => setHoveredMethod(null)}
            className={`relative rounded-xl border-2 p-4 transition-all ${
              selectedMethod === method.id
                ? 'border-orange-300 bg-orange-300/10 shadow-lg shadow-orange-300/30'
                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]'
            } ${hoveredMethod === method.id ? 'scale-105' : 'scale-100'}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`rounded-lg p-2 ${
                  selectedMethod === method.id
                    ? 'bg-orange-300/20 text-orange-300'
                    : 'bg-white/10 text-gray-400'
                }`}
              >
                {method.icon}
              </div>
              <div className="flex-1 text-left">
                <h3
                  className={`font-semibold ${
                    selectedMethod === method.id ? 'text-orange-300' : 'text-white'
                  }`}
                >
                  {method.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{method.description}</p>
              </div>
            </div>

            {selectedMethod === method.id && (
              <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-orange-300 flex items-center justify-center">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-gray-400">
          ✓ 100% Secure &nbsp;|&nbsp; SSL Encrypted &nbsp;|&nbsp; PCI DSS Compliant
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      <div className="mt-6 flex gap-4">
        <button
          onClick={handlePaymentInitiate}
          disabled={!selectedMethod || processing}
          className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            'Proceed to Payment'
          )}
        </button>
      </div>
    </div>
  );
}
