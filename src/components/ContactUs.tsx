import {
  ArrowRight,
  Building2,
  ChevronDown,
  Globe,
  Newspaper,
  RadioTower,
  Search,
  Sparkles,
} from 'lucide-react';
import { useEffect } from 'react';
import { applySeo } from '../lib/seo';
import LandingFooter from './LandingFooter';

const CONTACT_EMAIL = 'info@vajracognixia.in';
const FOUNDER_EMAIL = 'founder-thevajra@vajracognixia.in';

const primaryCards = [
  {
    title: 'Request for Services',
    body: 'Product questions, operational discussions, and platform interest.',
    href: `mailto:${CONTACT_EMAIL}?subject=Service%20Request%20for%20The%20Vajra`,
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
    href: '/careers',
  },
  {
    label: 'Partnerships',
    href: `mailto:${FOUNDER_EMAIL}?subject=Partnership%20Discussion`,
  },
  {
    label: 'Website feedback',
    href: `mailto:${CONTACT_EMAIL}?subject=Website%20Feedback`,
  },
] as const;

const topNavLinks = [
  'What we do',
  'Who we are',
  'Insights',
  'Careers',
  'Newsroom',
  'Investors',
] as const;

export default function ContactUs() {
  useEffect(() => {
    applySeo({
      title: 'Contact | The Vajra',
      description:
        'Reach The Vajra for services, partnerships, media requests, founder contact, and website feedback.',
      canonical: 'https://www.vajracognixia.in/contact-us',
    });
  }, []);

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

        .vajra-contact-nav-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
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
        }
      `}</style>

      <div className="vajra-contact-shell">
        <div className="vajra-contact-page">
          <div className="vajra-contact-nav">
            <a href="/" className="vajra-contact-brand">The Vajra</a>

            <div className="vajra-contact-center" aria-label="Primary contact navigation">
              {topNavLinks.map((item) => (
                <a key={item} href="/" className="vajra-contact-nav-link">
                  <span>{item}</span>
                  <ChevronDown size={14} strokeWidth={2.1} />
                </a>
              ))}
            </div>

            <div className="vajra-contact-right">
              <span className="vajra-contact-search" aria-hidden="true">
                <Search size={34} strokeWidth={1.8} />
              </span>
              <span className="vajra-contact-global">
                <Globe size={20} strokeWidth={1.9} />
                <span>Global (En)</span>
                <ChevronDown size={14} strokeWidth={2.1} />
              </span>
              <a href="/" className="vajra-contact-home">
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

      <LandingFooter />
    </div>
  );
}
