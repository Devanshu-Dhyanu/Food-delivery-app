import {
  ArrowRight,
  Compass,
  Instagram,
  Rocket,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { useEffect } from 'react';

interface FounderPageProps {
  onNavigate?: (page: string) => void;
  publicView?: boolean;
}

const FOUNDER_NAME = 'Devanshu Dhyanu';
const FOUNDER_ROLE = 'Founder, The Vajra Campus Delivery';
const FOUNDER_EMAIL = 'founder-thevajra@vajracognixia.in';
const FOUNDER_INSTAGRAM_URL = 'https://www.instagram.com/devanshu_dhyanu/';
const COMPANY_INSTAGRAM_URL = 'https://www.instagram.com/vajracognixia.in/';
const DEFAULT_TITLE =
  'The Vajra Campus Delivery | The VajraCognixia Technologies Private Limited';
const DEFAULT_DESCRIPTION =
  'The Vajra Campus Delivery is the campus ordering platform by The VajraCognixia Technologies Private Limited for food delivery, student marketplace access, and campus services.';
const DEFAULT_CANONICAL = 'https://www.vajracognixia.in/';
const DEFAULT_IMAGE = 'https://www.vajracognixia.in/the-vajra-mark.svg';

const FOUNDER_TITLE = `${FOUNDER_NAME} | Founder of The Vajra Campus Delivery`;
const FOUNDER_DESCRIPTION =
  `${FOUNDER_NAME} is the founder of The Vajra Campus Delivery. Read the founder story, mission, and product vision behind the platform by The VajraCognixia Technologies Private Limited.`;
const FOUNDER_CANONICAL = 'https://www.vajracognixia.in/founder';
const FOUNDER_IMAGE = 'https://www.vajracognixia.in/founder.png';

const upsertMeta = (
  selector: string,
  attributeName: 'content' | 'href',
  value: string,
  fallback: { tagName: 'meta' | 'link'; attrs: Record<string, string> }
) => {
  let element = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;

  if (!element) {
    element = document.createElement(fallback.tagName);
    Object.entries(fallback.attrs).forEach(([key, attrValue]) => {
      element?.setAttribute(key, attrValue);
    });
    document.head.appendChild(element);
  }

  element.setAttribute(attributeName, value);
};

const applyDefaultSeo = () => {
  document.title = DEFAULT_TITLE;
  upsertMeta('meta[name="description"]', 'content', DEFAULT_DESCRIPTION, {
    tagName: 'meta',
    attrs: { name: 'description' },
  });
  upsertMeta('link[rel="canonical"]', 'href', DEFAULT_CANONICAL, {
    tagName: 'link',
    attrs: { rel: 'canonical' },
  });
  upsertMeta('meta[property="og:title"]', 'content', DEFAULT_TITLE, {
    tagName: 'meta',
    attrs: { property: 'og:title' },
  });
  upsertMeta('meta[property="og:description"]', 'content', DEFAULT_DESCRIPTION, {
    tagName: 'meta',
    attrs: { property: 'og:description' },
  });
  upsertMeta('meta[property="og:url"]', 'content', DEFAULT_CANONICAL, {
    tagName: 'meta',
    attrs: { property: 'og:url' },
  });
  upsertMeta('meta[property="og:image"]', 'content', DEFAULT_IMAGE, {
    tagName: 'meta',
    attrs: { property: 'og:image' },
  });
  upsertMeta('meta[name="twitter:title"]', 'content', DEFAULT_TITLE, {
    tagName: 'meta',
    attrs: { name: 'twitter:title' },
  });
  upsertMeta('meta[name="twitter:description"]', 'content', DEFAULT_DESCRIPTION, {
    tagName: 'meta',
    attrs: { name: 'twitter:description' },
  });
  upsertMeta('meta[name="twitter:image"]', 'content', DEFAULT_IMAGE, {
    tagName: 'meta',
    attrs: { name: 'twitter:image' },
  });
};

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

export default function FounderPage({ onNavigate, publicView = false }: FounderPageProps) {
  useEffect(() => {
    document.title = FOUNDER_TITLE;
    upsertMeta('meta[name="description"]', 'content', FOUNDER_DESCRIPTION, {
      tagName: 'meta',
      attrs: { name: 'description' },
    });
    upsertMeta('link[rel="canonical"]', 'href', FOUNDER_CANONICAL, {
      tagName: 'link',
      attrs: { rel: 'canonical' },
    });
    upsertMeta('meta[property="og:title"]', 'content', FOUNDER_TITLE, {
      tagName: 'meta',
      attrs: { property: 'og:title' },
    });
    upsertMeta('meta[property="og:description"]', 'content', FOUNDER_DESCRIPTION, {
      tagName: 'meta',
      attrs: { property: 'og:description' },
    });
    upsertMeta('meta[property="og:url"]', 'content', FOUNDER_CANONICAL, {
      tagName: 'meta',
      attrs: { property: 'og:url' },
    });
    upsertMeta('meta[property="og:image"]', 'content', FOUNDER_IMAGE, {
      tagName: 'meta',
      attrs: { property: 'og:image' },
    });
    upsertMeta('meta[name="twitter:title"]', 'content', FOUNDER_TITLE, {
      tagName: 'meta',
      attrs: { name: 'twitter:title' },
    });
    upsertMeta('meta[name="twitter:description"]', 'content', FOUNDER_DESCRIPTION, {
      tagName: 'meta',
      attrs: { name: 'twitter:description' },
    });
    upsertMeta('meta[name="twitter:image"]', 'content', FOUNDER_IMAGE, {
      tagName: 'meta',
      attrs: { name: 'twitter:image' },
    });

    const existingSchema = document.getElementById('founder-page-schema');
    existingSchema?.remove();

    const schema = document.createElement('script');
    schema.id = 'founder-page-schema';
    schema.type = 'application/ld+json';
    schema.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      name: FOUNDER_TITLE,
      url: FOUNDER_CANONICAL,
      description: FOUNDER_DESCRIPTION,
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: FOUNDER_IMAGE,
      },
      mainEntity: {
        '@type': 'Person',
        name: FOUNDER_NAME,
        jobTitle: FOUNDER_ROLE,
        email: FOUNDER_EMAIL,
        image: FOUNDER_IMAGE,
        url: FOUNDER_CANONICAL,
        sameAs: [FOUNDER_INSTAGRAM_URL],
        worksFor: {
          '@type': 'Organization',
          name: 'The VajraCognixia Technologies Private Limited',
        },
      },
      about: {
        '@type': 'Organization',
        name: 'The VajraCognixia Technologies Private Limited',
        brand: {
          '@type': 'Brand',
          name: 'The Vajra Campus Delivery',
        },
        sameAs: [COMPANY_INSTAGRAM_URL],
      },
    });

    document.head.appendChild(schema);

    return () => {
      document.getElementById('founder-page-schema')?.remove();
      applyDefaultSeo();
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[32px] border border-white/5 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.16),rgba(249,115,22,0.04)_26%,rgba(17,24,39,0.96)_62%),linear-gradient(135deg,rgba(17,24,39,0.98),rgba(15,23,42,0.98))] shadow-2xl shadow-black/25">
        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.2fr,0.8fr] lg:px-8 lg:py-10">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-200">
              <Sparkles className="h-4 w-4" />
              Founder & Vision
            </div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-orange-300/90">
              {FOUNDER_NAME} | {FOUNDER_ROLE}
            </p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {FOUNDER_NAME} is building The Vajra to fix everyday campus friction.
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-gray-300 sm:text-base">
              This is the founder page for {FOUNDER_NAME}, the founder behind The Vajra Campus
              Delivery. It explains why the platform exists, what it is trying to solve, and how
              the product is being shaped for a faster, cleaner campus experience.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-orange-100/80 sm:text-base">
              Founder and business queries can be directed to {FOUNDER_EMAIL} while the broader
              platform continues growing under The VajraCognixia Technologies Private Limited.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={FOUNDER_INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Instagram className="h-4 w-4" />
                <span>@devanshu_dhyanu</span>
              </a>
              <a
                href={COMPANY_INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Instagram className="h-4 w-4" />
                <span>@vajracognixia.in</span>
              </a>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {publicView ? (
                <>
                  <a
                    href="/"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                  >
                    <span>Visit The Vajra</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href={`mailto:${FOUNDER_EMAIL}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    <UserRound className="h-4 w-4" />
                    <span>Founder contact</span>
                  </a>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('home')}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                  >
                    <span>Explore The Vajra</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('profile')}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    <UserRound className="h-4 w-4" />
                    <span>Back to profile</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-white/8 bg-black/20 backdrop-blur-sm">
            <div className="relative">
              <img
                src="/founder.png"
                alt={`${FOUNDER_NAME}, founder of The Vajra Campus Delivery`}
                className="h-[420px] w-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
                  Founder note
                </p>
                <p className="mt-2 text-sm font-semibold text-orange-100">{FOUNDER_NAME}</p>
                <p className="mt-3 text-2xl font-bold text-white">
                  Build something campus users actually want to keep opening.
                </p>
                <p className="mt-3 text-sm leading-7 text-gray-200">
                  {FOUNDER_NAME} is shaping The Vajra around speed, clarity, and daily usefulness.
                  The focus is not just on placing an order, but on reducing the small repeated
                  hassles that make campus life slower than it should be.
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
