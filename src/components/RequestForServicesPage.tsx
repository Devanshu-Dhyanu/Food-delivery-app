import { ArrowLeft, Building2, ChevronDown } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { applySeo } from '../lib/seo';

export default function RequestForServicesPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    region: '',
    industry: '',
    help: '',
    consent: false,
    updates: false,
  });

  useEffect(() => {
    applySeo({
      title: 'Request For Services | The Vajra',
      description:
        'Share your service request with The Vajra team and start a conversation about partnerships, delivery, and platform support.',
      canonical: 'https://www.vajracognixia.in/request-services',
    });
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = encodeURIComponent('Request for Services | The Vajra');
    const body = encodeURIComponent(
      [
        `First name: ${form.firstName}`,
        `Last name: ${form.lastName}`,
        `Email: ${form.email}`,
        `Organization: ${form.organization}`,
        `Region: ${form.region}`,
        `Industry: ${form.industry}`,
        '',
        'How can we help you?',
        form.help,
      ].join('\n')
    );

    window.location.href = `mailto:info@vajracognixia.in?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-[#030312] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

        .vajra-request-page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(circle at top left, rgba(47, 55, 138, 0.22), transparent 34%),
            linear-gradient(135deg, #040412 0%, #060616 46%, #0a0b1d 100%);
        }

        .vajra-request-shell {
          width: min(1680px, calc(100% - 64px));
          margin: 0 auto;
          padding: 42px 0 72px;
        }

        .vajra-request-back {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: rgba(235, 225, 207, 0.92);
          text-decoration: none;
          font-family: 'Manrope', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .vajra-request-stage {
          display: grid;
          grid-template-columns: minmax(0, 0.95fr) minmax(380px, 0.78fr);
          gap: 46px;
          align-items: stretch;
          margin-top: 28px;
        }

        .vajra-request-layout {
          padding: 72px 64px 58px 72px;
          border-radius: 34px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02)),
            rgba(3, 3, 18, 0.74);
          box-shadow:
            0 30px 80px rgba(0, 0, 0, 0.34),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(12px);
        }

        .vajra-request-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 18px;
          margin-bottom: 40px;
          color: #ffffff;
          font-family: 'Manrope', sans-serif;
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .vajra-request-copy {
          max-width: 12ch;
          margin-bottom: 54px;
          color: rgba(240, 229, 214, 0.9);
          font-family: 'Manrope', sans-serif;
          font-size: clamp(2rem, 3vw, 3rem);
          font-weight: 400;
          line-height: 1.55;
          letter-spacing: -0.05em;
        }

        .vajra-request-form {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 40px 58px;
        }

        .vajra-request-field,
        .vajra-request-field-full {
          display: grid;
          gap: 12px;
        }

        .vajra-request-field-full {
          grid-column: 1 / -1;
        }

        .vajra-request-label {
          color: #ffffff;
          font-family: 'Manrope', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: -0.03em;
        }

        .vajra-request-input,
        .vajra-request-select,
        .vajra-request-textarea {
          width: 100%;
          border: 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.34);
          border-radius: 0;
          background: transparent;
          color: #ffffff;
          font-family: 'Manrope', sans-serif;
          font-size: 1rem;
          line-height: 1.6;
          padding: 0 0 14px;
          outline: none;
          transition: border-color 160ms ease, color 160ms ease;
        }

        .vajra-request-input:focus,
        .vajra-request-select:focus,
        .vajra-request-textarea:focus {
          border-bottom-color: rgba(104, 152, 255, 0.88);
        }

        .vajra-request-select {
          appearance: none;
          background-image: none;
        }

        .vajra-request-select-wrap {
          position: relative;
        }

        .vajra-request-select-wrap svg {
          position: absolute;
          right: 0;
          bottom: 16px;
          pointer-events: none;
          color: rgba(255, 255, 255, 0.9);
        }

        .vajra-request-input::placeholder,
        .vajra-request-textarea::placeholder {
          color: rgba(255, 255, 255, 0.28);
        }

        .vajra-request-textarea {
          min-height: 96px;
          resize: vertical;
        }

        .vajra-request-meta {
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;
          color: rgba(255, 255, 255, 0.48);
          font-family: 'Manrope', sans-serif;
          font-size: 0.9rem;
        }

        .vajra-request-checks {
          display: grid;
          gap: 22px;
          margin-top: 18px;
        }

        .vajra-request-check {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          color: rgba(240, 229, 214, 0.72);
          font-family: 'Manrope', sans-serif;
          font-size: 0.98rem;
          line-height: 1.75;
        }

        .vajra-request-check input {
          width: 22px;
          height: 22px;
          margin-top: 2px;
          accent-color: #8a8a8a;
        }

        .vajra-request-note {
          margin-top: 28px;
          color: rgba(240, 229, 214, 0.72);
          font-family: 'Manrope', sans-serif;
          font-size: 0.98rem;
          line-height: 1.8;
        }

        .vajra-request-note a {
          color: #ffffff;
          font-weight: 700;
          text-decoration: underline;
        }

        .vajra-request-required {
          margin-top: 10px;
          color: rgba(240, 229, 214, 0.78);
          font-family: 'Manrope', sans-serif;
          font-size: 0.95rem;
        }

        .vajra-request-submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 156px;
          min-height: 78px;
          margin-top: 38px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 999px;
          background: rgba(164, 164, 164, 0.86);
          color: #ffffff;
          font-family: 'Manrope', sans-serif;
          font-size: 1.05rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.28);
          transition: transform 180ms ease, background 180ms ease;
          cursor: pointer;
        }

        .vajra-request-submit:hover {
          transform: translateY(-1px);
          background: rgba(182, 182, 182, 0.92);
        }

        .vajra-request-visual {
          position: relative;
          min-height: 100%;
          border-radius: 34px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background:
            radial-gradient(circle at top, rgba(111, 121, 255, 0.16), transparent 32%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02)),
            rgba(7, 8, 24, 0.72);
          box-shadow:
            0 30px 80px rgba(0, 0, 0, 0.34),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }

        .vajra-request-visual::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(3, 3, 18, 0.08), rgba(3, 3, 18, 0.42)),
            linear-gradient(90deg, rgba(3, 3, 18, 0.08), rgba(3, 3, 18, 0));
          pointer-events: none;
        }

        .vajra-request-visual img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          display: block;
          padding: 28px 24px 0;
          filter: saturate(0.78) contrast(1.02) brightness(0.9);
        }

        .vajra-request-visual-copy {
          position: absolute;
          left: 26px;
          right: 26px;
          bottom: 24px;
          z-index: 1;
          display: grid;
          gap: 8px;
          padding: 18px 18px 20px;
          border-radius: 22px;
          background: rgba(7, 8, 24, 0.58);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .vajra-request-visual-copy span {
          color: rgba(104, 152, 255, 0.95);
          font-family: 'Manrope', sans-serif;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .vajra-request-visual-copy strong {
          color: #ffffff;
          font-family: 'Manrope', sans-serif;
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: -0.05em;
          line-height: 1.2;
        }

        .vajra-request-visual-copy p {
          color: rgba(240, 229, 214, 0.72);
          font-family: 'Manrope', sans-serif;
          font-size: 0.96rem;
          line-height: 1.7;
        }

        @media (max-width: 1100px) {
          .vajra-request-stage {
            grid-template-columns: 1fr;
          }

          .vajra-request-layout {
            padding-left: 44px;
            padding-right: 44px;
          }

          .vajra-request-visual {
            min-height: 560px;
          }
        }

        @media (max-width: 820px) {
          .vajra-request-shell {
            width: min(100%, calc(100% - 28px));
            padding-top: 28px;
          }

          .vajra-request-layout {
            padding: 40px 22px 34px;
          }

          .vajra-request-form {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .vajra-request-copy {
            max-width: 100%;
            font-size: clamp(1.7rem, 7vw, 2.5rem);
          }

          .vajra-request-stage {
            gap: 24px;
          }

          .vajra-request-visual {
            min-height: 360px;
          }

          .vajra-request-visual img {
            padding: 16px 12px 0;
          }

          .vajra-request-visual-copy {
            left: 14px;
            right: 14px;
            bottom: 14px;
          }
        }
      `}</style>

      <div className="vajra-request-page">
        <div className="vajra-request-shell">
          <a href="/contact-us" className="vajra-request-back">
            <ArrowLeft size={20} strokeWidth={2.2} />
            <span>Back</span>
          </a>

          <div className="vajra-request-stage">
            <div className="vajra-request-layout">
              <div className="vajra-request-eyebrow">
                <Building2 size={34} strokeWidth={1.8} color="#5b97ff" />
                <span>Request For Services</span>
              </div>

              <p className="vajra-request-copy">
                We&apos;ve driven growth and purposeful transformation across every industry and
                we&apos;re excited to build on your belief. Tell us a bit more about yourself, so
                we can get the ball rolling.
              </p>

              <form className="vajra-request-form" onSubmit={handleSubmit}>
                <label className="vajra-request-field">
                  <span className="vajra-request-label">First name*</span>
                  <input
                    className="vajra-request-input"
                    value={form.firstName}
                    onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                  />
                </label>

                <label className="vajra-request-field">
                  <span className="vajra-request-label">Last name*</span>
                  <input
                    className="vajra-request-input"
                    value={form.lastName}
                    onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                  />
                </label>

                <label className="vajra-request-field">
                  <span className="vajra-request-label">Email*</span>
                  <input
                    type="email"
                    className="vajra-request-input"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                  />
                </label>

                <label className="vajra-request-field">
                  <span className="vajra-request-label">Organization*</span>
                  <input
                    className="vajra-request-input"
                    value={form.organization}
                    onChange={(event) => setForm({ ...form, organization: event.target.value })}
                  />
                </label>

                <label className="vajra-request-field-full">
                  <span className="vajra-request-label">Region*</span>
                  <span className="vajra-request-select-wrap">
                    <select
                      className="vajra-request-select"
                      value={form.region}
                      onChange={(event) => setForm({ ...form, region: event.target.value })}
                    >
                      <option value="" disabled>
                        Select your region
                      </option>
                      <option>North India</option>
                      <option>South India</option>
                      <option>West India</option>
                      <option>East India</option>
                      <option>International</option>
                    </select>
                    <ChevronDown size={18} strokeWidth={2} />
                  </span>
                </label>

                <label className="vajra-request-field-full">
                  <span className="vajra-request-label">Industry*</span>
                  <span className="vajra-request-select-wrap">
                    <select
                      className="vajra-request-select"
                      value={form.industry}
                      onChange={(event) => setForm({ ...form, industry: event.target.value })}
                    >
                      <option value="" disabled>
                        Select your industry
                      </option>
                      <option>Campus Delivery</option>
                      <option>Retail & Commerce</option>
                      <option>Food & Beverage</option>
                      <option>Technology</option>
                      <option>Logistics</option>
                    </select>
                    <ChevronDown size={18} strokeWidth={2} />
                  </span>
                </label>

                <label className="vajra-request-field-full">
                  <span className="vajra-request-label">How can we help you?*</span>
                  <textarea
                    className="vajra-request-textarea"
                    maxLength={1500}
                    value={form.help}
                    onChange={(event) => setForm({ ...form, help: event.target.value })}
                  />
                  <span className="vajra-request-meta">({form.help.length}/1500)</span>
                </label>

                <div className="vajra-request-field-full">
                  <div className="vajra-request-checks">
                    <label className="vajra-request-check">
                      <input
                        type="checkbox"
                        checked={form.consent}
                        onChange={(event) => setForm({ ...form, consent: event.target.checked })}
                      />
                      <span>
                        I consent to processing of my personal data entered above for The Vajra to
                        contact me. *
                      </span>
                    </label>

                    <label className="vajra-request-check">
                      <input
                        type="checkbox"
                        checked={form.updates}
                        onChange={(event) => setForm({ ...form, updates: event.target.checked })}
                      />
                      <span>
                        I would like to receive details about products, services, and events from
                        The Vajra.
                      </span>
                    </label>
                  </div>

                  <p className="vajra-request-note">
                    For further details on how your personal data will be processed and how your
                    consent can be managed, refer to the <a href="/privacy">The Vajra Privacy
                    Notice</a>.
                  </p>
                  <p className="vajra-request-required">*Mandatory fields</p>
                  <button type="submit" className="vajra-request-submit">
                    Send
                  </button>
                </div>
              </form>
            </div>

            <aside className="vajra-request-visual" aria-label="Request for services visual">
              <img src="/contact/request-services-bg.jpg" alt="Professional The Vajra services background" />
              <div className="vajra-request-visual-copy">
                <span>The Vajra Connect</span>
                <strong>Tell us what you need and we&apos;ll take it forward with clarity.</strong>
                <p>
                  Share your requirements, region, and organization details so the right Vajra team
                  can connect with you quickly.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
