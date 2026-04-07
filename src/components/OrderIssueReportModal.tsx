import { useState } from 'react';
import { AlertTriangle, BadgeIndianRupee, X } from 'lucide-react';
import type { OrderIssueType } from '../lib/supabase';

interface OrderIssueReportModalProps {
  loading: boolean;
  orderId: string;
  onClose: () => void;
  onSubmit: (payload: {
    issueType: OrderIssueType;
    description: string;
    refundRequested: boolean;
  }) => Promise<void>;
}

const issueOptions: Array<{
  value: OrderIssueType;
  title: string;
  description: string;
}> = [
  {
    value: 'missing_item',
    title: 'Missing item',
    description: 'Some items were not included in the delivered order.',
  },
  {
    value: 'wrong_order',
    title: 'Wrong order',
    description: 'You received the wrong item or another order.',
  },
  {
    value: 'late_delivery',
    title: 'Late delivery',
    description: 'The order arrived much later than expected.',
  },
  {
    value: 'other',
    title: 'Other issue',
    description: 'Use this for any other delivered-order problem.',
  },
];

export default function OrderIssueReportModal({
  loading,
  orderId,
  onClose,
  onSubmit,
}: OrderIssueReportModalProps) {
  const [issueType, setIssueType] = useState<OrderIssueType | null>(null);
  const [description, setDescription] = useState('');
  const [refundRequested, setRefundRequested] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!issueType) {
      setError('Please choose the issue type first.');
      return;
    }

    if (description.trim().length < 10) {
      setError('Please describe the issue in at least 10 characters.');
      return;
    }

    setError('');

    await onSubmit({
      issueType,
      description: description.trim(),
      refundRequested,
    });
  };

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/75 px-4 py-8">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.24em] text-orange-400">
              Delivered order support
            </p>
            <h2 className="text-2xl font-bold text-white">Report an issue</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Order ID: {orderId.slice(0, 8)}. Tell us what went wrong and we will review it for
              support or refund action.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full border border-gray-700 p-2 text-gray-400 transition-colors hover:border-gray-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Close issue report modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="mb-3 text-sm font-medium text-gray-200">Choose the issue type</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {issueOptions.map((option) => {
                const isSelected = issueType === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setIssueType(option.value)}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? 'border-orange-500/40 bg-orange-500/10'
                        : 'border-gray-700 bg-gray-800/70 hover:border-gray-500 hover:bg-gray-800'
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <AlertTriangle
                        className={`h-4 w-4 ${
                          isSelected ? 'text-orange-300' : 'text-gray-500'
                        }`}
                      />
                      <p className="font-semibold text-white">{option.title}</p>
                    </div>
                    <p className="text-sm leading-6 text-gray-400">{option.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="order-issue-description"
              className="mb-2 block text-sm font-medium text-gray-200"
            >
              Describe the issue
            </label>
            <textarea
              id="order-issue-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Example: one item was missing from the bag, or delivery came too late."
              rows={5}
              className="w-full resize-none rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-orange-500"
            />
            <p className="mt-2 text-xs text-gray-500">
              Please share enough detail so the team can review your complaint properly.
            </p>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-emerald-500/15 bg-emerald-500/10 px-4 py-4">
            <input
              type="checkbox"
              checked={refundRequested}
              onChange={(event) => setRefundRequested(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-900 text-emerald-500 focus:ring-emerald-500"
            />
            <div>
              <div className="flex items-center gap-2">
                <BadgeIndianRupee className="h-4 w-4 text-emerald-300" />
                <span className="text-sm font-semibold text-white">Request refund review</span>
              </div>
              <p className="mt-1 text-sm leading-6 text-emerald-100/80">
                Enable this if you want the support team to evaluate the order for a refund.
              </p>
            </div>
          </label>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-700"
          >
            {loading ? 'Submitting issue...' : 'Submit issue report'}
          </button>
        </form>
      </div>
    </div>
  );
}
