import { ArrowLeft, Building2, ChevronDown } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { applySeo } from '../lib/seo';

type RequestFormState = {
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  region: string;
  industry: string;
  help: string;
  consent: boolean;
  updates: boolean;
};

type RequestFormErrors = Partial<Record<keyof RequestFormState, string>>;

export default function RequestForServicesPage() {
  const [form, setForm] = useState<RequestFormState>({
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
  const [errors, setErrors] = useState<RequestFormErrors>({});

  useEffect(() => {
    applySeo({
      title: 'Request For Services | The Vajra',
      description:
        'Share your service request with The Vajra team and start a conversation about partnerships, delivery, and platform support.',
      canonical: 'https://www.vajracognixia.in/request-services',
    });
  }, []);

  const validateForm = (values: RequestFormState) => {
    const nextErrors: RequestFormErrors = {};

    if (!values.firstName.trim()) nextErrors.firstName = 'Please enter your first name.';
    if (!values.lastName.trim()) nextErrors.lastName = 'Please enter your last name.';
    if (!values.email.trim()) {
      nextErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (!values.organization.trim()) nextErrors.organization = 'Please enter your organization.';
    if (!values.region) nextErrors.region = 'Please select your region.';
    if (!values.industry) nextErrors.industry = 'Please select your industry.';
    if (!values.help.trim()) nextErrors.help = 'Please tell us how we can help you.';
    if (!values.consent) nextErrors.consent = 'Consent is required before sending your request.';

    return nextErrors;
  };

  const updateField = <K extends keyof RequestFormState>(key: K, value: RequestFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) {
        return current;
      }

      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateForm(form);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

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
          width: min(100%, calc(100% - 2px));
          margin: 0 auto;
          padding: 0;
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
          padding: 34px 36px 0;
        }

        .vajra-request-stage {
          margin-top: 18px;
        }

        .vajra-request-layout {
          min-height: calc(100vh - 106px);
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background:
            linear-gradient(90deg, rgba(2, 2, 16, 0.98) 0%, rgba(3, 3, 19, 0.98) 58%, rgba(16, 18, 39, 0.78) 100%),
            rgba(3, 3, 18, 0.92);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(12px);
          overflow: hidden;
        }

        .vajra-request-frame {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(360px, 0.62fr);
          min-height: calc(100vh - 106px);
        }

        .vajra-request-main {
          padding: 72px 72px 56px 76px;
        }

        .vajra-request-panel-head {
          display: flex;
          align-items: flex-start;
          gap: 18px;
          margin-bottom: 42px;
        }

        .vajra-request-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          color: #ffffff;
          font-family: 'Manrope', sans-serif;
          font-size: 0.96rem;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .vajra-request-copy {
          max-width: 24ch;
          margin-bottom: 72px;
          color: rgba(234, 224, 210, 0.92);
          font-family: 'Manrope', sans-serif;
          font-size: clamp(2rem, 2.45vw, 2.8rem);
          font-weight: 400;
          line-height: 1.48;
          letter-spacing: -0.045em;
        }

        .vajra-request-form {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 56px 56px;
        }

        .vajra-request-field,
        .vajra-request-field-full {
          display: grid;
          gap: 14px;
        }

        .vajra-request-field-full {
          grid-column: 1 / -1;
        }

        .vajra-request-field.is-error .vajra-request-input,
        .vajra-request-field.is-error .vajra-request-select,
        .vajra-request-field-full.is-error .vajra-request-input,
        .vajra-request-field-full.is-error .vajra-request-select,
        .vajra-request-field-full.is-error .vajra-request-textarea {
          border-bottom-color: rgba(255, 110, 110, 0.92);
        }

        .vajra-request-label {
          color: #ffffff;
          font-family: 'Manrope', sans-serif;
          font-size: 1.1rem;
          font-weight: 500;
          letter-spacing: -0.04em;
        }

        .vajra-request-input,
        .vajra-request-select,
        .vajra-request-textarea {
          width: 100%;
          border: 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.42);
          border-radius: 0;
          background: transparent;
          color: #ffffff;
          font-family: 'Manrope', sans-serif;
          font-size: 1rem;
          line-height: 1.6;
          padding: 0 0 18px;
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
          color-scheme: dark;
        }

        .vajra-request-select option {
          color: #111111;
          background: #f5f2ea;
        }

        .vajra-request-select-wrap {
          position: relative;
          display: block;
        }

        .vajra-request-select-wrap svg {
          position: absolute;
          right: 2px;
          bottom: 18px;
          pointer-events: none;
          color: rgba(255, 255, 255, 0.9);
          transition: color 160ms ease, transform 160ms ease;
        }

        .vajra-request-select-wrap:hover svg,
        .vajra-request-select:focus + svg {
          color: rgba(104, 152, 255, 0.95);
          transform: translateY(-1px);
        }

        .vajra-request-input::placeholder,
        .vajra-request-textarea::placeholder {
          color: rgba(255, 255, 255, 0.24);
        }

        .vajra-request-textarea {
          min-height: 120px;
          resize: vertical;
        }

        .vajra-request-meta {
          display: flex;
          justify-content: flex-end;
          margin-top: 2px;
          color: rgba(255, 255, 255, 0.48);
          font-family: 'Manrope', sans-serif;
          font-size: 0.9rem;
        }

        .vajra-request-error {
          color: rgba(255, 136, 136, 0.96);
          font-family: 'Manrope', sans-serif;
          font-size: 0.84rem;
          line-height: 1.5;
        }

        .vajra-request-checks {
          display: grid;
          gap: 18px;
          margin-top: 4px;
        }

        .vajra-request-check {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          color: rgba(240, 229, 214, 0.72);
          font-family: 'Manrope', sans-serif;
          font-size: 0.95rem;
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
          font-size: 0.9rem;
          line-height: 1.75;
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

        .vajra-request-submit-wrap {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          margin-top: 32px;
        }

        .vajra-request-submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 156px;
          min-height: 74px;
          border: 1px solid rgba(255, 255, 255, 0.78);
          border-radius: 999px;
          background: rgba(167, 167, 167, 0.78);
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
          background: rgba(185, 185, 185, 0.88);
        }

        .vajra-request-cta-note {
          color: rgba(240, 229, 214, 0.66);
          font-family: 'Manrope', sans-serif;
          font-size: 0.9rem;
          line-height: 1.7;
        }

        .vajra-request-visual {
          position: relative;
          min-height: 100%;
          background:
            linear-gradient(180deg, rgba(20, 21, 40, 0.14), rgba(13, 14, 32, 0.32)),
            linear-gradient(90deg, rgba(7, 7, 23, 0.76) 0%, rgba(7, 7, 23, 0.14) 24%, rgba(7, 7, 23, 0.08) 100%);
        }

        .vajra-request-visual::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(3, 3, 18, 0.9) 0%, rgba(3, 3, 18, 0.22) 22%, rgba(3, 3, 18, 0.18) 100%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(3, 3, 18, 0.18));
          pointer-events: none;
        }

        .vajra-request-visual img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          filter: grayscale(1) contrast(1.05) brightness(0.52);
          display: block;
        }

        @media (max-width: 1100px) {
          .vajra-request-frame {
            grid-template-columns: 1fr;
          }

          .vajra-request-layout {
            min-height: auto;
          }

          .vajra-request-frame {
            min-height: auto;
          }

          .vajra-request-main {
            padding: 52px 34px 40px;
          }

          .vajra-request-copy {
            max-width: 100%;
          }

          .vajra-request-visual {
            min-height: 420px;
          }
        }

        @media (max-width: 820px) {
          .vajra-request-shell {
            width: 100%;
          }

          .vajra-request-main {
            padding: 38px 20px 32px;
          }

          .vajra-request-form {
            grid-template-columns: 1fr;
            gap: 34px;
          }

          .vajra-request-copy {
            margin-bottom: 48px;
            max-width: 100%;
            font-size: clamp(1.8rem, 8vw, 2.4rem);
          }

          .vajra-request-back {
            padding: 24px 20px 0;
            font-size: 0.88rem;
            letter-spacing: 0.12em;
          }

          .vajra-request-panel-head {
            margin-bottom: 30px;
          }

          .vajra-request-visual {
            min-height: 320px;
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
              <div className="vajra-request-frame">
                <div className="vajra-request-main">
                  <div className="vajra-request-panel-head">
                    <div className="vajra-request-eyebrow">
                      <Building2 size={34} strokeWidth={1.8} color="#5b97ff" />
                      <span>Request For Services</span>
                    </div>
                  </div>

                  <p className="vajra-request-copy">
                    We&apos;ve driven growth and purposeful transformation across every industry and
                    we&apos;re excited to build on your belief. Tell us a bit more about yourself,
                    so we can get the ball rolling.
                  </p>

                  <form className="vajra-request-form" onSubmit={handleSubmit}>
                    <label className={`vajra-request-field${errors.firstName ? ' is-error' : ''}`}>
                      <span className="vajra-request-label">First name*</span>
                      <input
                        className="vajra-request-input"
                        value={form.firstName}
                        onChange={(event) => updateField('firstName', event.target.value)}
                      />
                      {errors.firstName ? <span className="vajra-request-error">{errors.firstName}</span> : null}
                    </label>

                    <label className={`vajra-request-field${errors.lastName ? ' is-error' : ''}`}>
                      <span className="vajra-request-label">Last name*</span>
                      <input
                        className="vajra-request-input"
                        value={form.lastName}
                        onChange={(event) => updateField('lastName', event.target.value)}
                      />
                      {errors.lastName ? <span className="vajra-request-error">{errors.lastName}</span> : null}
                    </label>

                    <label className={`vajra-request-field${errors.email ? ' is-error' : ''}`}>
                      <span className="vajra-request-label">Email*</span>
                      <input
                        type="email"
                        className="vajra-request-input"
                        value={form.email}
                        onChange={(event) => updateField('email', event.target.value)}
                      />
                      {errors.email ? <span className="vajra-request-error">{errors.email}</span> : null}
                    </label>

                    <label className={`vajra-request-field${errors.organization ? ' is-error' : ''}`}>
                      <span className="vajra-request-label">Organization*</span>
                      <input
                        className="vajra-request-input"
                        value={form.organization}
                        onChange={(event) => updateField('organization', event.target.value)}
                      />
                      {errors.organization ? <span className="vajra-request-error">{errors.organization}</span> : null}
                    </label>

                    <label className={`vajra-request-field-full${errors.region ? ' is-error' : ''}`}>
                      <span className="vajra-request-label">Region*</span>
                      <span className="vajra-request-select-wrap">
                        <select
                          className="vajra-request-select"
                          value={form.region}
                          onChange={(event) => updateField('region', event.target.value)}
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
                      {errors.region ? <span className="vajra-request-error">{errors.region}</span> : null}
                    </label>

                    <label className={`vajra-request-field-full${errors.industry ? ' is-error' : ''}`}>
                      <span className="vajra-request-label">Industry*</span>
                      <span className="vajra-request-select-wrap">
                        <select
                          className="vajra-request-select"
                          value={form.industry}
                          onChange={(event) => updateField('industry', event.target.value)}
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
                      {errors.industry ? <span className="vajra-request-error">{errors.industry}</span> : null}
                    </label>

                    <label className={`vajra-request-field-full${errors.help ? ' is-error' : ''}`}>
                      <span className="vajra-request-label">How can we help you?*</span>
                      <textarea
                        className="vajra-request-textarea"
                        maxLength={1500}
                        value={form.help}
                        onChange={(event) => updateField('help', event.target.value)}
                      />
                      <span className="vajra-request-meta">{form.help.length}/1500</span>
                      {errors.help ? <span className="vajra-request-error">{errors.help}</span> : null}
                    </label>

                    <div className="vajra-request-field-full">
                      <div className="vajra-request-checks">
                        <label className="vajra-request-check">
                          <input
                            type="checkbox"
                            checked={form.consent}
                            onChange={(event) => updateField('consent', event.target.checked)}
                          />
                          <span>
                            I consent to processing of my personal data entered above for The Vajra
                            to contact me. *
                          </span>
                        </label>

                        <label className="vajra-request-check">
                          <input
                            type="checkbox"
                            checked={form.updates}
                            onChange={(event) => setForm({ ...form, updates: event.target.checked })}
                          />
                          <span>
                            I would like to receive details about products, services, and events
                            from The Vajra.
                          </span>
                        </label>
                      </div>
                      {errors.consent ? <span className="vajra-request-error">{errors.consent}</span> : null}
                    </div>

                    <div className="vajra-request-field-full">
                      <p className="vajra-request-note">
                        For further details on how your personal data will be processed and how your
                        consent can be managed, refer to the <a href="/privacy">The Vajra Privacy
                        Notice</a>.
                      </p>
                      <p className="vajra-request-required">*Mandatory fields</p>
                      <div className="vajra-request-submit-wrap">
                        <button type="submit" className="vajra-request-submit">
                          Send
                        </button>
                        <p className="vajra-request-cta-note">
                          We usually respond within 24 to 48 hours with the next step.
                        </p>
                      </div>
                    </div>
                  </form>
                </div>

                <aside className="vajra-request-visual" aria-label="Request for services visual">
                  <img
                    src="/contact/request-services-bg.jpg"
                    alt="Professional The Vajra services background"
                  />
                </aside>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
