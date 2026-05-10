import { useState, type FormEvent } from 'react';
import { Globe2, Instagram, Mail } from 'lucide-react';

const SUPPORT_EMAIL = 'support@vajracognixia.in';
const COMPANY_WEBSITE_URL = 'https://www.vajracognixia.in/';
const COMPANY_INSTAGRAM_URL = 'https://www.instagram.com/vajracognixia.in/';

/**
 * Marketing / landing footer (#5c5c5a) — same block as the public homepage.
 * Safe to mount on any route (uses normal anchor navigation).
 */
export default function LandingFooter() {
  const [footerNewsletterEmail, setFooterNewsletterEmail] = useState('');
  const currentYear = new Date().getFullYear();

  const handleFooterNewsletterSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanEmail = footerNewsletterEmail.trim();
    const subject = encodeURIComponent('The Vajra newsletter signup');
    const body = encodeURIComponent(
      cleanEmail
        ? `Please add ${cleanEmail} to The Vajra updates list.`
        : 'Please add me to The Vajra updates list.'
    );
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  const handleBackToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <style>{`
        .area-footer {
          margin-top: 10px;
          width: 100vw;
          margin-left: calc(50% - 50vw);
          padding: 0;
          background: #5c5c5a;
          color: rgba(255, 255, 255, 0.82);
        }

        .area-footer-inner {
          width: min(1180px, calc(100% - 64px));
          margin: 0 auto;
          padding: 38px 0 28px;
        }

        .area-footer-top {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.06em;
          color: rgba(255, 255, 255, 0.78);
        }

        .area-footer-top strong {
          color: #ffffff;
          font-weight: 600;
        }

        .area-footer-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.9fr 0.85fr 1.15fr;
          gap: 46px;
        }

        .area-footer-heading {
          margin-bottom: 17px;
          color: rgba(255, 255, 255, 0.48);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .area-footer-list {
          display: grid;
          gap: 8px;
          color: rgba(255, 255, 255, 0.84);
          font-size: 13px;
          line-height: 1.4;
        }

        .area-footer-list a,
        .area-footer-legal a {
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 2px;
          transition: color 180ms ease;
        }

        .area-footer-list a:hover,
        .area-footer-legal a:hover {
          color: #ffffff;
        }

        .area-footer-social {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 22px;
        }

        .area-footer-social a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 999px;
          color: rgba(255, 255, 255, 0.9);
          transition: background-color 180ms ease, color 180ms ease;
        }

        .area-footer-social a:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }

        .area-footer-newsletter {
          display: flex;
          gap: 8px;
          margin-top: 18px;
        }

        .area-footer-newsletter input {
          min-width: 0;
          flex: 1;
          height: 44px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.92);
          padding: 0 14px;
          color: #222;
          font-family: inherit;
          font-size: 12px;
          outline: none;
        }

        .area-footer-newsletter button {
          width: 84px;
          height: 44px;
          border: 1px solid rgba(255, 255, 255, 0.38);
          background: transparent;
          color: #ffffff;
          font-family: inherit;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .area-footer-copy {
          max-width: 300px;
          color: rgba(255, 255, 255, 0.66);
          font-size: 12px;
          line-height: 1.7;
        }

        .area-footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-top: 44px;
          padding-top: 22px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.42);
          font-size: 11px;
        }

        .area-footer-legal {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
        }

        .area-footer-badges {
          margin-top: 18px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .area-footer-badges span {
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.04);
          padding: 6px 10px;
          border-radius: 999px;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.85);
        }

        .footer-utility {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .footer-partner-btn,
        .footer-top-btn {
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 999px;
          padding: 6px 12px;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.92);
          background: transparent;
          cursor: pointer;
        }

        .footer-top-btn {
          color: #ffe9d9;
        }

        @media (max-width: 960px) {
          .area-footer-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 36px;
          }
        }

        @media (max-width: 640px) {
          .area-footer-inner {
            width: min(100%, calc(100% - 32px));
            padding: 38px 0 24px;
          }

          .area-footer-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .area-footer-bottom {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <footer className="area-footer">
        <div className="area-footer-inner">
          <div className="area-footer-top">
            <span><strong>Support:</strong> {SUPPORT_EMAIL}</span>
            <span><strong>Response:</strong> Within 24 hours</span>
            <span><strong>Hours:</strong> Mon-Sat, 10:00 AM - 7:00 PM IST</span>
          </div>

          <div className="area-footer-grid">
            <div>
              <h3 className="area-footer-heading">Help & Information</h3>
              <nav className="area-footer-list" aria-label="Help and information">
                <a href="/privacy">Privacy Policy</a>
                <a href="/terms">Terms & Conditions</a>
                <a href="/refund-cancellation">Refund & Cancellation</a>
                <a href="/shipping-policy">Shipping Policy</a>
                <a href={`mailto:${SUPPORT_EMAIL}`}>Contact Support</a>
              </nav>
            </div>

            <div>
              <h3 className="area-footer-heading">Explore</h3>
              <nav className="area-footer-list" aria-label="Footer navigation">
                <a href="/#top">Home</a>
                <a href="/#benefits">Why Vajra</a>
                <a href="/#specifications">Delivery Model</a>
                <a href="/team">Team</a>
                <a href="/founder">Founder</a>
                <a href="/careers">Careers</a>
              </nav>
            </div>

            <div>
              <h3 className="area-footer-heading">Company</h3>
              <nav className="area-footer-list" aria-label="Company links">
                <a href={COMPANY_WEBSITE_URL} target="_blank" rel="noreferrer">
                  VajraCognixia
                </a>
                <a href="/#contact">Partnerships</a>
                <a href="/careers">Apply for Job</a>
                <a href={`mailto:${SUPPORT_EMAIL}`}>Support</a>
              </nav>
            </div>

            <div>
              <h3 className="area-footer-heading">Social Media</h3>
              <div className="area-footer-social">
                <a href={COMPANY_INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram">
                  <Instagram size={17} />
                </a>
                <a href={`mailto:${SUPPORT_EMAIL}`} aria-label="Email">
                  <Mail size={17} />
                </a>
                <a href={COMPANY_WEBSITE_URL} target="_blank" rel="noreferrer" aria-label="Website">
                  <Globe2 size={17} />
                </a>
              </div>
              <p className="area-footer-copy">
                The Vajra powers smart delivery, online marketplace access, and everyday services in one
                modern platform.
              </p>
              <form className="area-footer-newsletter" onSubmit={handleFooterNewsletterSubmit}>
                <input
                  type="email"
                  placeholder="E-Mail Address"
                  aria-label="Email address"
                  value={footerNewsletterEmail}
                  onChange={(event) => setFooterNewsletterEmail(event.target.value)}
                  required
                />
                <button type="submit">Send</button>
              </form>
            </div>
          </div>

          <div className="area-footer-badges" aria-label="Trust signals">
            <span>Privacy-first</span>
            <span>Secure workflows</span>
            <span>Fast support</span>
            <span>Founder-led execution</span>
          </div>

          <div className="area-footer-bottom">
            <div className="area-footer-legal">
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
              <a href="/team">Team</a>
              <a href="/careers">Careers</a>
            </div>
            <div className="footer-utility">
              <a className="footer-partner-btn" href="/support">
                Partner with us
              </a>
              <button type="button" className="footer-top-btn" onClick={handleBackToTop}>
                Back to top
              </button>
              <span>Copyright {currentYear} The VajraCognixia Technologies Private Limited</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
