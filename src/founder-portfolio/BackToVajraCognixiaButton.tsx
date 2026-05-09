import { ArrowLeft } from 'lucide-react';

type Props = {
  onClick: () => void;
};

/** Fixed controls sit above hero imagery and portfolio overlays */
export function BackToVajraCognixiaButton({ onClick }: Props) {
  return (
    <button
      type="button"
      aria-label="Back to Vajra Cognixia"
      onClick={onClick}
      className={[
        'group fixed left-[max(0.875rem,env(safe-area-inset-left))] top-[max(0.875rem,env(safe-area-inset-top))]',
        'z-[2147483000]',
        'flex items-center gap-2 rounded-2xl border border-white/25 bg-black/35 px-3 py-2.5 sm:px-4 sm:py-3',
        'text-left text-[0.8125rem] font-semibold leading-tight tracking-tight text-white/95 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl backdrop-saturate-150',
        'transition-[transform,box-shadow,background-color,border-color,color] duration-300 ease-out',
        'hover:-translate-y-0.5 hover:border-white/40 hover:bg-black/48 hover:text-white hover:shadow-[0_16px_48px_rgba(0,0,0,0.45)]',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70',
        'active:translate-y-0 active:duration-150',
      ].join(' ')}
    >
      <ArrowLeft
        className="h-4 w-4 shrink-0 text-white/80 transition-transform duration-300 ease-out group-hover:-translate-x-1 group-hover:text-white"
        strokeWidth={2.25}
        aria-hidden
      />
      <span className="max-w-[min(62vw,12.5rem)] sm:max-w-none">
        <span className="block sm:inline">Back to</span>{' '}
        <span className="text-white">
          Vajra <span className="font-semibold opacity-95">Cognixia</span>
        </span>
      </span>
    </button>
  );
}
