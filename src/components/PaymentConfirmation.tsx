import { CheckCircle, XCircle, Download, Copy } from 'lucide-react';
import { useState } from 'react';

interface PaymentConfirmationProps {
  status: 'success' | 'failure';
  orderId: string;
  amount: number;
  transactionId: string;
  paymentMethod: string;
  receiptUrl?: string;
  onDownloadReceipt?: () => void;
  onContinueShopping: () => void;
  onRetry?: () => void;
}

const formatPaymentMethod = (paymentMethod: string) => {
  const normalizedPaymentMethod = paymentMethod.trim().toLowerCase();

  switch (normalizedPaymentMethod) {
    case 'cod':
      return 'Cash on Delivery';
    case 'netbanking':
      return 'Net Banking';
    case 'bnpl':
      return 'Buy Now Pay Later';
    case 'upi':
      return 'UPI';
    case 'vajra_wallet':
      return 'Vajra Wallet';
    default:
      return paymentMethod;
  }
};

export default function PaymentConfirmation({
  status,
  orderId,
  amount,
  transactionId,
  paymentMethod,
  receiptUrl,
  onDownloadReceipt,
  onContinueShopping,
  onRetry,
}: PaymentConfirmationProps) {
  const [copied, setCopied] = useState(false);
  const normalizedPaymentMethod = paymentMethod.trim().toLowerCase();
  const isCashOnDelivery =
    normalizedPaymentMethod === 'cod' ||
    normalizedPaymentMethod === 'cash on delivery';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="overflow-hidden rounded-2xl border border-green-500/20 bg-gradient-to-br from-emerald-500/10 via-gray-900 to-gray-900 shadow-2xl shadow-black/30">
            <div className="border-b border-white/5 px-6 py-4 text-center sm:px-8">
              <span
                className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                  isCashOnDelivery
                    ? 'border border-orange-500/30 bg-orange-500/10 text-orange-200'
                    : 'border border-green-500/30 bg-green-500/10 text-green-300'
                }`}
              >
                {isCashOnDelivery ? 'Order Confirmed' : 'Payment Successful'}
              </span>
            </div>

            <div className="px-6 py-10 text-center sm:px-8">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-green-400/30 bg-green-500 shadow-lg shadow-green-500/20">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>

              <h2 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
                {isCashOnDelivery ? 'Cash on Delivery Selected' : 'Payment Confirmed'}
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-sm leading-6 text-gray-300 sm:text-base">
                {isCashOnDelivery
                  ? 'Your order has been placed successfully. Please keep the amount ready and pay the delivery partner when your order arrives.'
                  : 'Your payment has been successfully processed. Your order has been placed and is being prepared.'}
              </p>

              <div className="mb-8 rounded-2xl border border-white/5 bg-white/5 px-6 py-6">
                <p className="mb-2 text-sm text-gray-400">
                  {isCashOnDelivery ? 'Amount Due on Delivery' : 'Amount Paid'}
                </p>
                <p
                  className={`text-4xl font-bold ${
                    isCashOnDelivery ? 'text-orange-300' : 'text-green-400'
                  }`}
                >
                  Rs. {amount.toFixed(2)}
                </p>
              </div>

              <div className="mb-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                  <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">
                    Order ID
                  </p>
                  <p className="break-all font-mono text-sm font-semibold text-white">
                    {orderId}
                  </p>
                  <button
                    onClick={() => copyToClipboard(orderId)}
                    className="mx-auto mt-2 flex items-center justify-center gap-2 text-xs text-orange-300 transition-colors hover:text-orange-400"
                  >
                    <Copy className="h-3 w-3" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                  <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">
                    {isCashOnDelivery ? 'Payment Status' : 'Transaction ID'}
                  </p>
                  <p className="break-all font-mono text-sm font-semibold text-white">
                    {isCashOnDelivery
                      ? 'Due on Delivery'
                      : transactionId
                        ? transactionId.slice(0, 12)
                        : 'Pending'}
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                  <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">
                    Payment Method
                  </p>
                  <p className="font-semibold text-white">
                    {formatPaymentMethod(paymentMethod)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                {receiptUrl && (
                  <button
                    onClick={onDownloadReceipt}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-300 bg-transparent px-6 py-3 text-sm font-semibold text-orange-300 transition-colors hover:bg-orange-300/10"
                  >
                    <Download className="h-4 w-4" />
                    Download Receipt
                  </button>
                )}
                <button
                  onClick={onContinueShopping}
                  className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                >
                  Continue Shopping
                </button>
              </div>

              <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-gray-400">
                  {isCashOnDelivery
                    ? "You'll receive an order confirmation shortly. Track your order in the Orders section."
                    : "You'll receive an email confirmation shortly. Track your order in the Orders section."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/10 via-gray-900 to-gray-900 shadow-2xl shadow-black/30">
          <div className="border-b border-white/5 px-6 py-4 text-center sm:px-8">
            <span className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
              Payment Failed
            </span>
          </div>

          <div className="px-6 py-10 text-center sm:px-8">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-red-400/30 bg-red-500 shadow-lg shadow-red-500/20">
              <XCircle className="h-12 w-12 text-white" />
            </div>

            <h2 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
              Payment Could Not Be Processed
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-sm leading-6 text-gray-300 sm:text-base">
              Your payment was declined or could not be processed. Your account has not been
              charged. Please try again with a different payment method.
            </p>

            <div className="mb-8 rounded-2xl border border-white/5 bg-white/5 px-6 py-6">
              <p className="mb-2 text-sm text-gray-400">Attempted Amount</p>
              <p className="text-4xl font-bold text-gray-400">Rs. {amount.toFixed(2)}</p>
            </div>

            <div className="mb-8 rounded-xl border border-white/5 bg-white/5 p-4">
              <p className="mb-3 text-sm text-gray-400">Order ID</p>
              <p className="break-all font-mono text-sm font-semibold text-white">{orderId}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                >
                  Try Again
                </button>
              )}
              <button
                onClick={onContinueShopping}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-600 bg-transparent px-6 py-3 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/5"
              >
                Back to Cart
              </button>
            </div>

            <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="mb-3 text-xs text-gray-400">Need help?</p>
              <p className="text-xs text-gray-500">
                Contact our support team:{' '}
                <span className="text-orange-300">support@vajracognixia.in</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
