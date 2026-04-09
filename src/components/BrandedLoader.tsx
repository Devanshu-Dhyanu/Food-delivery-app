interface BrandedLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export default function BrandedLoader({
  message = 'Loading...',
  fullScreen = false,
}: BrandedLoaderProps) {
  return (
    <>
      <style>{`
        @keyframes vajraLoaderCardIn {
          0% {
            opacity: 0;
            transform: translateY(24px) scale(0.95);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes vajraLoaderLogoFloat {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }

          50% {
            transform: translateY(-4px) scale(1.03);
          }
        }

        @keyframes vajraLoaderTextIn {
          0% {
            opacity: 0;
            transform: translateY(12px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 720px) {
          .vajra-loader-shell {
            padding-left: 18px !important;
            padding-right: 18px !important;
          }

          .vajra-loader-card {
            padding: 34px 22px !important;
            border-radius: 30px !important;
            animation: vajraLoaderCardIn 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
          }

          .vajra-loader-badge {
            animation: vajraLoaderTextIn 0.55s ease-out 0.08s both;
          }

          .vajra-loader-brand {
            animation: vajraLoaderLogoFloat 2.2s ease-in-out 0.22s infinite;
          }

          .vajra-loader-copy-primary {
            animation: vajraLoaderTextIn 0.55s ease-out 0.16s both;
          }

          .vajra-loader-copy-secondary {
            animation: vajraLoaderTextIn 0.55s ease-out 0.24s both;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .vajra-loader-card,
          .vajra-loader-badge,
          .vajra-loader-brand,
          .vajra-loader-copy-primary,
          .vajra-loader-copy-secondary {
            animation: none !important;
          }
        }
      `}</style>

      <div
        className={`vajra-loader-shell flex items-center justify-center px-4 py-10 ${
          fullScreen ? 'min-h-screen bg-gray-900' : 'min-h-[60vh]'
        }`}
      >
        <div className="vajra-loader-card w-full max-w-md overflow-hidden rounded-[28px] border border-white/5 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.16),transparent_45%),linear-gradient(135deg,rgba(17,24,39,0.96),rgba(15,23,42,0.98))] px-8 py-10 text-center shadow-2xl shadow-black/30">
          <div className="vajra-loader-badge mb-4 inline-flex items-center rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-200">
            The Vajra
          </div>

          <div className="mb-6 flex items-center justify-center gap-4">
            <div className="vajra-loader-brand rounded-[22px] border border-white/10 bg-white/5 p-3 shadow-lg shadow-black/20">
              <img
                src="/the-vajra-mark.svg"
                alt="The Vajra Campus Delivery logo"
                className="h-16 w-16 rounded-2xl object-cover"
              />
            </div>

            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-[4px] border-orange-500/15" />
              <div className="absolute inset-0 rounded-full border-[4px] border-transparent border-r-orange-400 border-t-orange-300 animate-spin" />
              <div className="absolute inset-3 rounded-full bg-orange-500/10 blur-sm" />
            </div>
          </div>

          <p className="vajra-loader-copy-primary text-base font-medium text-white">{message}</p>
          <p className="vajra-loader-copy-secondary mt-2 text-sm leading-6 text-gray-400">
            Please wait while we get things ready for you.
          </p>
        </div>
      </div>
    </>
  );
}
