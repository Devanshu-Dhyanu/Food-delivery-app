import {
  ArrowRight,
  Compass,
  Rocket,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';

interface FounderPageProps {
  onNavigate: (page: string) => void;
}

const founderPrinciples = [
  {
    title: 'Campus-first thinking',
    description:
      'Every screen is shaped around the real daily flow of students and teachers, not a generic food app template.',
    icon: Compass,
  },
  {
    title: 'Trust in every step',
    description:
      'Clear order tracking, wallet history, issue reporting, and cancellation support are built in to keep the experience reliable.',
    icon: ShieldCheck,
  },
  {
    title: 'One evolving platform',
    description:
      'The Vajra starts with food delivery, but it is designed to grow into a broader campus-services ecosystem over time.',
    icon: Rocket,
  },
] as const;

const roadmapHighlights = [
  'Fast restaurant ordering with cleaner delivery coordination.',
  'Wallet, support, and reorder flows that reduce repeat friction.',
  'A stronger multi-service campus layer for rentals and future essentials.',
];

export default function FounderPage({ onNavigate }: FounderPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[32px] border border-white/5 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.16),rgba(249,115,22,0.04)_26%,rgba(17,24,39,0.96)_62%),linear-gradient(135deg,rgba(17,24,39,0.98),rgba(15,23,42,0.98))] shadow-2xl shadow-black/25">
        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.2fr,0.8fr] lg:px-8 lg:py-10">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-200">
              <Sparkles className="h-4 w-4" />
              Founder & Vision
            </div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              The story behind The Vajra starts with fixing everyday campus friction.
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-gray-300 sm:text-base">
              This page is the brand-facing founder space for The Vajra. It explains why the
              platform exists, what it is trying to solve, and how the product is being shaped for
              a faster, cleaner campus experience.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
              >
                <span>Explore The Vajra</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <UserRound className="h-4 w-4" />
                <span>Back to profile</span>
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-white/8 bg-black/20 backdrop-blur-sm">
            <div className="relative">
              <img
                src="/founder.png"
                alt="Founder of The Vajra"
                className="h-[420px] w-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
                  Founder note
                </p>
                <p className="mt-3 text-2xl font-bold text-white">
                  Build something campus users actually want to keep opening.
                </p>
                <p className="mt-3 text-sm leading-7 text-gray-200">
                  The Vajra is being shaped around speed, clarity, and daily usefulness. The focus
                  is not just on placing an order, but on reducing the small repeated hassles that
                  make campus life slower than it should be.
                </p>
              </div>
            </div>

            <div className="grid gap-3 p-6 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Current focus</p>
                <p className="mt-2 text-sm font-semibold text-white">Food delivery and support</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Built around</p>
                <p className="mt-2 text-sm font-semibold text-white">Students and teachers</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Direction</p>
                <p className="mt-2 text-sm font-semibold text-white">One campus platform</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {founderPrinciples.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-[28px] border border-white/5 bg-gradient-to-br from-white/5 via-gray-900 to-gray-900 p-6 shadow-xl shadow-black/20"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10 text-orange-200">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-gray-400">{item.description}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
        <div className="rounded-[28px] border border-white/5 bg-gradient-to-br from-orange-500/10 via-gray-900 to-gray-900 p-6 shadow-xl shadow-black/20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
            Why this page matters
          </p>
          <h2 className="mt-3 text-2xl font-bold text-white">
            A founder page gives the product a visible identity.
          </h2>
          <p className="mt-4 text-sm leading-7 text-gray-300">
            It helps users trust the platform more, gives the brand a human layer, and creates a
            natural space for future founder details like profile photo, social links, or a more
            personal story when you want to add them.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/5 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/95 p-6 shadow-xl shadow-black/20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
            What comes next
          </p>
          <div className="mt-5 space-y-3">
            {roadmapHighlights.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-4"
              >
                <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-[11px] font-bold text-orange-200">
                  +
                </span>
                <p className="text-sm leading-6 text-gray-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
