import { ArrowUpRight, CarFront, CarTaxiFront, Store, UtensilsCrossed } from 'lucide-react';

type HubTarget = 'home' | 'car-rent' | 'second-hand-market' | 'taxi';

interface PostLoginServiceHubProps {
  onNavigate: (page: HubTarget) => void;
}

const serviceCards: Array<{
  id: HubTarget;
  title: string;
  status: string;
  icon: typeof UtensilsCrossed;
}> = [
  { id: 'home', title: 'Food Delivery', status: 'Live now', icon: UtensilsCrossed },
  { id: 'car-rent', title: 'Car Rental', status: 'Now booking', icon: CarFront },
  { id: 'second-hand-market', title: 'Second Hand Market', status: 'Live now', icon: Store },
  { id: 'taxi', title: 'Taxi', status: 'Coming soon', icon: CarTaxiFront },
];

export default function PostLoginServiceHub({ onNavigate }: PostLoginServiceHubProps) {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_24%),linear-gradient(180deg,#090909_0%,#010101_100%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1700px] flex-col items-center justify-between px-3 py-3 sm:px-4 sm:py-4">
        <div className="relative flex w-full flex-1 items-center justify-center">
          <img
            src="/area/reference-login-hub.png"
            alt="Reference service hub"
            className="h-full max-h-[calc(100vh-120px)] w-full rounded-[18px] border border-white/10 object-contain shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
          />
        </div>

        <div className="relative z-10 mt-3 grid w-full max-w-6xl gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {serviceCards.map((card) => {
            const Icon = card.icon;

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onNavigate(card.id)}
                className="group relative overflow-hidden rounded-[18px] border border-lime-400/20 bg-[linear-gradient(180deg,rgba(18,18,18,0.92),rgba(7,7,7,0.96))] px-4 py-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-lime-300/45 hover:shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(190,242,100,0.15),transparent_28%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-white/10 bg-white/5 text-lime-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/55">
                    {card.status}
                  </span>
                </div>

                <h2 className="relative mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-white sm:text-base">
                  {card.title}
                </h2>

                <span className="relative mt-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-lime-300">
                  Open
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
