import { useRef } from 'react';
import { ArrowUpRight, CarFront, CarTaxiFront, Store, UtensilsCrossed } from 'lucide-react';

type HubTarget = 'home' | 'car-rent' | 'second-hand-market' | 'taxi';

interface PostLoginServiceHubProps {
  onNavigate: (page: HubTarget) => void;
}

const notes = [
  {
    eyebrow: 'Field note',
    title: 'We created a workflow for a Vajraian drone',
    copy:
      'The post-login screen now works as the command surface where the user chooses a live module before entering the main customer flow.',
  },
  {
    eyebrow: 'Primary brief',
    title: 'One futuristic campus system',
    copy:
      'Food delivery, car rental, second hand market, and taxi stay visible together so the platform feels like one unified campus experience.',
  },
  {
    eyebrow: 'Field note',
    title: 'The next step was creating visual cues',
    copy:
      'Target rings, status labels, floating panels, and restrained accents recreate a cinematic command mood more naturally.',
  },
] as const;

const serviceCards: Array<{
  id: HubTarget;
  title: string;
  status: string;
  description: string;
  icon: typeof UtensilsCrossed;
}> = [
  {
    id: 'home',
    title: 'Food Delivery',
    status: 'Live now',
    description: 'Browse restaurants, open menus, place orders, and track the run.',
    icon: UtensilsCrossed,
  },
  {
    id: 'car-rent',
    title: 'Car Rental',
    status: 'Now booking',
    description: 'Choose a vehicle, set hours, and submit a rental request instantly.',
    icon: CarFront,
  },
  {
    id: 'second-hand-market',
    title: 'Second Hand Market',
    status: 'Live now',
    description: 'Campus marketplace flow for useful buy and sell listings.',
    icon: Store,
  },
  {
    id: 'taxi',
    title: 'Taxi',
    status: 'Coming soon',
    description: 'Future mobility access for quick pickups and drop-offs.',
    icon: CarTaxiFront,
  },
] as const;

/** Editorial reference: terracotta + deep teal */
const HUB_TERRACOTTA = '#D97B54';
const HUB_TEAL = '#2D5D63';

const FONT_SANS = "'Inter', ui-sans-serif, system-ui, sans-serif";
const FONT_SERIF_DISPLAY = "'Playfair Display', Georgia, 'Times New Roman', serif";

/** Vector pendant lamp — dark teal shade, warm under-glow (no raster image). */
function PendantLampHero() {
  const uid = 'vajra-lamp';
  return (
    <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[360px]">
      {/* Warm pool of light on the wall */}
      <div
        className="pointer-events-none absolute left-1/2 top-[52%] z-0 h-[11rem] w-[14rem] -translate-x-1/2 rounded-full sm:h-[13rem] sm:w-[17rem]"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(255, 232, 190, 0.55) 0%, rgba(255, 200, 120, 0.22) 38%, rgba(217, 123, 84, 0.08) 62%, transparent 76%)',
          filter: 'blur(14px)',
        }}
        aria-hidden
      />
      <svg
        viewBox="0 0 320 400"
        className="relative z-10 h-auto w-full"
        style={{ filter: 'drop-shadow(0 28px 40px rgba(0,0,0,0.35))' }}
        aria-hidden
      >
        <defs>
          <linearGradient id={`${uid}-cord`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a2a2a" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>
          <linearGradient id={`${uid}-shade`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a6669" />
            <stop offset="35%" stopColor="#2f4f54" />
            <stop offset="100%" stopColor="#1a3036" />
          </linearGradient>
          <radialGradient id={`${uid}-rim`} cx="50%" cy="88%" r="75%">
            <stop offset="0%" stopColor="#fff2d6" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#ffdca0" stopOpacity="0.75" />
            <stop offset="55%" stopColor="#e8a86a" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#d97b54" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-shadeSheen`} cx="35%" cy="30%" r="55%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Cord */}
        <line
          x1="160"
          y1="4"
          x2="160"
          y2="78"
          stroke={`url(#${uid}-cord)`}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Flared bell shade */}
        <path
          d="M 160 78 
             C 198 78 232 118 248 168 
             L 268 228 
             C 272 242 262 252 248 256 
             L 72 256 
             C 58 252 48 242 52 228 
             L 72 168 
             C 88 118 122 78 160 78 Z"
          fill={`url(#${uid}-shade)`}
        />
        <path
          d="M 160 78 
             C 198 78 232 118 248 168 
             L 268 228 
             C 272 242 262 252 248 256 
             L 72 256 
             C 58 252 48 242 52 228 
             L 72 168 
             C 88 118 122 78 160 78 Z"
          fill={`url(#${uid}-shadeSheen)`}
        />
        {/* Warm light from open bottom */}
        <ellipse cx="160" cy="252" rx="102" ry="28" fill={`url(#${uid}-rim)`} />
        <ellipse cx="160" cy="248" rx="96" ry="16" fill="#f5e6c8" opacity="0.35" />
      </svg>
    </div>
  );
}

export default function PostLoginServiceHub({ onNavigate }: PostLoginServiceHubProps) {
  const modulesRef = useRef<HTMLDivElement | null>(null);

  const scrollToModules = () => {
    modulesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      className="vajra-hub-root relative overflow-x-hidden bg-black text-white antialiased"
      style={{ fontFamily: FONT_SANS }}
    >
      <style>{`
        .vajra-hub-root h1,
        .vajra-hub-root h2,
        .vajra-hub-root h3 {
          font-family: ${FONT_SERIF_DISPLAY};
        }

        .hub-serif {
          font-family: ${FONT_SERIF_DISPLAY};
        }

        .hub-grain {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.1;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        .hub-grain-strong {
          opacity: 0.32;
        }

        .hub-dot-grid {
          background-image: radial-gradient(circle, rgba(255,255,255,0.38) 1px, transparent 1px);
          background-size: 8px 8px;
        }

        .hub-watermark {
          font-family: ${FONT_SERIF_DISPLAY};
          font-size: clamp(7rem, 25vw, 16rem);
          font-weight: 700;
          line-height: 0.8;
          letter-spacing: -0.05em;
          color: rgba(170, 210, 215, 0.1);
          user-select: none;
          pointer-events: none;
        }

        .hub-module-num {
          font-family: ${FONT_SERIF_DISPLAY};
          font-weight: 600;
          color: rgba(180, 210, 220, 0.42);
        }

        .hub-module-card {
          transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 320ms ease,
            border-color 320ms ease,
            background-color 320ms ease;
        }

        .hub-module-card:focus-visible {
          outline: 2px solid rgba(255, 255, 255, 0.55);
          outline-offset: 3px;
        }

        .hub-left-gradient {
          background:
            radial-gradient(ellipse 100% 70% at 50% 28%, rgba(255, 235, 215, 0.55) 0%, transparent 52%),
            radial-gradient(ellipse 80% 60% at 15% 85%, rgba(180, 70, 50, 0.18), transparent 45%),
            radial-gradient(ellipse 70% 50% at 92% 70%, rgba(160, 60, 45, 0.15), transparent 40%),
            linear-gradient(168deg, #e8a080 0%, ${HUB_TERRACOTTA} 38%, #b85a3c 100%);
        }
      `}</style>

      <div className="relative mx-auto max-w-[1920px]">
        <header className="flex items-center justify-between gap-4 bg-black px-4 py-5 sm:px-8 lg:px-12">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.38em] text-white/55">
              The Vajra
            </p>
            <p
              className="mt-2 text-[17px] font-semibold tracking-tight text-white sm:text-[1.15rem]"
              style={{ fontFamily: FONT_SERIF_DISPLAY }}
            >
              Campus services hub
            </p>
          </div>
          <p className="hidden text-[11px] font-semibold uppercase tracking-[0.4em] text-white/45 sm:block">
            Command surface
          </p>
        </header>

        <div className="grid min-h-[calc(100vh-73px)] grid-cols-1 lg:grid-cols-2 lg:grid-rows-1">
          {/* Left — terracotta editorial + pendant lamp */}
          <div className="hub-left-gradient relative flex min-h-[520px] flex-col overflow-hidden px-6 py-8 sm:px-10 sm:py-11 lg:min-h-0">
            <div className="hub-grain" aria-hidden />
            <div
              className="pointer-events-none absolute left-6 top-6 h-[4.5rem] w-[4.5rem] hub-dot-grid opacity-[0.55] sm:left-9 sm:top-8"
              aria-hidden
            />

            <div className="relative z-10 flex flex-1 flex-col items-stretch pt-2 sm:pt-4">
              <div className="flex justify-center">
                <PendantLampHero />
              </div>

              <div className="mt-8 w-full max-w-xl text-left sm:mt-10">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/85">
                  {notes[1].eyebrow}
                </p>
                <h1 className="mt-4 text-[1.65rem] font-semibold leading-[1.22] tracking-[-0.02em] text-white sm:text-[2rem] lg:text-[2.35rem]">
                  Run food, rent, market &amp; mobility from one campus surface.
                </h1>
                <p className="mt-5 text-[0.98rem] font-normal leading-[1.7] text-white/95 sm:text-[1.05rem]">
                  {notes[1].copy}
                </p>
                <p className="mt-4 text-[0.98rem] font-normal leading-[1.7] text-white/90 sm:text-[1.02rem]">
                  <span className="font-semibold text-white">{notes[0].title}.</span> {notes[0].copy}
                </p>
              </div>

              <button
                type="button"
                onClick={scrollToModules}
                className="hub-serif relative z-20 mt-9 inline-flex min-h-[48px] w-fit items-center justify-center rounded-full bg-white px-10 text-[1.02rem] font-semibold tracking-tight text-neutral-900 shadow-[0_12px_36px_rgba(0,0,0,0.2)] transition hover:bg-white/96 hover:shadow-[0_16px_44px_rgba(0,0,0,0.26)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:mt-10"
              >
                Get started
              </button>
            </div>
          </div>

          {/* Right — deep teal + grain + modules */}
          <div
            ref={modulesRef}
            id="vajra-modules"
            className="relative flex flex-col overflow-hidden px-6 py-10 sm:px-10 sm:py-12"
            style={{ backgroundColor: HUB_TEAL }}
          >
            <div className="hub-grain hub-grain-strong" aria-hidden />

            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
              aria-hidden
            >
              <span className="hub-watermark">D</span>
            </div>

            <div className="relative z-10 mb-9 max-w-2xl">
              <h2 className="text-[1.65rem] font-semibold leading-[1.2] tracking-[-0.02em] text-white sm:text-[2rem] lg:text-[2.35rem]">
                Drive your design to a new age
              </h2>
              <p className="mt-4 text-[0.98rem] font-normal leading-[1.7] text-white/82 sm:text-[1.05rem]">
                {notes[2].title} — each numbered space below opens the same live module you already use.
              </p>
            </div>

            <div className="relative z-10 grid flex-1 grid-cols-1 gap-3.5 min-[520px]:grid-cols-2 sm:gap-4">
              {serviceCards.map((card, index) => {
                const Icon = card.icon;
                const num = String(index + 1).padStart(2, '0');
                const statusLower = card.status.toLowerCase();
                const isLiveNow = statusLower.includes('live');
                const isBooking = statusLower.includes('booking');
                const isSoon = statusLower.includes('soon');

                let badgeClass = 'border-white/22 bg-white/12 text-white/92';
                if (isSoon) {
                  badgeClass = 'border-white/20 bg-black/25 text-white/78';
                } else if (isBooking) {
                  badgeClass = 'border-[#1f3d44] bg-[#17353c] text-white/95';
                } else if (isLiveNow) {
                  badgeClass = 'border-emerald-400/35 bg-emerald-500/22 text-emerald-50';
                }

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => onNavigate(card.id)}
                    className="hub-module-card group relative flex min-h-[200px] flex-col overflow-hidden rounded-[1.35rem] border border-white/16 bg-white/[0.1] px-5 py-5 text-left shadow-[0_8px_32px_rgba(0,0,0,0.14)] backdrop-blur-[20px] hover:-translate-y-1 hover:border-white/26 hover:bg-white/[0.15] hover:shadow-[0_20px_50px_rgba(0,0,0,0.22)] sm:min-h-[228px] sm:rounded-3xl sm:px-6 sm:py-6"
                  >
                    <div className="hub-module-num pointer-events-none absolute -right-1 -top-4 text-[4.1rem] leading-none transition-colors duration-300 group-hover:text-[rgba(190,220,230,0.5)] sm:text-[4.85rem]">
                      {num}
                    </div>

                    <div className="relative flex items-start justify-between gap-3">
                      <span className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full border border-white/26 bg-white/[0.12] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] sm:h-14 sm:w-14">
                        <Icon className="h-[21px] w-[21px] sm:h-6 sm:w-6" strokeWidth={1.65} />
                      </span>
                      <span
                        className={`shrink-0 rounded-full border px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] ${badgeClass}`}
                      >
                        {card.status}
                      </span>
                    </div>

                    <h3 className="relative mt-5 text-[1.12rem] font-semibold tracking-[-0.01em] text-white sm:text-[1.22rem]">
                      {card.title}
                    </h3>
                    <p className="relative mt-2.5 flex-1 text-[0.92rem] font-normal leading-[1.62] text-white/78 sm:text-[0.95rem]">
                      {card.description}
                    </p>

                    <span className="relative mt-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/85">
                      Open module
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
