import { ArrowUpRight, CarFront, CarTaxiFront, Store, UtensilsCrossed } from 'lucide-react';

type HubTarget = 'home' | 'car-rent' | 'second-hand-market' | 'taxi';

interface PostLoginServiceHubProps {
  onNavigate: (page: HubTarget) => void;
}

const leftMenu = ['Service', 'Identity', 'Command', 'System Inspection', 'Development'] as const;
const rightMenu = ['K x', 'K Radar', 'K Mobility'] as const;

const notes = [
  {
    eyebrow: 'Field note',
    title: 'We created a workflow for a Vajraian drone',
    copy:
      'The post-login screen now works as the command surface where the user chooses a live module before entering the main customer flow.',
    className: 'top-note',
  },
  {
    eyebrow: 'x x x',
    title: 'Primary brief',
    copy:
      'Food delivery, car rental, second hand market, and taxi stay visible together so the platform feels like one futuristic campus system.',
    className: 'center-note',
  },
  {
    eyebrow: 'Field note',
    title: 'The next step was creating visual cues',
    copy:
      'Target rings, status labels, floating panels, and restrained neon accents recreate the cinematic command mood more naturally.',
    className: 'bottom-note',
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

export default function PostLoginServiceHub({ onNavigate }: PostLoginServiceHubProps) {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#090909] text-white">
      <style>{`
        @keyframes hubClouds {
          0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.9; }
          100% { transform: translate3d(0, 18px, 0) scale(1.04); opacity: 1; }
        }

        @keyframes hubPulse {
          0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.74; transform: translateX(-50%) scale(1.28); }
        }

        @keyframes hubFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes hubSweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes hubGlow {
          0%, 100% { text-shadow: 0 0 8px rgba(190,242,100,0.18); }
          50% { text-shadow: 0 0 18px rgba(190,242,100,0.42); }
        }

        .hub-shell::before {
          content: "";
          position: absolute;
          inset: -4% -6% 52% -6%;
          background:
            radial-gradient(circle at 50% 14%, rgba(255,255,255,0.18), transparent 22%),
            radial-gradient(circle at 22% 30%, rgba(255,255,255,0.08), transparent 18%),
            radial-gradient(circle at 78% 28%, rgba(255,255,255,0.08), transparent 20%),
            radial-gradient(circle at 15% 72%, rgba(112,112,112,0.16), transparent 18%),
            radial-gradient(circle at 85% 68%, rgba(112,112,112,0.18), transparent 18%),
            linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0));
          filter: blur(24px);
          opacity: 0.92;
          pointer-events: none;
          animation: hubClouds 12s ease-in-out infinite alternate;
        }

        .hub-shell::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 100% 4px;
          opacity: 0.055;
          pointer-events: none;
        }

        .hub-grid {
          display: grid;
          grid-template-columns: 170px minmax(0, 1fr) 170px;
          gap: 22px;
        }

        .hub-left-thumb img {
          filter: grayscale(1) contrast(1.12) brightness(0.85);
        }

        .hub-ring::before,
        .hub-ring::after {
          content: "";
          position: absolute;
          border-radius: 999px;
          inset: 0;
        }

        .hub-ring::before {
          border: 1px dashed rgba(255,255,255,0.08);
        }

        .hub-ring::after {
          inset: 14%;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .hub-ring-sweep {
          position: absolute;
          inset: -1px;
          border-radius: 999px;
          border-top: 1px solid rgba(190,242,100,0.16);
          border-right: 1px solid transparent;
          border-bottom: 1px solid transparent;
          border-left: 1px solid transparent;
          animation: hubSweep 16s linear infinite;
        }

        .hub-beacon::before {
          content: "";
          position: absolute;
          left: 50%;
          top: -3px;
          width: 12px;
          height: 12px;
          border-radius: 999px;
          background: #ef4444;
          box-shadow: 0 0 18px rgba(239,68,68,0.85), 0 0 28px rgba(239,68,68,0.35);
          transform: translateX(-50%);
          animation: hubPulse 1.7s ease-in-out infinite;
        }

        .hub-drone-wrap {
          animation: hubFloat 8s ease-in-out infinite;
        }

        .hub-note {
          animation: hubFloat 7s ease-in-out infinite;
        }

        .hub-note.center-note {
          animation-delay: -1.3s;
        }

        .hub-note.bottom-note {
          animation-delay: -2.6s;
        }

        .hub-main-title {
          animation: hubGlow 2.8s ease-in-out infinite;
        }

        @media (max-width: 1180px) {
          .hub-grid {
            grid-template-columns: 1fr;
          }

          .hub-side {
            display: none;
          }
        }

        @media (max-width: 860px) {
          .hub-main-stage {
            min-height: 860px;
          }
        }

        @media (max-width: 640px) {
          .hub-main-stage {
            min-height: 920px;
          }
        }
      `}</style>

      <div className="hub-shell relative mx-auto min-h-screen max-w-[1700px] border-x border-white/6 px-4 pb-7 pt-4 sm:px-5 lg:px-7">
        <div className="mb-4 flex items-start justify-between gap-4 text-[10px] uppercase tracking-[0.38em] text-white/42">
          <div className="flex items-start gap-4">
            <div className="mt-3 h-px w-10 bg-white/85" />
            <div>
              <p className="font-semibold text-white/82">Vajra Dynamics</p>
              <p className="mt-2">Experimental Field</p>
            </div>
          </div>
          <div className="hidden gap-7 sm:flex">
            <span>Command</span>
            <span>Sector Zero</span>
            <span>05:24</span>
          </div>
        </div>

        <div className="hub-grid">
          <aside className="hub-side flex flex-col justify-between pt-12 text-[11px] uppercase tracking-[0.26em]">
            <div>
              <p className="mb-8 text-white/36">Overview</p>
              <div className="space-y-4 text-lime-300/82">
                {leftMenu.map((item) => (
                  <div key={item} className="flex gap-3">
                    <span>x</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 pb-28">
              <div className="hub-left-thumb w-[74px] border border-white/10 bg-white/[0.03] p-1.5">
                <img src="/area/podium.png" alt="Command core" className="h-[54px] w-full object-cover" />
                <p className="mt-2 text-[8px] uppercase tracking-[0.25em] text-lime-300/84">Command core</p>
              </div>
              <div className="hub-left-thumb w-[74px] border border-white/10 bg-white/[0.03] p-1.5">
                <img src="/area/balance.png" alt="Commercial" className="h-[54px] w-full object-cover" />
                <p className="mt-2 text-[8px] uppercase tracking-[0.25em] text-lime-300/84">Commercial</p>
              </div>
            </div>
          </aside>

          <main className="hub-main-stage relative min-h-[980px] overflow-hidden rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(9,10,11,0.96),rgba(0,0,0,0.98))] px-3 py-4 sm:px-5 lg:px-8">
            <div className="pointer-events-none absolute inset-x-[6%] top-[4%] h-[30%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_52%)] blur-3xl" />
            <div className="pointer-events-none absolute inset-x-0 top-[30%] h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.94)_62%)]" />

            <div className="hub-drone-wrap relative z-10 flex justify-center pt-6 sm:pt-10">
              <div className="pointer-events-none absolute top-0 h-48 w-[70%] rounded-full bg-white/10 blur-[110px]" />
              <img
                src="/area/vajra-hero-drone.jpg"
                alt="Vajra drone visual"
                className="w-full max-w-[980px] object-contain opacity-[0.88] [mask-image:linear-gradient(180deg,black_0%,black_68%,transparent_100%)]"
              />
              <div className="hub-beacon absolute left-1/2 top-3 h-44 w-px -translate-x-1/2 bg-[linear-gradient(180deg,rgba(239,68,68,0.95),rgba(239,68,68,0))]" />
            </div>

            <div className="absolute inset-x-0 top-[44%] z-10 flex justify-center">
              <div className="relative h-[360px] w-[360px] sm:h-[420px] sm:w-[420px] md:h-[500px] md:w-[500px]">
                <div className="hub-ring absolute inset-0 rounded-full" />
                <div className="hub-ring-sweep" />
              </div>
            </div>

            <div className="absolute left-1/2 top-[57%] z-20 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="mb-2 flex items-center justify-center gap-14 text-[24px] text-white/12">
                <span>&gt;&gt;</span>
                <span>&lt;&lt;</span>
              </div>
              <h1 className="hub-main-title text-[34px] font-black uppercase leading-[0.9] tracking-[0.02em] text-lime-300 sm:text-[48px]">
                <span className="block">Main</span>
                <span className="block">Task Of</span>
                <span className="block">The</span>
                <span className="block">Project</span>
              </h1>
            </div>

            <div className="pointer-events-none absolute right-[4%] top-[47%] z-20 space-y-4 sm:right-[6%]">
              {notes
                .filter((note) => note.className !== 'center-note')
                .map((note) => (
                  <article
                    key={note.title}
                    className={`hub-note ${note.className} relative w-[220px] border border-white/10 bg-[#1a1b1d]/92 px-4 py-4 backdrop-blur-md sm:w-[250px]`}
                  >
                    <div className="absolute right-0 top-[50%] h-10 w-3 -translate-y-1/2 bg-lime-300 [clip-path:polygon(100%_0,100%_100%,0_82%,0_18%)]" />
                    <p className="mb-4 text-[9px] uppercase tracking-[0.34em] text-lime-300/88">{note.eyebrow}</p>
                    <h3 className="mb-3 text-[12px] font-medium leading-6 text-white/88">{note.title}</h3>
                    <p className="text-[10px] leading-6 text-white/58">{note.copy}</p>
                  </article>
                ))}

              <div className="ml-auto h-[82px] w-[82px] border-b border-r border-lime-300/55" />
            </div>

            <article className="hub-note center-note absolute bottom-[18%] left-1/2 z-20 w-[220px] translate-x-[-8%] border border-white/10 bg-[#1a1b1d]/92 px-4 py-4 backdrop-blur-md sm:w-[250px] md:bottom-[14%]">
              <div className="absolute right-0 top-[50%] h-14 w-3 -translate-y-1/2 bg-lime-300 [clip-path:polygon(100%_0,100%_100%,0_82%,0_18%)]" />
              <p className="mb-4 text-[9px] uppercase tracking-[0.34em] text-lime-300/88">{notes[1].eyebrow}</p>
              <h3 className="mb-3 text-[12px] font-medium leading-6 text-white/88">{notes[1].title}</h3>
              <p className="text-[10px] leading-6 text-white/58">{notes[1].copy}</p>
            </article>
          </main>

          <aside className="hub-side pt-12 text-[11px] uppercase tracking-[0.26em]">
            <div className="mb-8 flex items-center justify-between text-white/36">
              <span>Signal</span>
              <span>05:24</span>
            </div>
            <div className="space-y-4 text-lime-300/82">
              {rightMenu.map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <span>{item}</span>
                  <span>x</span>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {serviceCards.map((card) => {
            const Icon = card.icon;

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onNavigate(card.id)}
                className="group relative overflow-hidden rounded-[24px] border border-lime-300/18 bg-[linear-gradient(180deg,rgba(20,20,20,0.94),rgba(8,8,8,0.98))] px-5 py-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-lime-300/34 hover:shadow-[0_20px_48px_rgba(0,0,0,0.45)]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(190,242,100,0.12),transparent_30%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.03] text-lime-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="pt-1 text-[11px] uppercase tracking-[0.36em] text-white/56">{card.status}</span>
                  </div>

                  <h2 className="mt-6 text-xl font-semibold uppercase tracking-[0.16em] text-white">{card.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-white/54">{card.description}</p>

                  <span className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-lime-300">
                    Open module
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
