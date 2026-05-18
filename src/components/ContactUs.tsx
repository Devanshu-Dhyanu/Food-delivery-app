import {
  ArrowRight,
  Building2,
  ChevronDown,
  Globe,
  RadioTower,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { applySeo } from '../lib/seo';
import LandingFooter from './LandingFooter';

const CONTACT_EMAIL = 'info@vajracognixia.in';
const FOUNDER_EMAIL = 'founder-thevajra@vajracognixia.in';

const primaryCards = [
  {
    title: 'Request for Services',
    body: 'Product questions, operational discussions, and platform interest.',
    href: '/request-services',
    icon: Building2,
  },
  {
    title: 'Partnership Information',
    body: 'Brand, campus, logistics, and ecosystem collaboration enquiries.',
    href: `mailto:${FOUNDER_EMAIL}?subject=Partnership%20with%20The%20Vajra`,
    icon: Sparkles,
  },
  {
    title: 'Media Contacts',
    body: 'Press notes, founder commentary, launch coverage, and features.',
    href: `mailto:${CONTACT_EMAIL}?subject=Media%20Request%20for%20The%20Vajra`,
    icon: RadioTower,
  },
] as const;

const secondaryLinks = [
  {
    label: 'Founder relations',
    href: '/founder',
  },
  {
    label: 'Careers',
    href: '/job-application',
  },
  {
    label: 'Partnerships',
    href: `mailto:${FOUNDER_EMAIL}?subject=Partnership%20Discussion`,
  },
  {
    label: 'Website feedback',
    href: '/website-feedback',
  },
] as const;

const topNavLinks = [
  { label: 'What we do', href: '/#benefits' },
  { label: 'Who we are', href: '/founder' },
  { label: 'Insights', href: '/#specifications' },
  { label: 'Careers', href: '/careers' },
  { label: 'Newsroom', href: `mailto:${CONTACT_EMAIL}?subject=Media%20Request%20for%20The%20Vajra` },
  { label: 'Investors', href: 'mailto:founder-thevajra@vajracognixia.in?subject=Investor%20Enquiry' },
] as const;

type TopNavLabel = (typeof topNavLinks)[number]['label'];

const navDropdownItems: Record<TopNavLabel, readonly { label: string; href: string }[]> = {
  'What we do': [
    { label: 'Why Vajra', href: '/#benefits' },
    { label: 'Delivery Model', href: '/#specifications' },
    { label: 'How It Works', href: '/#how-to' },
    { label: 'Get Support', href: '/support' },
  ],
  'Who we are': [
    { label: 'Founder', href: '/founder' },
    { label: 'Our Story', href: '/#top' },
    { label: 'Contact Us', href: '/contact-us' },
    { label: 'Careers', href: '/careers' },
  ],
  Insights: [
    { label: 'Vision', href: '/#specifications' },
    { label: 'Campus Experience', href: '/#benefits' },
    { label: 'Phone Showcase', href: '/#vajra-showcase-title' },
    { label: 'Support Chat', href: '/support' },
  ],
  Careers: [
    { label: 'Open Roles', href: '/careers' },
    { label: 'Apply Now', href: '/apply' },
    { label: 'Founder Relations', href: '/founder' },
    { label: 'Website Feedback', href: '/website-feedback' },
  ],
  Newsroom: [
    { label: 'Media Contacts', href: 'mailto:info@vajracognixia.in?subject=Media%20Request%20for%20The%20Vajra' },
    { label: 'Brand Partnerships', href: 'mailto:founder-thevajra@vajracognixia.in?subject=Brand%20Partnership' },
    { label: 'Founder Story', href: '/founder' },
    { label: 'Support Updates', href: '/support' },
  ],
  Investors: [
    { label: 'Delivery Vision', href: '/#specifications' },
    { label: 'Founder Overview', href: '/founder' },
    { label: 'Contact Founder', href: 'mailto:founder-thevajra@vajracognixia.in?subject=Investor%20Enquiry' },
    { label: 'Policy Pages', href: '/privacy' },
  ],
};

const siteSearchItems = [
  { label: 'Home', description: 'Landing page and main hero section', href: '/#top' },
  { label: 'Why Vajra', description: 'Core benefits and comparison section', href: '/#benefits' },
  { label: 'Delivery Model', description: 'How Vajra plans smart delivery', href: '/#specifications' },
  { label: 'Phone Showcase', description: 'Edited phone design section', href: '/#vajra-showcase-title' },
  { label: 'How It Works', description: 'Steps and process section', href: '/#how-to' },
  { label: 'Contact Section', description: 'Landing page contact block', href: '/#contact' },
  { label: 'Contact Us', description: 'Dedicated contact page', href: '/contact-us' },
  { label: 'Website Feedback', description: 'Share your experience and suggestions', href: '/website-feedback' },
  { label: 'Founder', description: 'Founder profile and story', href: '/founder' },
  { label: 'Careers', description: 'Apply and role information', href: '/careers' },
  { label: 'Support', description: 'Support assistant and help page', href: '/support' },
  { label: 'Privacy Policy', description: 'Privacy and data handling', href: '/privacy' },
  { label: 'Refund & Cancellation', description: 'Refund rules and complaint process', href: '/refund-cancellation' },
  { label: 'Shipping Policy', description: 'Delivery timelines and support', href: '/shipping-policy' },
  { label: 'Terms & Conditions', description: 'Platform terms and rules', href: '/terms' },
] as const;

export default function ContactUs() {
  const [activeDropdown, setActiveDropdown] = useState<TopNavLabel | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    applySeo({
      title: 'Contact | The Vajra',
      description:
        'Reach The Vajra for services, partnerships, media requests, founder contact, and website feedback.',
      canonical: 'https://www.vajracognixia.in/contact-us',
    });
  }, []);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [searchOpen]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredSearchItems = normalizedQuery
    ? siteSearchItems.filter((item) =>
        `${item.label} ${item.description} ${item.href}`.toLowerCase().includes(normalizedQuery)
      )
    : siteSearchItems.slice(0, 8);

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Prata&display=swap');

        .vajra-contact-shell {
          width: min(1720px, calc(100% - 56px));
          margin: 0 auto;
        }

        .vajra-contact-page {
          padding: 8px 0 110px;
        }

        .vajra-contact-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
          min-height: 84px;
          margin-bottom: 56px;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
        }

        .vajra-contact-brand {
          display: inline-flex;
          align-items: center;
          color: #ffffff;
          text-decoration: none;
          font-family: 'Prata', serif;
          font-size: 1.7rem;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          line-height: 1;
          white-space: nowrap;
        }

        .vajra-contact-brand::before {
          content: none;
        }

        .vajra-contact-center {
          display: flex;
          align-items: center;
          gap: 34px;
          flex: 1;
          justify-content: flex-start;
          padding-left: 72px;
        }

        .vajra-contact-nav-item {
          position: relative;
          display: inline-flex;
          align-items: center;
        }

        .vajra-contact-nav-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 10px 0;
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          font-family: 'Manrope', sans-serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -0.03em;
          white-space: nowrap;
        }

        .vajra-contact-nav-link:hover {
          color: #ffffff;
        }

        .vajra-contact-mini-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          min-width: 210px;
          padding: 10px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(18, 18, 18, 0.96);
          box-shadow: 0 18px 48px rgba(0, 0, 0, 0.38);
          opacity: 0;
          transform: translateY(8px);
          pointer-events: none;
          transition: opacity 180ms ease, transform 180ms ease;
          z-index: 30;
        }

        .vajra-contact-mini-dropdown.is-open {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .vajra-contact-mini-link {
          display: block;
          padding: 10px 12px;
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.88);
          text-decoration: none;
          font-family: 'Manrope', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.03em;
          transition: background 160ms ease, color 160ms ease;
        }

        .vajra-contact-mini-link:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        .vajra-contact-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .vajra-contact-search {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          background: transparent;
          border: 0;
          padding: 0;
          cursor: pointer;
        }

        .vajra-contact-global {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #ffffff;
          font-family: 'Manrope', sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.03em;
          white-space: nowrap;
        }

        .vajra-contact-home {
          color: rgba(255, 255, 255, 0.72);
          text-decoration: none;
          font-family: 'Manrope', sans-serif;
          font-size: 15px;
          font-weight: 500;
          letter-spacing: -0.03em;
          white-space: nowrap;
        }

        .vajra-contact-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.9fr);
          gap: 48px;
          align-items: start;
          margin-bottom: 72px;
        }

        .vajra-contact-title {
          font-family: 'Manrope', sans-serif;
          font-size: clamp(4.2rem, 8.2vw, 7.6rem);
          font-weight: 400;
          line-height: 0.92;
          letter-spacing: -0.09em;
        }

        .vajra-contact-intro {
          max-width: 18ch;
          color: rgba(243, 236, 224, 0.82);
          font-family: 'Manrope', sans-serif;
          font-size: clamp(1.7rem, 2.1vw, 2.15rem);
          font-weight: 400;
          line-height: 1.52;
          letter-spacing: -0.05em;
          padding-top: 8px;
        }

        .vajra-contact-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 30px;
          margin-bottom: 64px;
        }

        .vajra-contact-card {
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 188px;
          padding: 28px 32px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.01);
          color: #ffffff;
          text-decoration: none;
          transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
        }

        .vajra-contact-card:hover {
          transform: translateY(-2px);
          border-color: rgba(86, 140, 235, 0.62);
          background: rgba(255, 255, 255, 0.025);
        }

        .vajra-contact-card-icon {
          color: #4f8fff;
          margin-bottom: 24px;
        }

        .vajra-contact-card h2 {
          font-family: 'Manrope', sans-serif;
          font-size: clamp(1.7rem, 2vw, 2.05rem);
          font-weight: 700;
          line-height: 1.16;
          letter-spacing: -0.05em;
        }

        .vajra-contact-card p {
          margin-top: 14px;
          max-width: 28ch;
          color: rgba(255, 255, 255, 0.56);
          font-family: 'Manrope', sans-serif;
          font-size: 14px;
          line-height: 1.7;
        }

        .vajra-contact-subcopy {
          margin-bottom: 36px;
          color: rgba(243, 236, 224, 0.72);
          font-family: 'Manrope', sans-serif;
          font-size: 16px;
          line-height: 1.6;
        }

        .vajra-contact-links {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 26px;
        }

        .vajra-contact-link {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          min-height: 72px;
          padding: 0 2px;
          color: #ffffff;
          text-decoration: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }

        .vajra-contact-link span {
          font-family: 'Manrope', sans-serif;
          font-size: clamp(1.45rem, 1.8vw, 2rem);
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.04em;
        }

        .vajra-contact-link-icon {
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          color: #111111;
          background: #f6f1e7;
        }

        .vajra-search-overlay {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 48px 20px;
          background: rgba(0, 0, 0, 0.76);
          backdrop-filter: blur(10px);
          z-index: 120;
        }

        .vajra-search-modal {
          width: min(760px, 100%);
          border-radius: 26px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: #0d0d0d;
          box-shadow: 0 28px 80px rgba(0, 0, 0, 0.45);
          overflow: hidden;
        }

        .vajra-search-topbar {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 22px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .vajra-search-input {
          flex: 1;
          border: 0;
          outline: 0;
          background: transparent;
          color: #ffffff;
          font-family: 'Manrope', sans-serif;
          font-size: 1.05rem;
          font-weight: 600;
          letter-spacing: -0.03em;
        }

        .vajra-search-input::placeholder {
          color: rgba(255, 255, 255, 0.38);
        }

        .vajra-search-close {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: transparent;
          color: rgba(255, 255, 255, 0.84);
          cursor: pointer;
        }

        .vajra-search-results {
          padding: 12px;
          max-height: min(70vh, 620px);
          overflow-y: auto;
        }

        .vajra-search-result {
          display: block;
          padding: 16px 16px;
          border-radius: 16px;
          color: #ffffff;
          text-decoration: none;
          transition: background 160ms ease;
        }

        .vajra-search-result:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        .vajra-search-result strong {
          display: block;
          font-family: 'Manrope', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.03em;
        }

        .vajra-search-result span {
          display: block;
          margin-top: 6px;
          color: rgba(255, 255, 255, 0.58);
          font-family: 'Manrope', sans-serif;
          font-size: 0.93rem;
          line-height: 1.6;
        }

        .vajra-search-empty {
          padding: 28px 18px 34px;
          color: rgba(255, 255, 255, 0.58);
          font-family: 'Manrope', sans-serif;
          font-size: 0.95rem;
          line-height: 1.7;
        }

        @media (max-width: 1180px) {
          .vajra-contact-grid,
          .vajra-contact-links,
          .vajra-contact-hero {
            grid-template-columns: 1fr;
          }

          .vajra-contact-intro {
            max-width: 32ch;
          }

          .vajra-contact-center {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .vajra-contact-shell {
            width: min(100%, calc(100% - 24px));
          }

          .vajra-contact-page {
            padding: 6px 0 72px;
          }

          .vajra-contact-nav {
            align-items: center;
            min-height: 66px;
            margin-bottom: 36px;
          }

          .vajra-contact-right {
            gap: 10px;
          }

          .vajra-contact-search {
            transform: scale(0.88);
            transform-origin: center;
          }

          .vajra-contact-global,
          .vajra-contact-home {
            display: none;
          }

          .vajra-contact-card {
            min-height: 160px;
            padding: 24px 22px;
          }

          .vajra-contact-link {
            min-height: 64px;
          }

          .vajra-search-overlay {
            padding: 18px 10px;
          }

          .vajra-search-topbar {
            padding: 18px 16px;
          }
        }
      `}</style>

      <div className="vajra-contact-shell">
        <div className="vajra-contact-page">
          <div className="vajra-contact-nav">
            <a href="/" className="vajra-contact-brand">The Vajra</a>

            <div className="vajra-contact-center" aria-label="Primary contact navigation">
              {topNavLinks.map((item) => (
                <div
                  key={item.label}
                  className="vajra-contact-nav-item"
                  onMouseEnter={() => setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown((current) => (current === item.label ? null : current))}
                >
                  <a href={item.href} className="vajra-contact-nav-link">
                    <span>{item.label}</span>
                    <ChevronDown size={14} strokeWidth={2.1} />
                  </a>
                  <div
                    className={`vajra-contact-mini-dropdown${activeDropdown === item.label ? ' is-open' : ''}`}
                    aria-hidden={activeDropdown !== item.label}
                  >
                    {navDropdownItems[item.label].map((dropdownItem) => (
                      <a
                        key={`${item.label}-${dropdownItem.label}`}
                        href={dropdownItem.href}
                        className="vajra-contact-mini-link"
                      >
                        {dropdownItem.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="vajra-contact-right">
              <button
                type="button"
                className="vajra-contact-search"
                aria-label="Search across The Vajra website"
                onClick={() => setSearchOpen(true)}
              >
                <Search size={34} strokeWidth={1.8} />
              </button>
              <span className="vajra-contact-global">
                <Globe size={20} strokeWidth={1.9} />
                <span>Global (En)</span>
                <ChevronDown size={14} strokeWidth={2.1} />
              </span>
              <a href="/contact-us" className="vajra-contact-home">
                Contact Us
              </a>
            </div>
          </div>

          <section className="vajra-contact-hero">
            <h1 className="vajra-contact-title">What&apos;s on your mind?</h1>
            <p className="vajra-contact-intro">
              We&apos;re here to help. Tell us what you&apos;re looking for and we&apos;ll get you
              connected to the right people.
            </p>
          </section>

          <section className="vajra-contact-grid" aria-label="Primary contact options">
            {primaryCards.map(({ title, body, href, icon: Icon }) => (
              <a key={title} href={href} className="vajra-contact-card">
                <span className="vajra-contact-card-icon">
                  <Icon size={30} strokeWidth={1.9} />
                </span>
                <h2>{title}</h2>
                <p>{body}</p>
              </a>
            ))}
          </section>

          <p className="vajra-contact-subcopy">Looking for something else?</p>

          <section className="vajra-contact-links" aria-label="Secondary contact links">
            {secondaryLinks.map((item) => (
              <a key={item.label} href={item.href} className="vajra-contact-link">
                <span>{item.label}</span>
                <span className="vajra-contact-link-icon">
                  <ArrowRight size={24} strokeWidth={2.2} />
                </span>
              </a>
            ))}
          </section>
        </div>
      </div>

      {searchOpen ? (
        <div className="vajra-search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="vajra-search-modal" onClick={(event) => event.stopPropagation()}>
            <div className="vajra-search-topbar">
              <Search size={22} strokeWidth={2} />
              <input
                autoFocus
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search pages, sections, careers, support..."
                className="vajra-search-input"
              />
              <button
                type="button"
                className="vajra-search-close"
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            <div className="vajra-search-results">
              {filteredSearchItems.length > 0 ? (
                filteredSearchItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="vajra-search-result"
                    onClick={() => setSearchOpen(false)}
                  >
                    <strong>{item.label}</strong>
                    <span>{item.description}</span>
                  </a>
                ))
              ) : (
                <div className="vajra-search-empty">
                  Koi result nahi mila. `founder`, `support`, `careers`, `privacy`, ya `why vajra`
                  jaisa kuch search karke dekho.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <LandingFooter />
    </div>
  );
}
