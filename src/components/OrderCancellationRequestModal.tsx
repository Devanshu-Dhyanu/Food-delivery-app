import { useState } from 'react';
import { Ban, ShieldAlert, X } from 'lucide-react';

interface OrderCancellationRequestModalProps {
  loading: boolean;
  orderId: string;
  onClose: () => void;
  onSubmit: (payload: { reason: string }) => Promise<void>;
}

export default function OrderCancellationRequestModal({
  loading,
  orderId,
  onClose,
  onSubmit,
}: OrderCancellationRequestModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (reason.trim().length < 10) {
      setError('Please write the cancellation reason in at least 10 characters.');
      return;
    }

    setError('');
    await onSubmit({ reason: reason.trim() });
  };

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/75 px-4 py-8">
      <div className="w-full max-w-xl rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.24em] text-orange-400">
              Pending order action
            </p>
            <h2 className="text-2xl font-bold text-white">Request order cancellation</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Order ID: {orderId.slice(0, 8)}. You can request cancellation while the order is
              still pending or confirmed.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full border border-gray-700 p-2 text-gray-400 transition-colors hover:border-gray-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Close cancellation request modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-5 rounded-2xl border border-orange-500/20 bg-orange-500/10 px-4 py-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 text-orange-300" />
            <p className="text-sm leading-6 text-orange-100/90">
              Once the restaurant starts preparing the order, cancellation may not be possible.
              Please send the reason clearly so the team can review it quickly.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="order-cancellation-reason"
              className="mb-2 block text-sm font-medium text-gray-200"
            >
              Reason for cancellation
            </label>
            <textarea
              id="order-cancellation-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Example: ordered by mistake, wrong delivery plan, or need to change the order."
              rows={5}
              className="w-full resize-none rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-orange-500"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-700"
          >
            <Ban className="h-4 w-4" />
            <span>{loading ? 'Submitting request...' : 'Submit cancellation request'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
