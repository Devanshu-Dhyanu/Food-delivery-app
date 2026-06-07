import { useEffect, useState } from 'react';
import { ArrowLeft, Menu, X } from 'lucide-react';
import { applyDefaultSeo } from '../lib/seo';
import LandingFooter from './LandingFooter';

const navLinks = [
  { label: 'What We Do', href: '/what-we-do' },
  { label: 'Delivery Model', href: '/#specifications' },
  { label: 'Contact', href: '/contact-us' },
  { label: 'Founder', href: '/founder' },
  { label: 'Careers', href: '/careers' },
] as const;

const deepDiveSections = [
  {
    eyebrow: 'The Foundation',
    title: 'We start with the everyday problem, not with the technology.',
    body: [
      'Most people do not wake up thinking about logistics, dispatch systems, marketplace design, routing quality, or fulfilment models. They simply want their food to arrive properly, their essentials to be easy to find, their local services to be reachable, and their order status to make sense. That is where The Vajra begins. We look at the ordinary friction inside a city: waiting without clarity, switching between too many apps, small businesses struggling to be visible, delivery partners working with incomplete information, and customers losing trust when the experience feels uncertain.',
      'Our job is to reduce that friction without making the product feel complicated. The platform is being designed around a simple idea: every daily need should move through a cleaner digital path. A customer should know what they can order, when it will move, who is handling it, and what happens next. A seller should get a way to reach people nearby without needing a large technical team. A service provider should be discoverable, responsive, and easier to book. A delivery partner should get enough context to complete the task with confidence.',
      'Technology matters, but it only matters when it improves the actual human moment. That is why The Vajra is not only about drones, apps, or dashboards. It is about building a dependable layer between demand and fulfilment. The product has to feel useful on a normal day, during rush hours, when a customer is hungry, when a seller is busy, when support is needed, and when timing matters. We are building for those real moments first.'
    ],
  },
  {
    eyebrow: 'Customers',
    title: 'For customers, The Vajra is meant to feel simple, fast, and trustworthy.',
    body: [
      'A strong customer experience is not created by adding more buttons. It is created by removing confusion. The Vajra is being shaped so that people can discover food, products, transport options, and useful services from one familiar place. The experience should feel direct: search, select, order, track, receive, and get support if something needs attention. Each step has to be clear enough that the customer does not feel like they are chasing the platform for answers.',
      'Food delivery is one of the first everyday needs we focus on because it exposes the full challenge of last-mile convenience. Food is time sensitive. People care about preparation, pickup, route, arrival, and support. If a platform can handle that experience with clarity, it builds a foundation for other needs too. The same discipline can support groceries, essentials, parcels, marketplace purchases, and local services. The goal is to make The Vajra a dependable place for daily movement, not a collection of disconnected features.',
      'We also want the product to respect the customer attention span. People should not need to understand the complexity behind routing, inventory, dispatch, or service coordination. They should simply feel that the experience is organized. When a customer opens The Vajra, the platform should help them act quickly while still giving enough information to feel in control. That balance between speed and clarity is central to what we do.'
    ],
  },
  {
    eyebrow: 'Local Business',
    title: 'For restaurants, sellers, and service providers, we create a practical digital front door.',
    body: [
      'Local businesses are the heart of a city, but many of them do not have the systems, visibility, or operational tools that larger platforms enjoy. A restaurant may have good food but limited reach. A seller may have useful products but no easy way to show them to nearby customers. A service provider may depend on word of mouth even when people in the same area are searching for that exact service. The Vajra is being built to close that gap.',
      'The platform gives businesses a place to be discovered and a flow for receiving demand. That means listings, service visibility, ordering, fulfilment coordination, customer communication, and repeat use. The purpose is not to overwhelm small teams with complicated controls. The purpose is to create a system that helps them become easier to find, easier to trust, and easier to choose. A good platform should make the business look more organized without forcing the owner to become a software expert.',
      'We are also thinking about the economics of local growth. If delivery, marketplace access, and service discovery can sit inside one connected product, businesses get more than one way to participate. A restaurant can serve food orders. A seller can list products. A local operator can provide services. A partner can connect with customers in their own area. The network becomes stronger when the same platform supports many kinds of local value.'
    ],
  },
  {
    eyebrow: 'Delivery Partners',
    title: 'For delivery partners, the work should be clearer, safer, and better coordinated.',
    body: [
      'Delivery partners are often the people who carry the pressure of a platform in the real world. They deal with pickup timing, road conditions, customer expectations, location confusion, and support gaps. If the system gives them poor information, the whole experience suffers. The Vajra is being designed with the understanding that a better customer experience also depends on a better delivery partner experience.',
      'A well-built delivery flow should make the next action obvious. The partner should know where to go, what to pick up, what status to update, where the customer is, and what to do if there is a problem. Small details matter: clear order information, live status, sensible assignment, route awareness, and support access. When these pieces work together, delivery becomes less stressful and more reliable.',
      'In the long term, as the platform prepares for drone-ready logistics and smarter routing, delivery partners still remain important. Future logistics will not remove the need for human responsibility; it will change how coordination happens. Some tasks may become more automated, some routes may become more optimized, and some handoffs may become more structured. But the platform must continue to protect trust, safety, and accountability.'
    ],
  },
  {
    eyebrow: 'Operations',
    title: 'Behind the screen, we are building discipline around movement.',
    body: [
      'A polished app is only the visible part of the work. The harder challenge is operational discipline. Every order has a lifecycle. It is created, confirmed, prepared, assigned, moved, tracked, handed off, and completed. Every stage can create delay or confusion if it is not handled properly. The Vajra is focused on making these stages more visible and more reliable.',
      'That means building systems that can support status updates, service categories, fulfilment logic, customer communication, partner coordination, and future hardware integration. We want the platform to grow in a way that does not break when more services are added. Food delivery, marketplace products, everyday services, parcels, and transport may look different to the customer, but they all need structured movement behind the scenes.',
      'This is why we think of The Vajra as an operating layer. The product is not just a storefront. It is a system for receiving demand and moving it toward completion. When the operating layer is strong, the user experience feels calm. When it is weak, customers see delays, partners see confusion, and businesses lose trust. Our work is to make the invisible layer stronger.'
    ],
  },
  {
    eyebrow: 'Drone-Ready Logistics',
    title: 'Drone delivery is part of the roadmap, but the real goal is better last-mile infrastructure.',
    body: [
      'Drones are exciting, but a drone alone does not solve last-mile delivery. The real challenge is the system around it: safe routing, dispatch readiness, landing or handoff zones, package handling, customer confirmation, regulation awareness, fallback methods, and live monitoring. The Vajra treats drone delivery as a serious operational direction, not as a visual gimmick.',
      'Our drone-ready thinking begins with the same questions that apply to any delivery: what is being moved, where does it start, where does it need to go, how urgent is it, what path is safest, how does the customer know what is happening, and how is completion confirmed? Once those questions are answered reliably in software and operations, advanced delivery methods can be introduced with more confidence.',
      'The long-term vision is a network where food, essentials, parcels, and time-sensitive items can move through smarter paths. Some routes may stay road-based. Some may become drone-assisted. Some may combine multiple handoff points. The important thing is not to force one method everywhere. The important thing is to build a flexible system that can choose the right method for the right situation.'
    ],
  },
  {
    eyebrow: 'Trust',
    title: 'Trust is built through clarity, not through promises.',
    body: [
      'Customers trust a platform when it tells them the truth clearly. Businesses trust a platform when it handles demand responsibly. Partners trust a platform when it gives them the right information and respects the work. The Vajra is being built with that kind of trust in mind. We do not want the experience to feel mysterious. We want each step to be understandable.',
      'This matters especially in delivery and local services because the product touches real people in real locations. A late order, an unclear address, a missing update, or a weak support flow can quickly become frustrating. Strong design is not only about how the screen looks; it is about how well the product behaves when something does not go perfectly. Support, status, and communication are part of the product, not an afterthought.',
      'The more the platform grows, the more important this becomes. A connected services network must earn trust repeatedly. That means careful rollout, better information, responsible operations, and a product that does not hide complexity from the people who need to act on it. Trust is not a slogan for us. It is a design requirement.'
    ],
  },
  {
    eyebrow: 'The Direction',
    title: 'The Vajra is being built step by step, with a long-term view.',
    body: [
      'We know that a platform like this cannot be built properly by pretending everything is finished on day one. The right approach is to build the foundation, learn from real usage, improve the experience, and expand carefully. Food delivery, marketplace access, service discovery, support, partner tools, and drone-ready logistics all need strong basics before they can scale.',
      'That is why the direction matters. The Vajra is not chasing a single feature. It is building toward a city-level convenience network where people can access what they need, local businesses can participate, and movement can become faster and more transparent. Every new feature should support that larger direction. If it does not make the system clearer, faster, more useful, or more dependable, it does not belong.',
      'The final ambition is simple to say but difficult to build: make everyday life easier to move through. Whether someone is ordering lunch, buying something nearby, requesting a service, tracking a delivery, or receiving an essential item, The Vajra should make the experience feel more organized than it was before. That is the work. That is what we do.'
    ],
  },
] as const;

export default function WhatWeDoPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    applyDefaultSeo({
      title: 'What We Do | The Vajra',
      description: 'Explore what The Vajra does across delivery, marketplace, and everyday services.',
    });
  }, []);

  return (
    <main className="relative min-h-screen bg-black">
      <div className="fixed inset-0">
        <picture>
          <source media="(max-width: 767px)" srcSet="/what-we-do-phone.png" />
          <img
            src="/what-we-do.png"
            alt="What The Vajra does"
            className="block h-full w-full object-cover object-center"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/25 to-black/10" />
      </div>

      <div className="relative z-10">
        <button
          type="button"
          className="fixed left-4 top-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white shadow-2xl shadow-black/30 backdrop-blur-md transition-colors hover:bg-white/18 sm:left-8"
          aria-label="Go back"
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back();
              return;
            }

            window.location.href = '/';
          }}
        >
          <ArrowLeft size={22} />
        </button>

        <header className={`fixed right-4 top-4 z-40 sm:right-8 lg:left-0 lg:right-0 lg:top-0 lg:w-auto lg:px-8 lg:pt-4 ${mobileMenuOpen ? 'w-[min(76vw,20rem)]' : 'w-auto'}`}>
          <div className={`ml-auto text-white lg:mx-auto lg:max-w-[590px] lg:rounded-full lg:border lg:border-white/25 lg:bg-black/45 lg:px-6 lg:py-5 lg:shadow-2xl lg:shadow-black/30 lg:backdrop-blur-md ${mobileMenuOpen ? 'rounded-[28px] border border-white/25 bg-black/45 px-3 py-3 shadow-2xl shadow-black/30 backdrop-blur-md' : ''}`}>
            <div className="flex items-center justify-end lg:justify-center">
              <nav className="hidden w-full items-center justify-between gap-8 text-sm font-bold lg:flex" aria-label="Primary">
                {navLinks.map((item) => (
                  <a key={item.href} href={item.href} className="text-white/68 transition-colors hover:text-white">
                    {item.label}
                  </a>
                ))}
              </nav>

              <button
                type="button"
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center text-white transition-colors lg:hidden ${mobileMenuOpen ? 'rounded-full border border-white/20 bg-white/10 hover:bg-white/18' : 'drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)] hover:text-cyan-100'}`}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((current) => !current)}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="mt-4 border-t border-white/12 pt-4 lg:hidden">
                <nav className="grid gap-1 text-right text-sm font-semibold" aria-label="Mobile">
                  {navLinks.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="rounded-2xl px-4 py-3 text-white/86 transition-colors hover:bg-white/10"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </header>

        <section className="flex min-h-screen items-start justify-end px-6 pt-28 sm:px-10 sm:pt-32 lg:px-16 lg:pt-36">
          <div className="max-w-[560px] text-right text-white">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/90">
            The Vajra Network
          </p>
          <h1 className="text-4xl font-black uppercase leading-[1.02] sm:text-5xl lg:text-6xl">
            What We Do
          </h1>
          <p className="ml-auto mt-5 max-w-[520px] text-sm font-medium leading-7 text-white/88 sm:text-base">
            We connect food delivery, local marketplace, everyday services, and future-ready drone
            logistics into one faster digital experience for modern cities.
          </p>
        </div>
          <p className="absolute bottom-6 right-6 text-xs font-semibold uppercase tracking-[0.18em] text-white/55 sm:bottom-8 sm:right-10">
            © 2026 The VajraCognixia
          </p>
        </section>

      <section className="bg-[#f4f3ef] px-6 py-16 text-[#111111] sm:px-10 sm:py-20 lg:px-14">
        <div className="mx-auto max-w-7xl">
          <p className="mb-5 text-sm font-medium text-neutral-700 sm:text-base">
            For customers, partners, sellers, and smarter cities.
          </p>
          <h2 className="max-w-5xl text-5xl font-black leading-[0.98] tracking-normal sm:text-7xl lg:text-8xl">
            One platform for everyday movement, commerce, and service.
          </h2>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            <article className="rounded-[24px] border border-black/10 bg-white px-7 py-7 shadow-sm">
              <p className="mb-6 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                For Customers
              </p>
              <p className="text-lg leading-8 text-neutral-700">
                The Vajra makes daily needs easier by bringing food delivery, local shopping,
                transport, and useful services into one simple experience built for speed and trust.
              </p>
            </article>

            <article className="rounded-[24px] border border-black/10 bg-white px-7 py-7 shadow-sm">
              <p className="mb-6 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                For Local Business
              </p>
              <p className="text-lg leading-8 text-neutral-700">
                Restaurants, sellers, and service providers get a digital place to reach more people,
                manage demand, and grow with delivery and marketplace tools designed for local cities.
              </p>
            </article>

            <article className="rounded-[24px] border border-black/10 bg-white px-7 py-7 shadow-sm">
              <p className="mb-6 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                For The Future
              </p>
              <p className="text-lg leading-8 text-neutral-700">
                Our roadmap moves toward drone-ready logistics, live tracking, safer handoffs, and a
                faster last-mile network that can support food, essentials, parcels, and services.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section
        className="relative overflow-hidden bg-black px-5 py-24 text-white sm:px-8 lg:px-12"
        aria-label="Drone delivery path from order received to delivery completed"
      >
        <div className="sticky top-0 -mx-5 -mt-24 h-screen sm:-mx-8 lg:-mx-12">
          <picture>
            <source media="(max-width: 767px)" srcSet="/drone-path-phone.png" />
            <img
              src="/drone-path.png"
              alt=""
              className="h-full w-full object-contain opacity-80"
              loading="lazy"
            />
          </picture>
          <div className="absolute inset-0 bg-black/35" />
        </div>
        <div className="relative mx-auto max-w-7xl pb-10">
          <div className="ml-auto max-w-3xl rounded-[36px] border border-white/20 bg-black/65 p-7 shadow-2xl shadow-black/40 sm:p-10 lg:p-12">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-cyan-200/90">
              What We Do
            </p>
            <h2 className="text-4xl font-black leading-[1.02] sm:text-6xl lg:text-7xl">
              We are building the operating layer for everyday convenience.
            </h2>
            <p className="mt-6 text-base font-medium leading-8 text-white/84 sm:text-lg">
              The Vajra is not being made as one more delivery app with a different logo. It is
              being shaped as a practical system for the things people need again and again:
              food, local products, useful services, movement, tracking, support, and faster
              fulfilment. A customer should not have to jump between five different apps for one
              day of work. A restaurant or local seller should not need a complicated setup just
              to reach nearby customers. A delivery partner should not be left guessing what
              happens next after an order is accepted.
            </p>
            <p className="mt-5 text-base font-medium leading-8 text-white/78 sm:text-lg">
              Our work is to connect these small but important moments into one clear flow. An
              order comes in, the request is understood, the right service path is selected, live
              status stays visible, and the handoff is completed with less confusion. Today that
              means building a strong digital platform for food delivery, marketplace access, and
              everyday services. Over time, it also means preparing the foundation for smarter
              routing, drone-ready logistics, safer drop-offs, and a faster last-mile network
              that can serve modern cities without losing the human trust local commerce depends on.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <article className="rounded-[30px] border border-white/18 bg-black/60 p-7 shadow-xl shadow-black/25">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white/55">
                Order To Dispatch
              </p>
              <p className="text-lg leading-8 text-white/82">
                We focus on the full journey, not only the button that places an order. The system
                should make it clear when a request is received, when it is being prepared, who is
                handling it, where it is moving, and when it is completed.
              </p>
            </article>

            <article className="rounded-[30px] border border-white/18 bg-black/60 p-7 shadow-xl shadow-black/25">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white/55">
                Local Commerce
              </p>
              <p className="text-lg leading-8 text-white/82">
                Vajra is designed to give restaurants, sellers, and service providers a stronger
                digital presence in their own city. Discovery, ordering, fulfilment, and repeat
                customers should all feel easier for small and growing businesses.
              </p>
            </article>

            <article className="rounded-[30px] border border-white/18 bg-black/60 p-7 shadow-xl shadow-black/25">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white/55">
                Drone-Ready Future
              </p>
              <p className="text-lg leading-8 text-white/82">
                Drone delivery is part of our long-term direction, but the goal is bigger than the
                drone itself. The real work is building the discipline, tracking, routing, safety,
                and service logic needed for faster and more reliable last-mile movement.
              </p>
            </article>
          </div>

          <div className="mt-10 grid gap-6">
            {deepDiveSections.map((section) => (
              <article
                key={section.title}
                className="rounded-[34px] border border-white/18 bg-black/68 p-7 shadow-2xl shadow-black/30 sm:p-9 lg:p-11"
              >
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-cyan-200/80">
                  {section.eyebrow}
                </p>
                <h3 className="max-w-5xl text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
                  {section.title}
                </h3>
                <div className="mt-6 grid gap-5 text-base font-medium leading-8 text-white/80 sm:text-lg">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <div className="relative bg-black">
        <LandingFooter />
      </div>
      </div>
    </main>
  );
}
