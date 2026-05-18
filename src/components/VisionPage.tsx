import { useEffect } from 'react';
import { applySeo } from '../lib/seo';

const focusPoints = [
  'Smarter Delivery',
  'Customer First',
  'Digital Services',
  'Fast And Reliable',
  'Business Growth',
  'Technology With Purpose',
  'Community Innovation',
] as const;

export default function VisionPage() {
  useEffect(() => {
    applySeo({
      title: 'Our Vision | The Vajra',
      description:
        'Discover The Vajra vision for smarter experiences, stronger connections, and meaningful progress across delivery, digital services, and business growth.',
      canonical: 'https://www.vajracognixia.in/vision',
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f3ea] text-[#111111]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

        .vision-page {
          font-family: 'Manrope', sans-serif;
          background: #f7f3ea;
          color: #111111;
        }

        .vision-shell {
          width: min(100%, 1440px);
          margin: 0 auto;
        }

        .vision-topbar {
          min-height: 58px;
          padding: 0 26px;
          display: flex;
          align-items: center;
          gap: 28px;
          background: #0a2a08;
          color: rgba(255, 255, 255, 0.92);
          font-size: 11px;
          font-weight: 500;
        }

        .vision-topbar a {
          text-decoration: none;
          color: inherit;
          transition: opacity 160ms ease;
        }

        .vision-topbar a:hover {
          opacity: 1;
        }

        .vision-hero {
          position: relative;
          min-height: 660px;
          display: flex;
          align-items: flex-end;
          background:
            linear-gradient(180deg, rgba(0, 0, 0, 0.16) 0%, rgba(0, 0, 0, 0.44) 100%),
            url('/auth-drone-bg.jpeg') center/cover no-repeat;
          overflow: hidden;
        }

        .vision-hero::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(0, 0, 0, 0.28) 0%, rgba(0, 0, 0, 0.04) 50%, rgba(0, 0, 0, 0.22) 100%);
          pointer-events: none;
        }

        .vision-hero-content {
          position: relative;
          z-index: 1;
          width: 100%;
          padding: 0 24px 42px;
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(260px, 0.85fr);
          gap: 26px;
          align-items: end;
        }

        .vision-hero-copy h1 {
          font-size: clamp(4rem, 8vw, 6.75rem);
          line-height: 0.9;
          letter-spacing: -0.08em;
          color: #f4f1e8;
        }

        .vision-hero-copy p {
          max-width: 14ch;
          margin-top: 28px;
          font-size: clamp(1.5rem, 2.6vw, 2rem);
          font-weight: 500;
          line-height: 1.05;
          letter-spacing: -0.05em;
          color: #f6f2ea;
        }

        .vision-hero-aside p {
          max-width: 27ch;
          margin-left: auto;
          font-size: 1.08rem;
          line-height: 1.35;
          color: rgba(255, 255, 255, 0.9);
        }

        .vision-section {
          padding: 88px 24px;
        }

        .vision-intro {
          display: grid;
          grid-template-columns: 0.92fr 1fr 1fr;
          gap: 36px;
          align-items: start;
        }

        .vision-intro h2,
        .vision-dark-kicker,
        .vision-belief h2 {
          font-size: clamp(2rem, 3vw, 2.65rem);
          line-height: 1.02;
          letter-spacing: -0.06em;
          font-weight: 700;
        }

        .vision-intro p,
        .vision-belief-intro,
        .vision-belief-footnote,
        .vision-footer-tagline,
        .vision-footer-copy {
          font-size: 1.02rem;
          line-height: 1.5;
          color: rgba(17, 17, 17, 0.85);
        }

        .vision-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          padding: 0 24px;
          border-radius: 999px;
          background: #521915;
          color: #ffffff;
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 600;
          transition: transform 160ms ease, opacity 160ms ease;
        }

        .vision-button:hover {
          transform: translateY(-1px);
          opacity: 0.95;
        }

        .vision-intro-cta {
          margin-top: 34px;
        }

        .vision-image {
          width: 100%;
          display: block;
          object-fit: cover;
        }

        .vision-image.is-feature {
          height: 540px;
        }

        .vision-dark {
          background: #0a2a08;
          color: #f4f1e8;
          display: grid;
          grid-template-columns: 0.9fr 1.35fr;
          gap: 42px;
          align-items: start;
        }

        .vision-dark-kicker {
          color: rgba(244, 241, 232, 0.96);
        }

        .vision-focus-list {
          display: grid;
          gap: 4px;
          margin: 0;
          padding: 0;
          list-style: none;
          font-size: clamp(2.55rem, 5vw, 5rem);
          line-height: 0.94;
          letter-spacing: -0.08em;
          font-weight: 400;
        }

        .vision-focus-more {
          color: rgba(202, 197, 165, 0.68);
        }

        .vision-dark-cta {
          margin-top: 34px;
          background: #ffffff;
          color: #111111;
        }

        .vision-belief {
          text-align: center;
          padding-top: 72px;
          padding-bottom: 92px;
        }

        .vision-belief-intro {
          max-width: 38ch;
          margin: 18px auto 0;
        }

        .vision-quote-card {
          width: min(100%, 820px);
          margin: 42px auto 0;
          padding: 76px 48px 52px;
          background: rgba(255, 255, 255, 0.62);
        }

        .vision-quote-card blockquote {
          font-size: clamp(1.95rem, 4vw, 3rem);
          line-height: 1.02;
          letter-spacing: -0.06em;
          font-weight: 700;
        }

        .vision-quote-team {
          margin-top: 28px;
          font-size: 1.6rem;
          font-weight: 600;
          letter-spacing: -0.05em;
        }

        .vision-carousel {
          margin-top: 36px;
          display: inline-flex;
          align-items: center;
          gap: 18px;
          color: #2f2b28;
        }

        .vision-arrow {
          font-size: 2rem;
          line-height: 1;
        }

        .vision-dots {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .vision-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: rgba(17, 17, 17, 0.16);
        }

        .vision-dot.is-active {
          background: #521915;
        }

        .vision-belief-footnote {
          max-width: 48ch;
          margin: 42px auto 0;
        }

        .vision-belief-cta {
          margin-top: 34px;
        }

        .vision-image.is-footer {
          height: 420px;
        }

        .vision-footer {
          padding: 54px 24px 36px;
          background: #f4efe4;
        }

        .vision-footer-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          padding-bottom: 28px;
          border-bottom: 1px solid rgba(17, 17, 17, 0.14);
        }

        .vision-footer-brand {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          font-size: clamp(2rem, 3.6vw, 3.4rem);
          line-height: 0.95;
          letter-spacing: -0.06em;
          font-weight: 500;
          text-decoration: none;
          color: #111111;
        }

        .vision-footer-brand-mark {
          width: 28px;
          height: 28px;
          object-fit: contain;
          flex-shrink: 0;
        }

        .vision-footer-tagline {
          max-width: 42ch;
          margin-top: 22px;
        }

        .vision-footer-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 30px;
          padding-top: 34px;
        }

        .vision-footer-copy {
          display: grid;
          gap: 6px;
        }

        .vision-footer-copy a {
          color: inherit;
          text-decoration: none;
        }

        .vision-footer-copy a:hover {
          text-decoration: underline;
        }

        .vision-footer-bottom {
          margin-top: 42px;
          font-size: 0.92rem;
          color: rgba(17, 17, 17, 0.72);
        }

        @media (max-width: 980px) {
          .vision-hero {
            min-height: 520px;
          }

          .vision-hero-content,
          .vision-intro,
          .vision-dark,
          .vision-footer-grid {
            grid-template-columns: 1fr;
          }

          .vision-hero-aside p {
            margin-left: 0;
          }

          .vision-intro {
            gap: 28px;
          }

          .vision-dark {
            gap: 30px;
          }

          .vision-image.is-feature {
            height: 420px;
          }
        }

        @media (max-width: 640px) {
          .vision-topbar {
            min-height: 42px;
            padding: 0 16px;
            gap: 22px;
            font-size: 9px;
          }

          .vision-hero {
            min-height: 430px;
            background-position: center;
          }

          .vision-hero-content {
            padding: 0 18px 18px;
            gap: 16px;
          }

          .vision-hero-copy p {
            margin-top: 14px;
            max-width: 16ch;
            font-size: 1.05rem;
          }

          .vision-hero-aside p {
            font-size: 0.98rem;
          }

          .vision-section {
            padding: 54px 18px;
          }

          .vision-intro p,
          .vision-belief-intro,
          .vision-belief-footnote,
          .vision-footer-tagline,
          .vision-footer-copy {
            font-size: 0.98rem;
          }

          .vision-intro-cta,
          .vision-dark-cta,
          .vision-belief-cta {
            width: 100%;
            margin-top: 24px;
          }

          .vision-button {
            width: 100%;
            min-height: 56px;
          }

          .vision-image.is-feature {
            height: 240px;
          }

          .vision-quote-card {
            margin-top: 28px;
            padding: 44px 18px 34px;
          }

          .vision-quote-card blockquote {
            font-size: 1.2rem;
            line-height: 1.12;
          }

          .vision-quote-team {
            font-size: 1.1rem;
          }

          .vision-carousel {
            gap: 12px;
          }

          .vision-image.is-footer {
            height: 205px;
          }

          .vision-footer {
            padding: 36px 18px 24px;
          }

          .vision-footer-header {
            padding-bottom: 22px;
          }

          .vision-footer-brand {
            font-size: 1.55rem;
          }

          .vision-footer-brand-mark {
            width: 22px;
            height: 22px;
          }

          .vision-footer-grid {
            gap: 18px;
            padding-top: 24px;
          }

          .vision-footer-bottom {
            margin-top: 28px;
            font-size: 0.82rem;
          }
        }
      `}</style>

      <div className="vision-page">
        <div className="vision-shell">
          <div className="vision-topbar">
            <a href="/#benefits">Services</a>
            <a href="/contact-us">Schedule a Consult</a>
          </div>

          <section className="vision-hero">
            <div className="vision-hero-content">
              <div className="vision-hero-copy">
                <h1>OUR VISION</h1>
                <p>
                  A clear vision for smarter experiences, stronger connections, and meaningful
                  progress.
                </p>
              </div>

              <div className="vision-hero-aside">
                <p>
                  The Vajra is building a future where technology simplifies daily needs, empowers
                  businesses, and creates trust at every interaction.
                </p>
              </div>
            </div>
          </section>

          <section className="vision-section vision-intro">
            <h2>A Vision Beyond Delivery</h2>

            <div>
              <p>
                Building a faster, smarter, and more trusted future for delivery, service access,
                and everyday digital convenience.
              </p>
              <a href="/contact-us" className="vision-button vision-intro-cta">
                Explore Our Vision
              </a>
            </div>

            <p>
              At The Vajra, our vision is to create an ecosystem where people, businesses, and
              communities connect effortlessly through technology-driven services that feel
              reliable, human, and future-ready.
            </p>
          </section>

          <img
            src="/area/vajra-building.jpg"
            alt="Library-inspired editorial visual for The Vajra vision page"
            className="vision-image is-feature"
          />

          <section className="vision-section vision-dark">
            <div>
              <p className="vision-dark-kicker">A Vision Beyond Delivery</p>
            </div>

            <div>
              <ul className="vision-focus-list">
                {focusPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
                <li className="vision-focus-more">+ More</li>
              </ul>

              <a href="/#benefits" className="vision-button vision-dark-cta">
                Services
              </a>
            </div>
          </section>

          <section className="vision-section vision-belief">
            <h2>The Belief Behind Our Vision</h2>
            <p className="vision-belief-intro">
              Our direction is shaped by a simple idea: great service should not only solve
              problems today, but also build confidence in tomorrow.
            </p>

            <div className="vision-quote-card">
              <blockquote>
                &quot;We are building The Vajra with a long-term vision: to create faster,
                smarter, and more dependable service experiences that people can truly rely on
                every day.&quot;
              </blockquote>
              <p className="vision-quote-team">— The Vajra Team</p>

              <div className="vision-carousel" aria-hidden="true">
                <span className="vision-arrow">←</span>
                <span className="vision-dots">
                  <span className="vision-dot is-active" />
                  <span className="vision-dot" />
                  <span className="vision-dot" />
                  <span className="vision-dot" />
                </span>
                <span className="vision-arrow">→</span>
              </div>
            </div>

            <p className="vision-belief-footnote">
              Every step we take is focused on innovation, accessibility, and building a future
              where digital services feel effortless, human, and impactful.
            </p>

            <a href="/founder" className="vision-button vision-belief-cta">
              Explore Our Journey
            </a>
          </section>

          <img
            src="/area/hero-desktop.png"
            alt="Architectural closing visual for The Vajra vision page"
            className="vision-image is-footer"
          />

          <footer className="vision-footer">
            <div className="vision-footer-header">
              <a href="/" className="vision-footer-brand">
                <img
                  src="/the-vajra-mark.svg"
                  alt=""
                  aria-hidden="true"
                  className="vision-footer-brand-mark"
                />
                <span>The Vajra</span>
              </a>
            </div>

            <p className="vision-footer-tagline">
              Building smarter, trusted, and future-ready service experiences.
            </p>

            <div className="vision-footer-grid">
              <div className="vision-footer-copy">
                <a href="mailto:support@vajracognixia.in">support@vajracognixia.in</a>
                <span>+91 98765 43210</span>
              </div>

              <div className="vision-footer-copy">
                <span>The Vajra</span>
                <span>India</span>
                <span>Serving customers, partners, and growing businesses</span>
              </div>

              <div className="vision-footer-copy">
                <a href="https://www.instagram.com/vajracognixia.in/" target="_blank" rel="noreferrer">
                  Instagram
                </a>
                <a href="mailto:support@vajracognixia.in">Email</a>
                <a href="https://www.vajracognixia.in/" target="_blank" rel="noreferrer">
                  Website
                </a>
              </div>
            </div>

            <p className="vision-footer-bottom">© 2026 The Vajra. All Rights Reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
