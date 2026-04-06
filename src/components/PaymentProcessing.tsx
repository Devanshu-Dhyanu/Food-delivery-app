import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';

interface PaymentProcessingProps {
  orderId: string;
  amount: number;
  paymentMethod: string;
}

export default function PaymentProcessing({
  orderId,
  amount,
  paymentMethod,
}: PaymentProcessingProps) {
  const [status, setStatus] = useState<'processing' | 'checking' | 'waiting'>('processing');
  const [message, setMessage] = useState('Initiating payment...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setStatus('checking');
      setMessage('Verifying payment details...');
      setProgress(33);
    }, 1500);

    const timer2 = setTimeout(() => {
      setStatus('waiting');
      setMessage('Waiting for payment confirmation...');
      setProgress(66);
    }, 3000);

    const timer3 = setTimeout(() => {
      setProgress(100);
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
          {/* Animated Loading Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative h-16 w-16">
              <Loader className="absolute inset-0 h-full w-full animate-spin text-orange-300" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-gray-900"></div>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <h2 className="mb-2 text-2xl font-bold text-white">Processing Payment</h2>
          <p className="mb-6 text-gray-400">{message}</p>

          {/* Payment Details */}
          <div className="mb-6 space-y-3 rounded-lg bg-white/5 p-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Amount:</span>
              <span className="font-semibold text-white">₹{amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Method:</span>
              <span className="font-semibold text-orange-300 capitalize">
                {paymentMethod}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Order ID:</span>
              <span className="font-mono text-sm text-gray-300">{orderId.slice(0, 8)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-orange-300 to-orange-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Status Indicators */}
          <div className="mb-6 space-y-2 text-sm">
            <div
              className={`flex items-center gap-2 ${
                status === 'processing' || status === 'checking' || status === 'waiting'
                  ? 'text-green-400'
                  : 'text-gray-500'
              }`}
            >
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              Payment initiated
            </div>
            <div
              className={`flex items-center gap-2 ${
                status === 'checking' || status === 'waiting' ? 'text-green-400' : 'text-gray-500'
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full ${
                  status === 'checking' || status === 'waiting'
                    ? 'bg-green-400'
                    : 'bg-gray-700'
                }`}
              ></div>
              Verifying details
            </div>
            <div
              className={`flex items-center gap-2 ${
                status === 'waiting' ? 'text-orange-300' : 'text-gray-500'
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full ${
                  status === 'waiting' ? 'animate-pulse bg-orange-300' : 'bg-gray-700'
                }`}
              ></div>
              Confirming payment
            </div>
          </div>

          {/* Help Text */}
          <p className="text-xs text-gray-500">
            Please don't close this window or go back. This may take a few moments.
          </p>
        </div>
      </div>
    </div>
  );
}
