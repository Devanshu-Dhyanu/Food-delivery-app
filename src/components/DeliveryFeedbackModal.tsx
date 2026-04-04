import { useState } from 'react';
import { Star, X } from 'lucide-react';

interface DeliveryFeedbackModalProps {
  loading: boolean;
  orderId: string;
  onClose: () => void;
  onSubmit: (rating: number, feedbackText: string) => Promise<void>;
}

export default function DeliveryFeedbackModal({
  loading,
  orderId,
  onClose,
  onSubmit,
}: DeliveryFeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [error, setError] = useState('');

  const activeRating = hoveredRating || rating;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!rating) {
      setError('Please select a star rating before submitting.');
      return;
    }

    setError('');
    await onSubmit(rating, feedbackText.trim());
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.24em] text-orange-400">Delivered</p>
            <h2 className="text-2xl font-bold text-white">Rate your delivery</h2>
            <p className="mt-2 text-sm text-gray-400">
              Order ID: {orderId.slice(0, 8)}. Stars are required, feedback text is optional.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full border border-gray-700 p-2 text-gray-400 transition-colors hover:border-gray-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Close feedback modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="mb-3 text-sm font-medium text-gray-200">How was your delivery experience?</p>
            <div
              className="flex items-center gap-2"
              onMouseLeave={() => setHoveredRating(0)}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  className="rounded-full p-1 transition-transform hover:scale-110"
                  aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`h-8 w-8 ${
                      value <= activeRating ? 'fill-orange-400 text-orange-400' : 'text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          </div>

          <div>
            <label htmlFor="delivery-feedback-text" className="mb-2 block text-sm font-medium text-gray-200">
              Additional feedback
            </label>
            <textarea
              id="delivery-feedback-text"
              value={feedbackText}
              onChange={(event) => setFeedbackText(event.target.value)}
              placeholder="Share anything you'd like the admin team to see."
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-700"
          >
            {loading ? 'Submitting...' : 'Submit feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}
