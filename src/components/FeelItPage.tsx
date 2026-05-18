import { ArrowUpRight, Mail } from 'lucide-react';
import { useEffect } from 'react';
import { applySeo } from '../lib/seo';
import LandingFooter from './LandingFooter';

export default function FeelItPage() {
  useEffect(() => {
    applySeo({
      title: 'Feel It | The Vajra',
      description:
        'A focused showcase page for The Vajra experience with the signature phone visual.',
      canonical: 'https://www.vajracognixia.in/feel-it',
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f3ec] text-[#111111]">
      <style>{`
        .feelit-simple-shell {
          width: min(1200px, calc(100% - 32px));
          margin: 0 auto;
        }

        .feelit-simple-hero {
          padding: 28px 0 64px;
        }

        .feelit-simple-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 28px;
        }

        .feelit-simple-brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: #111111;
          text-decoration: none;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.24em;
          text-transform: uppercase;
        }

        .feelit-simple-brand::before {
          content: '';
          width: 11px;
          height: 11px;
          border-radius: 3px;
          transform: rotate(45deg);
          background: linear-gradient(135deg, #ff8d18 0%, #ffba72 100%);
          box-shadow: 0 0 0 6px rgba(255, 141, 24, 0.08);
        }

        .feelit-simple-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .feelit-simple-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 48px;
          padding: 0 20px;
          border-radius: 999px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
        }

        .feelit-simple-btn.is-primary {
          background: #111111;
          color: #ffffff;
        }

        .feelit-simple-btn.is-soft {
          background: #e7dfd0;
          color: #111111;
        }

        .feelit-simple-copy {
          max-width: 760px;
          margin: 0 auto 28px;
          text-align: center;
        }

        .feelit-simple-copy h1 {
          font-size: clamp(2.8rem, 6vw, 5.4rem);
          line-height: 0.94;
          letter-spacing: -0.07em;
          text-transform: uppercase;
        }

        .feelit-simple-copy p {
          margin-top: 18px;
          color: #6e675d;
          font-size: 16px;
          line-height: 1.75;
        }

        .feelit-simple-frame {
          overflow: hidden;
          border-radius: 32px;
          box-shadow: 0 26px 60px rgba(17, 17, 17, 0.1);
          background: #ff7f09;
        }

        .feelit-simple-image {
          display: block;
          width: 100%;
          height: auto;
        }

        @media (max-width: 640px) {
          .feelit-simple-shell {
            width: min(100%, calc(100% - 20px));
          }

          .feelit-simple-hero {
            padding-top: 18px;
            padding-bottom: 42px;
          }

          .feelit-simple-topbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .feelit-simple-copy p {
            font-size: 14px;
          }

          .feelit-simple-frame {
            border-radius: 24px;
          }
        }
      `}</style>

      <div className="feelit-simple-shell">
        <section className="feelit-simple-hero">
          <div className="feelit-simple-topbar">
            <a href="/" className="feelit-simple-brand">
              The Vajra
            </a>

            <div className="feelit-simple-actions">
              <a href="/" className="feelit-simple-btn is-soft">
                Back Home
              </a>
              <a href="/support" className="feelit-simple-btn is-primary">
                Get Support
                <Mail size={15} />
              </a>
            </div>
          </div>

          <div className="feelit-simple-copy">
            <h1>Feel The Vajra Experience</h1>
            <p>
              Yeh page phone showcase design ko separate bhi preserve karta hai, while landing page
              par bhi wahi visual same rehta hai.
            </p>
          </div>

          <div className="feelit-simple-frame">
            <img
              src="/area/job-search-showcase.png"
              alt="The Vajra phone experience showcase"
              className="feelit-simple-image"
            />
          </div>
        </section>
      </div>

      <div className="feelit-simple-shell pb-10">
        <a href="/signup" className="feelit-simple-btn is-primary">
          Continue with Vajra
          <ArrowUpRight size={15} />
        </a>
      </div>

      <LandingFooter />
    </div>
  );
}
