import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import {
  clearPendingCheckout,
  getCompletedCheckoutOrderId,
  getPendingCheckout,
  markCheckoutCompleted,
} from '../lib/pendingCheckout';
import { placeOrderFromPendingCheckout } from '../lib/orderPlacement';

export default function PaymentCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'failure'>('loading');
  const [message, setMessage] = useState('Processing payment...');
  const [gatewayOrderId, setGatewayOrderId] = useState('');
  const [placedOrderId, setPlacedOrderId] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get URL parameters
        const params = new URLSearchParams(window.location.search);
        const orderIdParam = params.get('order_id') || params.get('orderId');

        if (!orderIdParam) {
          throw new Error('Missing payment information');
        }

        setGatewayOrderId(orderIdParam);

        const existingOrderId = getCompletedCheckoutOrderId(orderIdParam);
        if (existingOrderId) {
          setPlacedOrderId(existingOrderId);
          setStatus('success');
          setMessage('Payment already verified. Your order has been placed.');
          return;
        }

        const response = await fetch(
          `/api/payment/verify?order_id=${encodeURIComponent(orderIdParam)}`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          if (response.status === 404 && import.meta.env.DEV) {
            throw new Error("Local payment API not available. Run the app with 'vercel dev' for payment testing.");
          }
          throw new Error(
            errorData?.message || errorData?.error || 'Failed to verify payment'
          );
        }

        const data = await response.json();
        const payments = Array.isArray(data?.payments) ? data.payments : [];
        const successfulPayment = payments.find(
          (p: any) => p.payment_status === 'SUCCESS'
        );

        if (successfulPayment) {
          const pendingCheckout = getPendingCheckout(orderIdParam);

          if (!pendingCheckout) {
            setStatus('success');
            setMessage(
              'Payment was successful, but the checkout details were missing so the order could not be recreated automatically.'
            );
            return;
          }

          const { orderId } = await placeOrderFromPendingCheckout(pendingCheckout, {
            transactionId: successfulPayment.cf_payment_id,
            paymentMethod:
              typeof successfulPayment.payment_method === 'string'
                ? successfulPayment.payment_method
                : pendingCheckout.selectedPaymentMethod,
            gatewayOrderId: orderIdParam,
            gatewayResponse: successfulPayment,
          });

          setPlacedOrderId(orderId);
          markCheckoutCompleted(orderIdParam, orderId);
          clearPendingCheckout(orderIdParam);
          setStatus('success');
          setMessage('Payment successful! Your order has been placed.');
          
          // Store transaction ID in localStorage for order creation
          localStorage.setItem('lastTransactionId', successfulPayment.cf_payment_id);
          localStorage.setItem('lastPlacedOrderId', orderId);
          
          // Redirect to home after 2 seconds
          setTimeout(() => {
            window.location.href = '/';
          }, 2500);
        } else {
          clearPendingCheckout(orderIdParam);
          setStatus('failure');
          setMessage('Payment was not completed. Please try again.');
        }
      } catch (error) {
        setStatus('failure');
        setMessage(
          error instanceof Error ? error.message : 'Payment verification failed'
        );
      }
    };

    verifyPayment();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 rounded-lg p-8 text-center max-w-md w-full">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Verifying Payment</h2>
            <p className="text-gray-400">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Payment Successful!</h2>
            <p className="text-gray-400 mb-2">{message}</p>
            {placedOrderId && (
              <p className="text-sm text-gray-500">App Order ID: {placedOrderId}</p>
            )}
            <p className="text-xs text-gray-600 mt-2">Gateway Order ID: {gatewayOrderId}</p>
          </>
        )}

        {status === 'failure' && (
          <>
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Payment Failed</h2>
            <p className="text-gray-400 mb-4">{message}</p>
            <button
              onClick={() => (window.location.href = '/')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              Back to Checkout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
