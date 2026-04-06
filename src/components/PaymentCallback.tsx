import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function PaymentCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'failure'>('loading');
  const [message, setMessage] = useState('Processing payment...');
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get URL parameters
        const params = new URLSearchParams(window.location.search);
        const paymentSessionId = params.get('payment_session_id');
        const orderIdParam = params.get('order_id');

        if (!paymentSessionId || !orderIdParam) {
          throw new Error('Missing payment information');
        }

        setOrderId(orderIdParam);

        // Verify payment status
        const clientId = import.meta.env.VITE_CASHFREE_CLIENT_ID;
        const clientSecret = import.meta.env.VITE_CASHFREE_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
          throw new Error('Cashfree credentials not configured');
        }

        const response = await fetch(
          `https://sandbox.cashfree.com/pg/orders/${orderIdParam}/payments`,
          {
            headers: {
              'x-api-version': '2023-08-01',
              'x-client-id': clientId,
              'x-client-secret': clientSecret,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to verify payment');
        }

        const data = await response.json();
        const payments = data.data || [];
        const successfulPayment = payments.find(
          (p: any) => p.payment_status === 'SUCCESS'
        );

        if (successfulPayment) {
          setStatus('success');
          setMessage('Payment successful! Your order is being confirmed...');
          
          // Store transaction ID in localStorage for order creation
          localStorage.setItem('lastTransactionId', successfulPayment.cf_payment_id);
          
          // Redirect to home after 2 seconds
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
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
            <p className="text-sm text-gray-500">Order ID: {orderId}</p>
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
