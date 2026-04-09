interface BrandedLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export default function BrandedLoader({
  message = 'Loading...',
  fullScreen = false,
}: BrandedLoaderProps) {
  return (
    <div
      className={`flex items-center justify-center px-4 py-10 ${
        fullScreen ? 'min-h-screen bg-gray-900' : 'min-h-[60vh]'
      }`}
    >
      <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/5 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.16),transparent_45%),linear-gradient(135deg,rgba(17,24,39,0.96),rgba(15,23,42,0.98))] px-8 py-10 text-center shadow-2xl shadow-black/30">
        <div className="mb-4 inline-flex items-center rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-200">
          The Vajra
        </div>

        <div className="mb-6 flex items-center justify-center gap-4">
          <div className="rounded-[22px] border border-white/10 bg-white/5 p-3 shadow-lg shadow-black/20">
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

        <p className="text-base font-medium text-white">{message}</p>
        <p className="mt-2 text-sm leading-6 text-gray-400">
          Please wait while we get things ready for you.
        </p>
      </div>
    </div>
  );
}
