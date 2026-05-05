import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Camera,
  ChevronRight,
  Compass,
  Globe2,
  Instagram,
  LayoutGrid,
  Mail,
  MapPin,
  PlayCircle,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UserRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { DEFAULT_SEO } from '../lib/seo';

interface FounderPageProps {
  onNavigate?: (page: string) => void;
  publicView?: boolean;
}

const FOUNDER_NAME = 'Devanshu Dhyanu';
const FOUNDER_ROLE = 'Founder, The Vajra Campus Delivery';
const FOUNDER_EMAIL = 'founder-thevajra@vajracognixia.in';
const FOUNDER_INSTAGRAM_URL = 'https://www.instagram.com/devanshu_dhyanu/';
const COMPANY_INSTAGRAM_URL = 'https://www.instagram.com/vajracognixia.in/';
const DEFAULT_TITLE = DEFAULT_SEO.title;
const DEFAULT_DESCRIPTION = DEFAULT_SEO.description;
const DEFAULT_CANONICAL = DEFAULT_SEO.canonical;
const DEFAULT_IMAGE = DEFAULT_SEO.image;

const FOUNDER_TITLE = `${FOUNDER_NAME} | Founder of The Vajra Campus Delivery`;
const FOUNDER_DESCRIPTION =
  `${FOUNDER_NAME} is the founder of The Vajra Campus Delivery. Read the founder story, mission, and product vision behind the platform by The VajraCognixia Technologies Private Limited.`;
const FOUNDER_CANONICAL = 'https://www.vajracognixia.in/founder';
const FOUNDER_IMAGE = 'https://www.vajracognixia.in/founder.png';
const FOUNDER_INITIALS = 'DD';

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

const profileSections = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'focus', label: 'Focus', icon: Target },
  { id: 'milestones', label: 'Milestones', icon: Trophy },
  { id: 'media', label: 'Media', icon: PlayCircle },
  { id: 'gallery', label: 'Gallery', icon: Camera },
] as const;

type ProfileSectionId = (typeof profileSections)[number]['id'];

const founderHeroTraits = [
  {
    title: 'Campus-first builder',
    description:
      'Every product decision starts from the daily rhythm of students, staff, and operators.',
    icon: Compass,
  },
  {
    title: 'System-minded execution',
    description:
      'The focus is on making ordering, support, and delivery coordination feel like one clean flow.',
    icon: ShieldCheck,
  },
  {
    title: 'Future logistics direction',
    description:
      'The long-term ambition is bigger than food delivery, with drone-first movement in the roadmap.',
    icon: Rocket,
  },
] as const;

const founderQuickStats = [
  { label: 'Product Thinking', value: 88 },
  { label: 'Systems Focus', value: 84 },
  { label: 'Execution Drive', value: 91 },
] as const;

const founderAffiliations = [
  {
    title: 'The Vajra',
    description: 'Campus delivery platform',
  },
  {
    title: 'VajraCognixia',
    description: 'Technology company foundation',
  },
  {
    title: 'Future logistics',
    description: 'Drone-first operating direction',
  },
] as const;

const founderOverviewPoints = [
  {
    label: 'Current mode',
    value: 'Founder-led product build',
  },
  {
    label: 'Operating lens',
    value: 'Speed, clarity, and user trust',
  },
  {
    label: 'Long-term direction',
    value: 'Campus services and drone logistics',
  },
] as const;

const founderCapabilityGroups = [
  {
    title: 'Product Direction',
    stats: [
      { label: 'Problem clarity', value: 91 },
      { label: 'Experience structure', value: 87 },
      { label: 'Feature prioritisation', value: 89 },
      { label: 'Delivery simplicity', value: 86 },
    ],
  },
  {
    title: 'Operating Model',
    stats: [
      { label: 'Execution discipline', value: 90 },
      { label: 'System mapping', value: 85 },
      { label: 'Support readiness', value: 82 },
      { label: 'Iteration speed', value: 88 },
    ],
  },
  {
    title: 'Founder Vision',
    stats: [
      { label: 'Campus utility', value: 92 },
      { label: 'Long-term ambition', value: 93 },
      { label: 'Category differentiation', value: 86 },
      { label: 'Brand direction', value: 84 },
    ],
  },
] as const;

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

const founderMilestones = [
  {
    phase: 'Phase 01',
    title: 'Campus delivery core',
    description:
      'Build a cleaner ordering and fulfilment flow that feels faster and more dependable for daily campus use.',
  },
  {
    phase: 'Phase 02',
    title: 'Trust and support depth',
    description:
      'Add stronger wallet, status, and issue-handling patterns so repeat usage feels calm and predictable.',
  },
  {
    phase: 'Phase 03',
    title: 'Multi-service foundation',
    description:
      'Expand the product into a broader campus utility layer that can support more than one repeated need.',
  },
  {
    phase: 'Phase 04',
    title: 'Drone-first logistics roadmap',
    description:
      'Shape the platform for future operational layers where speed, routing, and hardware-aware movement matter.',
  },
] as const;

const founderBuildBoard = [
  'Reduce ordering friction without adding clutter.',
  'Keep delivery communication clearer from confirmation to handoff.',
  'Design the platform for growth beyond a single service category.',
] as const;

const founderMediaCards = [
  {
    kicker: 'Founder note',
    title: 'Why The Vajra is being built around everyday campus friction.',
    description:
      'The goal is not just to place orders online, but to remove the repeated delays and confusion that make simple campus tasks slower than they should be.',
    image: '/founder.png',
    href: FOUNDER_INSTAGRAM_URL,
    cta: 'See founder profile',
    objectPosition: '50% 14%',
  },
  {
    kicker: 'Vision stream',
    title: 'The roadmap already points beyond one food-delivery use case.',
    description:
      'The product direction is toward a stronger logistics layer where visibility, movement, and future drone operations can coexist in one system.',
    image: '/area/vajra-hero-drone.jpg',
    href: '/',
    cta: 'Visit The Vajra',
    objectPosition: 'center center',
  },
  {
    kicker: 'Coverage thinking',
    title: 'Future service planning starts with terrain, reach, and last-mile clarity.',
    description:
      'The build direction values route visibility and infrastructure thinking, not just marketplace presentation.',
    image: '/area/coast.png',
    href: COMPANY_INSTAGRAM_URL,
    cta: 'Open company Instagram',
    objectPosition: 'center center',
  },
] as const;

const founderGallery = [
  {
    src: '/founder.png',
    title: 'Founder portrait',
    alt: `${FOUNDER_NAME} studio portrait`,
    objectPosition: '50% 14%',
  },
  {
    src: '/area/vajra-hero-drone.jpg',
    title: 'Drone vision',
    alt: 'The Vajra drone concept visual',
    objectPosition: 'center center',
  },
  {
    src: '/area/coast.png',
    title: 'Coverage map thinking',
    alt: 'Terrain visual used for scale and coverage direction',
    objectPosition: 'center center',
  },
  {
    src: '/founder.png',
    title: 'Founder close crop',
    alt: `${FOUNDER_NAME} portrait close crop`,
    objectPosition: '50% 6%',
  },
] as const;

const founderSignalFeed = [
  {
    title: 'What the founder is optimising',
    description: 'Speed, trust, and a product flow that feels lighter to use every day.',
    icon: Sparkles,
  },
  {
    title: 'What the product needs next',
    description: 'More operational depth, cleaner support surfaces, and broader service readiness.',
    icon: BarChart3,
  },
  {
    title: 'Where the roadmap points',
    description: 'Toward a system that can eventually support smarter movement and future logistics.',
    icon: Globe2,
  },
] as const;

const sectionCardClasses =
  'scroll-mt-36 rounded-[32px] border border-white/6 bg-[#111321]/95 shadow-[0_30px_80px_rgba(0,0,0,0.34)]';

export default function FounderPage({ onNavigate, publicView = false }: FounderPageProps) {
  const [activeSection, setActiveSection] = useState<ProfileSectionId>('overview');

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

  useEffect(() => {
    const sections = profileSections
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const nextVisibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (nextVisibleSection) {
          setActiveSection(nextVisibleSection.target.id as ProfileSectionId);
        }
      },
      {
        rootMargin: '-18% 0px -52% 0px',
        threshold: [0.18, 0.35, 0.6],
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className={`${publicView ? 'min-h-screen' : 'w-full'} bg-[#080b17] text-white`}>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        {publicView && (
          <header className="rounded-[30px] border border-white/8 bg-[#111321]/94 px-5 py-4 shadow-[0_22px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <a href="/" className="inline-flex items-center gap-3 text-white">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#84a6ff]/30 bg-[#4f71cf]/20 text-sm font-black tracking-[0.24em] text-[#dce6ff]">
                  TV
                </span>
                <span className="flex flex-col leading-none">
                  <span className="text-xl font-semibold tracking-tight">The Vajra</span>
                  <span className="text-xs font-medium uppercase tracking-[0.24em] text-[#93a5d3]">
                    Founder Profile
                  </span>
                </span>
              </a>

              <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-200/85">
                {profileSections.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="rounded-full px-4 py-2 transition-colors hover:bg-white/6 hover:text-white"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={COMPANY_INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  <Instagram className="h-4 w-4" />
                  <span>@vajracognixia.in</span>
                </a>
                <a
                  href={`mailto:${FOUNDER_EMAIL}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#4f71cf] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#5c7bdd]"
                >
                  <Mail className="h-4 w-4" />
                  <span>Contact founder</span>
                </a>
              </div>
            </div>
          </header>
        )}

        <section
          id="founder-hero"
          className="relative overflow-hidden rounded-[38px] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(116,152,255,0.24),rgba(9,15,36,0)_28%),radial-gradient(circle_at_top_right,rgba(102,128,255,0.18),rgba(9,15,36,0)_32%),linear-gradient(135deg,#3150a6_0%,#1a295a_42%,#0a1022_100%)] shadow-[0_38px_120px_rgba(0,0,0,0.36)]"
        >
          <div className="pointer-events-none absolute -left-24 top-[-80px] h-[320px] w-[320px] rounded-full border border-white/10 opacity-50" />
          <div className="pointer-events-none absolute right-[-120px] top-[-120px] h-[440px] w-[440px] rounded-full border border-white/10 opacity-60" />
          <div className="pointer-events-none absolute right-16 top-16 h-[260px] w-[260px] rounded-full border border-white/10 opacity-40" />

          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[0.85fr,0.95fr,0.8fr] lg:px-8 lg:py-10">
            <div className="relative z-10 flex flex-col">
              <div className="mb-4 inline-flex w-max items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#d7e0ff]">
                <Sparkles className="h-4 w-4" />
                Founder and Vision
              </div>

              <h1 className="max-w-md text-[clamp(3.8rem,8vw,7rem)] font-semibold leading-[0.84] tracking-[-0.08em] text-[#f7f6f1]">
                Devanshu
                <br />
                Dhyanu
              </h1>

              <div className="mt-5 inline-flex w-max items-center rounded-full bg-[#5c7bdd]/55 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#f5f7ff] shadow-[0_12px_30px_rgba(32,50,110,0.35)]">
                Founder of The Vajra
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[#dbe4ff]">
                <a
                  href={FOUNDER_INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 font-semibold transition-colors hover:bg-white/10"
                >
                  <Instagram className="h-4 w-4" />
                  <span>@devanshu_dhyanu</span>
                </a>
                <a
                  href={`mailto:${FOUNDER_EMAIL}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 font-semibold transition-colors hover:bg-white/10"
                >
                  <Mail className="h-4 w-4" />
                  <span>Founder contact</span>
                </a>
                <span className="inline-flex items-center gap-2 text-[#dbe4ff]/80">
                  <MapPin className="h-4 w-4" />
                  <span>India</span>
                </span>
              </div>

              <div className="mt-10 space-y-5">
                {founderHeroTraits.slice(0, 2).map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.title} className="flex items-start gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/8 text-[#dce6ff] shadow-[0_12px_24px_rgba(8,13,34,0.24)]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-[#f4f6ff]">{item.title}</p>
                        <p className="mt-1 max-w-md text-sm leading-7 text-[#d1dcff]/82">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="mt-10 text-base font-medium text-[#f4f6ff]">
                BUILD DIRECTION: CAMPUS DELIVERY, TRUST SYSTEMS, AND FUTURE DRONE LOGISTICS
              </p>
            </div>

            <div className="relative flex min-h-[420px] items-end justify-center">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[clamp(10rem,28vw,20rem)] font-black tracking-[-0.12em] text-white/10">
                {FOUNDER_INITIALS}
              </div>
              <img
                //src="/founder.png"
                //alt={`${FOUNDER_NAME}, founder of The Vajra Campus Delivery`}
                className="relative z-10 max-h-[640px] w-full max-w-[460px] object-cover object-top drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
              />
            </div>

            <div className="relative z-10 flex flex-col gap-5">
              <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d6e0ff]/74">
                  Profile
                </p>
                <div className="mt-4 space-y-5 text-[#f5f7ff]">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d6e0ff]/62">
                      Full name
                    </p>
                    <p className="mt-1 text-2xl font-semibold">{FOUNDER_NAME}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d6e0ff]/62">
                      Role
                    </p>
                    <p className="mt-1 text-lg font-semibold">{FOUNDER_ROLE}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d6e0ff]/62">
                      Core direction
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      Building a cleaner campus platform with a logistics-first future.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d6e0ff]/74">
                  Founder metrics
                </p>
                <div className="mt-5 space-y-5">
                  {founderQuickStats.map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-xl font-semibold text-white">{item.label}</p>
                        <span className="text-3xl font-semibold text-[#eef3ff]">{item.value}</span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-white/14">
                        <div
                          className="h-full rounded-full bg-[#e8edf7]"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d6e0ff]/74">
                  Platform associations
                </p>
                <div className="mt-4 grid gap-3">
                  {founderAffiliations.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-white/8 bg-[#101733]/40 px-4 py-4"
                    >
                      <p className="text-lg font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-[#d6e0ff]/72">{item.description}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  {publicView ? (
                    <a
                      href="/"
                      className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-[#123273]/45 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#17418f]"
                    >
                      <span>Visit The Vajra</span>
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onNavigate?.('home')}
                      className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-[#123273]/45 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#17418f]"
                    >
                      <span>Explore The Vajra</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <nav className="sticky top-4 z-20 rounded-[28px] border border-white/8 bg-[#0e1224]/92 px-3 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <div className="flex gap-2 overflow-x-auto">
            {profileSections.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === activeSection;

              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#4f71cf] text-white shadow-[0_16px_36px_rgba(53,85,181,0.36)]'
                      : 'text-slate-200/82 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>
        </nav>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.68fr)_360px]">
          <div className="flex flex-col gap-6">
            <section id="overview" className={sectionCardClasses}>
              <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.15fr,0.85fr] lg:px-8 lg:py-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8da5e7]">
                    Founder overview
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                    The page is shaped like a founder profile, but the core story is about building
                    The Vajra with intent.
                  </h2>
                  <p className="mt-5 text-base leading-8 text-slate-300">
                    {FOUNDER_NAME} is building The Vajra to make campus ordering and delivery feel
                    more dependable, more visible, and less frustrating to use repeatedly. The
                    founder lens is not about adding features for the sake of it, but about
                    removing friction that users feel every day.
                  </p>
                  <p className="mt-4 text-base leading-8 text-slate-300">
                    The vision is broader than a food app. It starts with a sharper delivery
                    product, grows into a stronger campus utility layer, and leaves room for
                    logistics thinking that can support future drone-led movement when the platform
                    is ready for it.
                  </p>

                  <div className="mt-6 rounded-[26px] border border-white/8 bg-[linear-gradient(135deg,rgba(79,113,207,0.18),rgba(17,19,33,0.06))] px-5 py-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9eb5f0]">
                      Founder line
                    </p>
                    <p className="mt-3 text-2xl font-semibold leading-10 text-[#f6f7fb]">
                      "Build something people want to keep opening because it makes daily life
                      lighter, not louder."
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 self-start">
                  {founderOverviewPoints.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[24px] border border-white/8 bg-white/5 px-5 py-5"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-2 text-lg font-semibold leading-7 text-white">
                        {item.value}
                      </p>
                    </div>
                  ))}

                  <div className="rounded-[24px] border border-white/8 bg-white/5 px-5 py-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Public presence
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <a
                        href={FOUNDER_INSTAGRAM_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                      >
                        <Instagram className="h-4 w-4" />
                        <span>Founder Instagram</span>
                      </a>
                      <a
                        href={`mailto:${FOUNDER_EMAIL}`}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                      >
                        <Mail className="h-4 w-4" />
                        <span>Email founder</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="focus" className={sectionCardClasses}>
              <div className="px-6 py-6 lg:px-8 lg:py-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8da5e7]">
                  Founder focus
                </p>
                <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-white">
                    A profile page works best when it shows how the founder thinks, not just who the
                    founder is.
                  </h2>
                  <p className="max-w-xl text-sm leading-7 text-slate-400">
                    These groups translate the product-building style into a cleaner scoreboard and
                    operating breakdown.
                  </p>
                </div>

                <div className="mt-8 grid gap-5 lg:grid-cols-3">
                  {founderCapabilityGroups.map((group) => (
                    <div
                      key={group.title}
                      className="rounded-[26px] border border-white/8 bg-white/5 px-5 py-5"
                    >
                      <h3 className="text-2xl font-semibold text-white">{group.title}</h3>
                      <div className="mt-6 space-y-5">
                        {group.stats.map((item) => (
                          <div key={item.label}>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-base font-medium text-slate-200">
                                {item.label}
                              </span>
                              <span className="text-2xl font-semibold text-[#eef3ff]">
                                {item.value}
                              </span>
                            </div>
                            <div className="mt-2 h-2 rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#4f71cf] via-[#6d8eec] to-[#8ca8ff]"
                                style={{ width: `${item.value}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid gap-5 lg:grid-cols-3">
                  {founderPrinciples.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="rounded-[26px] border border-white/8 bg-[#0e1224]/88 px-5 py-5"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#82a0ff]/24 bg-[#4f71cf]/12 text-[#dce6ff]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="mt-5 text-xl font-semibold text-white">{item.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-400">
                          {item.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section id="milestones" className={sectionCardClasses}>
              <div className="px-6 py-6 lg:px-8 lg:py-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8da5e7]">
                  Milestones
                </p>
                <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-white">
                    The roadmap is already organised like a staged founder build, not a one-page
                    idea dump.
                  </h2>
                  <p className="max-w-xl text-sm leading-7 text-slate-400">
                    Each phase sharpens the platform before the next operational layer gets added.
                  </p>
                </div>

                <div className="mt-8 grid gap-5 lg:grid-cols-[1.08fr,0.92fr]">
                  <div className="rounded-[26px] border border-white/8 bg-white/5 p-5">
                    <div className="space-y-4">
                      {founderMilestones.map((item, index) => (
                        <div
                          key={item.phase}
                          className={`flex gap-4 rounded-[22px] border border-white/6 bg-[#0d1120] px-4 py-4 ${
                            index === founderMilestones.length - 1 ? '' : ''
                          }`}
                        >
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#4f71cf]/14 text-sm font-black tracking-[0.16em] text-[#dce6ff]">
                            {String(index + 1).padStart(2, '0')}
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8da5e7]">
                              {item.phase}
                            </p>
                            <h3 className="mt-1 text-xl font-semibold text-white">{item.title}</h3>
                            <p className="mt-2 text-sm leading-7 text-slate-400">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-5">
                    <div className="rounded-[26px] border border-white/8 bg-white/5 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8da5e7]">
                        Build board
                      </p>
                      <div className="mt-5 space-y-3">
                        {founderBuildBoard.map((item) => (
                          <div
                            key={item}
                            className="flex items-start gap-3 rounded-2xl border border-white/6 bg-[#0d1120] px-4 py-4"
                          >
                            <span className="mt-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#4f71cf]/16 text-xs font-black text-[#dce6ff]">
                              +
                            </span>
                            <p className="text-sm leading-7 text-slate-300">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[26px] border border-white/8 bg-[linear-gradient(135deg,rgba(79,113,207,0.18),rgba(17,19,33,0.02))] p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8da5e7]">
                        Founder mission
                      </p>
                      <p className="mt-4 text-2xl font-semibold leading-10 text-white">
                        Build a platform that feels operationally sharper before it feels bigger.
                      </p>
                      <p className="mt-4 text-sm leading-7 text-slate-300">
                        The page mirrors that mindset: identity first, systems second, expansion
                        only when the base is ready for it.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="media" className={sectionCardClasses}>
              <div className="px-6 py-6 lg:px-8 lg:py-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8da5e7]">
                  Media and founder notes
                </p>
                <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-white">
                    The reference design had news and video blocks. Here, that space becomes founder
                    notes, vision cards, and platform context.
                  </h2>
                  <p className="max-w-xl text-sm leading-7 text-slate-400">
                    These cards give the page movement without pretending there is a newsroom behind
                    it already.
                  </p>
                </div>

                <div className="mt-8 grid gap-5 xl:grid-cols-[1.08fr,0.92fr]">
                  <a
                    href={founderMediaCards[0].href}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative overflow-hidden rounded-[28px] border border-white/8"
                  >
                    <img
                      src={founderMediaCards[0].image}
                      alt={founderMediaCards[0].title}
                      className="h-[420px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      style={{ objectPosition: founderMediaCards[0].objectPosition }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090d1b] via-[#090d1b]/55 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9eb5f0]">
                        {founderMediaCards[0].kicker}
                      </p>
                      <h3 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight text-white">
                        {founderMediaCards[0].title}
                      </h3>
                      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200/88">
                        {founderMediaCards[0].description}
                      </p>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#dce6ff]">
                        <span>{founderMediaCards[0].cta}</span>
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </a>

                  <div className="grid gap-5">
                    {founderMediaCards.slice(1).map((item) => {
                      const isExternal = item.href.startsWith('http');

                      return (
                        <a
                          key={item.title}
                          href={item.href}
                          target={isExternal ? '_blank' : undefined}
                          rel={isExternal ? 'noreferrer' : undefined}
                          className="group relative overflow-hidden rounded-[28px] border border-white/8"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-[200px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            style={{ objectPosition: item.objectPosition }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#090d1b] via-[#090d1b]/55 to-transparent" />
                          <div className="absolute inset-x-0 bottom-0 p-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9eb5f0]">
                              {item.kicker}
                            </p>
                            <h3 className="mt-2 text-2xl font-semibold leading-tight text-white">
                              {item.title}
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-slate-200/86">
                              {item.description}
                            </p>
                            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#dce6ff]">
                              <span>{item.cta}</span>
                              <ChevronRight className="h-4 w-4" />
                            </span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            <section id="gallery" className={sectionCardClasses}>
              <div className="px-6 py-6 lg:px-8 lg:py-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8da5e7]">
                  Gallery
                </p>
                <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-white">
                    Founder visuals and product-world references can sit together without feeling
                    like a separate marketing page.
                  </h2>
                  <p className="max-w-xl text-sm leading-7 text-slate-400">
                    This keeps the founder page visually alive while still tied to the product
                    direction.
                  </p>
                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-2">
                  {founderGallery.map((item) => (
                    <article
                      key={item.title}
                      className="overflow-hidden rounded-[28px] border border-white/8 bg-white/5"
                    >
                      <img
                        src={item.src}
                        alt={item.alt}
                        className="h-[260px] w-full object-cover"
                        style={{ objectPosition: item.objectPosition }}
                      />
                      <div className="px-5 py-4">
                        <p className="text-lg font-semibold text-white">{item.title}</p>
                        <p className="mt-2 text-sm text-slate-400">
                          A founder-led build should feel personal, but still visibly connected to
                          the world the product is trying to shape.
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <aside className="flex flex-col gap-6 xl:sticky xl:top-24 xl:self-start">
            <section className="overflow-hidden rounded-[30px] border border-[#8ea8ff]/18 bg-[linear-gradient(180deg,#11204a_0%,#0a1022_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.34)]">
              <div className="flex items-start justify-between px-6 pt-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9eb5f0]">
                    Founder card
                  </p>
                  <p className="mt-3 text-6xl font-black tracking-[-0.08em] text-white">91</p>
                  <p className="mt-1 text-lg font-semibold uppercase tracking-[0.16em] text-[#dce6ff]">
                    Vision
                  </p>
                </div>
                <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#dce6ff]">
                  The Vajra
                </span>
              </div>

              <div className="relative mt-5 px-4">
                <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                <img
                  src="/founder.png"
                  alt={`${FOUNDER_NAME} founder profile card visual`}
                  className="h-[420px] w-full rounded-[26px] object-cover object-top"
                />
              </div>

              <div className="grid grid-cols-2 gap-px border-t border-white/8 bg-white/8 mt-5">
                <div className="bg-[#0d132a] px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Focus</p>
                  <p className="mt-1 text-base font-semibold text-white">Campus product systems</p>
                </div>
                <div className="bg-[#0d132a] px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Mode</p>
                  <p className="mt-1 text-base font-semibold text-white">Founder-led build</p>
                </div>
                <div className="bg-[#0d132a] px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Email</p>
                  <p className="mt-1 text-base font-semibold text-white">Founder contact</p>
                </div>
                <div className="bg-[#0d132a] px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Direction</p>
                  <p className="mt-1 text-base font-semibold text-white">Drone-first future</p>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/6 bg-[#111321]/95 p-6 shadow-[0_26px_70px_rgba(0,0,0,0.3)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8da5e7]">
                What is being built now
              </p>
              <div className="mt-5 space-y-3">
                {founderBuildBoard.map((item, index) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/6 bg-white/5 px-4 py-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8da5e7]">
                      Priority {String(index + 1).padStart(2, '0')}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-white/6 bg-[#111321]/95 p-6 shadow-[0_26px_70px_rgba(0,0,0,0.3)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8da5e7]">
                Signal feed
              </p>
              <div className="mt-5 space-y-4">
                {founderSignalFeed.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-white/6 bg-white/5 px-4 py-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#4f71cf]/14 text-[#dce6ff]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-white">{item.title}</p>
                          <p className="mt-2 text-sm leading-7 text-slate-400">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[28px] border border-white/6 bg-[#111321]/95 p-6 shadow-[0_26px_70px_rgba(0,0,0,0.3)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8da5e7]">
                Reach the founder
              </p>
              <div className="mt-5 space-y-3">
                <a
                  href={`mailto:${FOUNDER_EMAIL}`}
                  className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/5 px-4 py-4 transition-colors hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-[#9eb5f0]" />
                    <span className="text-sm font-semibold text-white">Founder email</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </a>
                <a
                  href={FOUNDER_INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/5 px-4 py-4 transition-colors hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <Instagram className="h-4 w-4 text-[#9eb5f0]" />
                    <span className="text-sm font-semibold text-white">Founder Instagram</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </a>
                <a
                  href={COMPANY_INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/5 px-4 py-4 transition-colors hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <Globe2 className="h-4 w-4 text-[#9eb5f0]" />
                    <span className="text-sm font-semibold text-white">Company Instagram</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </a>
              </div>
            </section>
          </aside>
        </div>

        {publicView && (
          <footer className="overflow-hidden rounded-[34px] border border-white/8 bg-[linear-gradient(135deg,#3150a6_0%,#1a295a_42%,#0a1022_100%)] px-6 py-8 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-3 text-white">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/18 bg-white/8 text-sm font-black tracking-[0.24em] text-[#dce6ff]">
                    TV
                  </span>
                  <div>
                    <p className="text-2xl font-semibold">The Vajra</p>
                    <p className="text-sm text-[#d7e0ff]/75">
                      Founder profile for {FOUNDER_NAME}
                    </p>
                  </div>
                </div>
                <p className="mt-4 max-w-xl text-sm leading-7 text-[#d7e0ff]/80">
                  A profile page that feels closer to a premium founder dossier than a placeholder
                  bio. Built to match the visual energy you referenced while staying true to The
                  Vajra.
                </p>
              </div>

              <div className="flex flex-col gap-3 text-sm text-[#e2e9ff] lg:items-end">
                <div className="inline-flex items-center gap-3">
                  <CalendarDays className="h-4 w-4" />
                  <span>Founder-led product journey in progress</span>
                </div>
                <div className="inline-flex items-center gap-3">
                  <UserRound className="h-4 w-4" />
                  <span>{FOUNDER_NAME}</span>
                </div>
                <div className="inline-flex items-center gap-3">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${FOUNDER_EMAIL}`} className="underline-offset-4 hover:underline">
                    {FOUNDER_EMAIL}
                  </a>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
