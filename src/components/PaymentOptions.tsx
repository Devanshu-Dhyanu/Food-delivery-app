import { useState } from 'react';
import {
  AlertCircle,
  Banknote,
  Calendar,
  CreditCard,
  Smartphone,
  Truck,
  Wallet,
  Zap,
} from 'lucide-react';
import { openCashfreeCheckout } from '../lib/cashfreeCheckout';
import {
  clearPendingCheckout,
  savePendingCheckout,
  type PendingCheckoutPayload,
} from '../lib/pendingCheckout';
import { supabase } from '../lib/supabase';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category:
    | 'upi'
    | 'card'
    | 'netbanking'
    | 'vajra_wallet'
    | 'wallet'
    | 'bnpl'
    | 'emi'
    | 'cod';
}

interface PaymentOptionsProps {
  onSelectMethod: (method: string) => void;
  selectedMethod: string | null;
  amount: number;
  onPaymentSuccess?: (transactionId: string) => void;
  onPaymentFailure?: (error: string) => void;
  onCashOnDeliveryOrder?: () => Promise<void>;
  onVajraWalletOrder?: () => Promise<void>;
  formData?: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
  };
  checkoutSession: Omit<PendingCheckoutPayload, 'selectedPaymentMethod'>;
  walletBalance?: number;
  walletLoading?: boolean;
  walletSchemaReady?: boolean;
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
    id: 'vajra_wallet',
    name: 'Vajra Wallet',
    description: 'Use your in-app balance for faster payments',
    icon: <Wallet className="w-6 h-6" />,
    category: 'vajra_wallet',
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
  {
    id: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay in cash when your order arrives',
    icon: <Truck className="w-6 h-6" />,
    category: 'cod',
  },
];

export default function PaymentOptions({
  onSelectMethod,
  selectedMethod,
  amount,
  onPaymentSuccess: _onPaymentSuccess,
  onPaymentFailure,
  onCashOnDeliveryOrder,
  onVajraWalletOrder,
  formData,
  checkoutSession,
  walletBalance = 0,
  walletLoading = false,
  walletSchemaReady = true,
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

    let gatewayOrderId = '';

    try {
      if (selectedMethod === 'cod') {
        if (!onCashOnDeliveryOrder) {
          throw new Error('Cash on delivery is not available right now.');
        }

        await onCashOnDeliveryOrder();
        return;
      }

      if (selectedMethod === 'vajra_wallet') {
        if (walletLoading) {
          throw new Error(
            'Checking your Vajra Wallet balance. Please wait a moment and try again.'
          );
        }

        if (!walletSchemaReady) {
          throw new Error(
            'Vajra Wallet setup is not ready yet. Please run the wallet SQL first.'
          );
        }

        if (walletBalance < amount) {
          throw new Error(
            `Insufficient Vajra Wallet balance. Available: Rs. ${walletBalance.toFixed(2)}`
          );
        }

        if (!onVajraWalletOrder) {
          throw new Error('Vajra Wallet is not available right now.');
        }

        await onVajraWalletOrder();
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('User authentication required');
      }

      gatewayOrderId = `ORD-${Date.now()}`;

      savePendingCheckout(gatewayOrderId, {
        ...checkoutSession,
        selectedPaymentMethod: selectedMethod,
      });

      const paymentRequest = {
        order_id: gatewayOrderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: user.id,
          customer_email: user.email || 'customer@example.com',
          customer_phone: formData?.customerPhone || '9000090000',
          customer_name: formData?.customerName || 'Customer',
        },
        order_meta: {
          return_url: `${window.location.origin}/payment/callback?order_id=${encodeURIComponent(gatewayOrderId)}`,
          notify_url: `${window.location.origin}/api/payment/webhook`,
        },
        order_note: `Order for ${formData?.customerName}`,
      };

      const createOrderResponse = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: gatewayOrderId,
          amount,
          customerId: user.id,
          customerEmail: user.email || 'customer@example.com',
          customerPhone: formData?.customerPhone || '9000090000',
          customerName: formData?.customerName || 'Customer',
          returnUrl: paymentRequest.order_meta.return_url,
          notifyUrl: paymentRequest.order_meta.notify_url,
          orderNote: paymentRequest.order_note,
        }),
      });

      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json().catch(() => null);
        if (createOrderResponse.status === 404 && import.meta.env.DEV) {
          throw new Error(
            "Local payment API not available. Run the app with 'vercel dev' for payment testing."
          );
        }

        throw new Error(
          errorData?.message || errorData?.error || 'Failed to create payment'
        );
      }

      const orderData = await createOrderResponse.json();
      const paymentSessionId =
        typeof orderData.paymentSessionId === 'string'
          ? orderData.paymentSessionId
          : '';
      const environment =
        orderData.environment === 'production' ? 'production' : 'sandbox';
      const paymentUrl =
        typeof orderData.paymentUrl === 'string' ? orderData.paymentUrl : null;

      if (paymentSessionId) {
        await openCashfreeCheckout({
          paymentSessionId,
          environment,
        });
      } else if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        throw new Error('No payment session received from Cashfree');
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Payment processing failed';
      console.error('Payment error:', err);
      if (gatewayOrderId) {
        clearPendingCheckout(gatewayOrderId);
      }
      setError(message);
      onPaymentFailure?.(message);
      setProcessing(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold text-white">Select Payment Method</h2>
        <p className="text-gray-400">
          Pay <span className="text-orange-300">Rs. {amount.toFixed(2)}</span>
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
                <p className="mt-1 text-xs text-gray-400">{method.description}</p>
              </div>
            </div>

            {selectedMethod === method.id && (
              <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-orange-300">
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
          100% Secure &nbsp;|&nbsp; SSL Encrypted &nbsp;|&nbsp; PCI DSS Compliant
        </p>
      </div>

      {selectedMethod === 'vajra_wallet' && (
        <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-sm font-medium text-emerald-100">
            {walletLoading
              ? 'Checking your Vajra Wallet balance...'
              : !walletSchemaReady
                ? 'Vajra Wallet setup is not ready yet. Run the wallet SQL first.'
                : `Available balance: Rs. ${walletBalance.toFixed(2)}`}
          </p>
          {!walletLoading && walletSchemaReady && (
            <p className="mt-1 text-xs text-emerald-200/80">
              This order needs Rs. {amount.toFixed(2)} from your wallet balance.
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 flex gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      <div className="mt-6 flex gap-4">
        <button
          onClick={handlePaymentInitiate}
          disabled={!selectedMethod || processing}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 font-semibold text-white transition-colors hover:bg-orange-600 disabled:bg-gray-600"
        >
          {processing ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Processing...
            </>
          ) : selectedMethod === 'cod' ? (
            'Place Order'
          ) : selectedMethod === 'vajra_wallet' ? (
            'Pay with Vajra Wallet'
          ) : (
            'Proceed to Payment'
          )}
        </button>
      </div>
    </div>
  );
}
