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

const HUB_ORANGE = '#E58A67';
const HUB_TEAL = '#2A6067';

export default function PostLoginServiceHub({ onNavigate }: PostLoginServiceHubProps) {
  const modulesRef = useRef<HTMLDivElement | null>(null);

  const scrollToModules = () => {
    modulesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative min-h-screen overflow-x-hidden bg-[#0c0c0c] text-white">
      <style>{`
        .hub-grain {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.14;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        .hub-dot-grid {
          background-image: radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1px);
          background-size: 10px 10px;
        }

        .hub-watermark {
          font-size: clamp(8rem, 28vw, 18rem);
          font-weight: 800;
          line-height: 0.85;
          letter-spacing: -0.06em;
          color: rgba(255, 255, 255, 0.06);
          user-select: none;
          pointer-events: none;
        }

        .hub-module-card {
          transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 320ms ease,
            border-color 320ms ease,
            background-color 320ms ease;
        }

        .hub-module-card:focus-visible {
          outline: 2px solid rgba(255, 255, 255, 0.5);
          outline-offset: 3px;
        }
      `}</style>

      <div className="relative mx-auto max-w-[1920px]">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <span className="hidden h-2 w-2 rounded-full bg-white/70 sm:block" aria-hidden />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/45">The Vajra</p>
              <p className="mt-0.5 text-sm font-medium text-white/90">Campus services hub</p>
            </div>
          </div>
          <p className="hidden text-[10px] uppercase tracking-[0.3em] text-white/40 sm:block">
            Command surface
          </p>
        </header>

        <div className="grid min-h-[calc(100vh-57px)] grid-cols-1 lg:grid-cols-2">
          {/* Left — warm hero */}
          <div
            className="relative flex min-h-[420px] flex-col justify-between overflow-hidden px-6 py-10 sm:px-10 sm:py-12 lg:min-h-0"
            style={{ backgroundColor: HUB_ORANGE }}
          >
            <div className="hub-grain" aria-hidden />
            <div
              className="pointer-events-none absolute left-6 top-8 h-24 w-24 hub-dot-grid opacity-[0.35] sm:left-10"
              aria-hidden
            />

            <div className="relative z-10 max-w-lg">
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/80">
                {notes[1].eyebrow}
              </p>
              <h1 className="mt-4 text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
                Run food, rent, market &amp; mobility from one campus surface.
              </h1>
              <p className="mt-5 text-sm leading-relaxed text-white/90 sm:text-base">{notes[1].copy}</p>
              <p className="mt-6 border-l-2 border-white/40 pl-4 text-xs leading-6 text-white/85 sm:text-sm">
                <span className="font-semibold text-white">{notes[0].title}.</span> {notes[0].copy}
              </p>
            </div>

            <div className="relative z-10 mt-8 flex flex-1 flex-col items-center justify-end lg:mt-0">
              <div className="relative w-full max-w-md">
                <div className="pointer-events-none absolute -inset-6 rounded-full bg-black/10 blur-3xl" aria-hidden />
                <img
                  src="/area/vajra-hero-drone.jpg"
                  alt="Vajra delivery drone"
                  className="relative z-10 mx-auto w-full max-w-[420px] object-contain drop-shadow-2xl"
                />
              </div>
              <button
                type="button"
                onClick={scrollToModules}
                className="relative z-20 mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-neutral-900 shadow-lg shadow-black/20 transition hover:bg-white/95 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                Choose a module
              </button>
            </div>
          </div>

          {/* Right — teal + 2×2 modules */}
          <div
            ref={modulesRef}
            id="vajra-modules"
            className="relative flex flex-col overflow-hidden px-6 py-10 sm:px-10 sm:py-12"
            style={{ backgroundColor: HUB_TEAL }}
          >
            <div className="hub-grain" aria-hidden />

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
              <span className="hub-watermark">V</span>
            </div>

            <div className="relative z-10 mb-8 max-w-xl">
              <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-[2rem]">
                Pick where you want to go next
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
                {notes[2].title} — each tile opens the same live flow you already use; only the layout is new.
              </p>
            </div>

            <div className="relative z-10 grid flex-1 grid-cols-1 gap-3 min-[520px]:grid-cols-2 sm:gap-4">
              {serviceCards.map((card, index) => {
                const Icon = card.icon;
                const num = String(index + 1).padStart(2, '0');
                const isLive =
                  card.status.toLowerCase().includes('live') || card.status.toLowerCase().includes('booking');
                const isSoon = card.status.toLowerCase().includes('soon');

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => onNavigate(card.id)}
                    className="hub-module-card group relative flex min-h-[200px] flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/10 px-5 py-5 text-left shadow-lg shadow-black/10 backdrop-blur-md hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.14] hover:shadow-2xl hover:shadow-black/20 sm:min-h-[220px] sm:rounded-3xl sm:px-6 sm:py-6"
                  >
                    <div className="pointer-events-none absolute -right-2 -top-6 text-7xl font-bold tabular-nums text-white/[0.12] transition-colors duration-300 group-hover:text-white/[0.18] sm:text-8xl">
                      {num}
                    </div>

                    <div className="relative flex items-start justify-between gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-inner sm:h-14 sm:w-14">
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.75} />
                      </span>
                      <span
                        className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                          isSoon
                            ? 'border-white/25 bg-black/15 text-white/85'
                            : isLive
                              ? 'border-emerald-300/40 bg-emerald-400/20 text-emerald-50'
                              : 'border-white/25 bg-white/10 text-white/90'
                        }`}
                      >
                        {card.status}
                      </span>
                    </div>

                    <h3 className="relative mt-5 text-lg font-semibold tracking-wide text-white sm:text-xl">
                      {card.title}
                    </h3>
                    <p className="relative mt-2 flex-1 text-sm leading-relaxed text-white/75">{card.description}</p>

                    <span className="relative mt-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/95">
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
