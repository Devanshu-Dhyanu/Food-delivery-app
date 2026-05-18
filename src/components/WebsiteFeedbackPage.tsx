import { ArrowLeft, MessageCircleMore } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { applySeo } from '../lib/seo';

type FeedbackFormState = {
  firstName: string;
  lastName: string;
  email: string;
  feedback: string;
  consent: boolean;
};

type FeedbackFormErrors = Partial<Record<keyof FeedbackFormState, string>>;

export default function WebsiteFeedbackPage() {
  const [form, setForm] = useState<FeedbackFormState>({
    firstName: '',
    lastName: '',
    email: '',
    feedback: '',
    consent: false,
  });
  const [errors, setErrors] = useState<FeedbackFormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    applySeo({
      title: 'Website Feedback | The Vajra',
      description:
        'Share website feedback, suggestions, and experience notes with The Vajra team.',
      canonical: 'https://www.vajracognixia.in/website-feedback',
    });
  }, []);

  const validateForm = (values: FeedbackFormState) => {
    const nextErrors: FeedbackFormErrors = {};

    if (!values.firstName.trim()) nextErrors.firstName = 'Please enter your first name.';
    if (!values.lastName.trim()) nextErrors.lastName = 'Please enter your last name.';
    if (!values.email.trim()) {
      nextErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (!values.feedback.trim()) nextErrors.feedback = 'Please share your feedback.';
    if (!values.consent) nextErrors.consent = 'Consent is required before sending feedback.';

    return nextErrors;
  };

  const updateField = <K extends keyof FeedbackFormState>(key: K, value: FeedbackFormState[K]) => {
    setSubmitted(false);
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
      setSubmitted(false);
      return;
    }

    setSubmitted(true);

    const subject = encodeURIComponent('Website Feedback | The Vajra');
    const body = encodeURIComponent(
      [
        `First name: ${form.firstName}`,
        `Last name: ${form.lastName}`,
        `Email: ${form.email}`,
        '',
        'Feedback:',
        form.feedback,
      ].join('\n')
    );

    window.location.href = `mailto:info@vajracognixia.in?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-[#030312] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

        .vajra-feedback-page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(circle at top left, rgba(47, 55, 138, 0.22), transparent 34%),
            linear-gradient(135deg, #040412 0%, #060616 46%, #0a0b1d 100%);
        }

        .vajra-feedback-shell {
          width: min(100%, calc(100% - 2px));
          margin: 0 auto;
          padding: 0;
        }

        .vajra-feedback-back {
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

        .vajra-feedback-stage {
          margin-top: 18px;
        }

        .vajra-feedback-layout {
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

        .vajra-feedback-frame {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(360px, 0.62fr);
          min-height: calc(100vh - 106px);
        }

        .vajra-feedback-main {
          padding: 72px 72px 56px 76px;
        }

        .vajra-feedback-panel-head {
          display: flex;
          align-items: flex-start;
          gap: 18px;
          margin-bottom: 42px;
        }

        .vajra-feedback-eyebrow {
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

        .vajra-feedback-copy {
          max-width: 24ch;
          margin-bottom: 56px;
          color: rgba(234, 224, 210, 0.92);
          font-family: 'Manrope', sans-serif;
          font-size: clamp(2rem, 2.45vw, 2.8rem);
          font-weight: 400;
          line-height: 1.48;
          letter-spacing: -0.045em;
        }

        .vajra-feedback-success {
          max-width: 740px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 34px;
          padding: 16px 18px;
          border-radius: 18px;
          border: 1px solid rgba(104, 152, 255, 0.24);
          background: rgba(104, 152, 255, 0.08);
          color: rgba(236, 243, 255, 0.94);
          font-family: 'Manrope', sans-serif;
          font-size: 0.94rem;
          line-height: 1.7;
        }

        .vajra-feedback-success strong {
          display: block;
          color: #ffffff;
          font-size: 0.98rem;
          font-weight: 700;
          letter-spacing: -0.03em;
        }

        .vajra-feedback-form {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 56px 56px;
        }

        .vajra-feedback-field,
        .vajra-feedback-field-full {
          display: grid;
          gap: 14px;
        }

        .vajra-feedback-field-full {
          grid-column: 1 / -1;
        }

        .vajra-feedback-field.is-error .vajra-feedback-input,
        .vajra-feedback-field-full.is-error .vajra-feedback-input,
        .vajra-feedback-field-full.is-error .vajra-feedback-textarea {
          border-bottom-color: rgba(255, 110, 110, 0.92);
        }

        .vajra-feedback-label {
          color: #ffffff;
          font-family: 'Manrope', sans-serif;
          font-size: 1.1rem;
          font-weight: 500;
          letter-spacing: -0.04em;
          transition: color 160ms ease;
        }

        .vajra-feedback-input,
        .vajra-feedback-textarea {
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
          box-shadow: inset 0 -1px 0 transparent;
          transition: border-color 160ms ease, color 160ms ease, box-shadow 160ms ease;
        }

        .vajra-feedback-input:focus,
        .vajra-feedback-textarea:focus {
          border-bottom-color: rgba(104, 152, 255, 0.88);
          box-shadow: inset 0 -1px 0 rgba(104, 152, 255, 0.88);
        }

        .vajra-feedback-field:focus-within .vajra-feedback-label,
        .vajra-feedback-field-full:focus-within .vajra-feedback-label {
          color: rgba(177, 203, 255, 0.96);
        }

        .vajra-feedback-input::placeholder,
        .vajra-feedback-textarea::placeholder {
          color: rgba(255, 255, 255, 0.24);
        }

        .vajra-feedback-textarea {
          min-height: 120px;
          resize: vertical;
        }

        .vajra-feedback-meta {
          display: flex;
          justify-content: flex-end;
          margin-top: 2px;
          color: rgba(255, 255, 255, 0.48);
          font-family: 'Manrope', sans-serif;
          font-size: 0.9rem;
        }

        .vajra-feedback-error {
          color: rgba(255, 136, 136, 0.96);
          font-family: 'Manrope', sans-serif;
          font-size: 0.84rem;
          line-height: 1.5;
        }

        .vajra-feedback-checks {
          display: grid;
          gap: 18px;
          margin-top: 4px;
        }

        .vajra-feedback-check {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          max-width: 760px;
          color: rgba(240, 229, 214, 0.72);
          font-family: 'Manrope', sans-serif;
          font-size: 0.95rem;
          line-height: 1.75;
        }

        .vajra-feedback-check input {
          width: 22px;
          height: 22px;
          margin-top: 2px;
          accent-color: #8a8a8a;
        }

        .vajra-feedback-note {
          margin-top: 28px;
          color: rgba(240, 229, 214, 0.72);
          font-family: 'Manrope', sans-serif;
          font-size: 0.9rem;
          line-height: 1.75;
        }

        .vajra-feedback-note a {
          color: #ffffff;
          font-weight: 700;
          text-decoration: underline;
        }

        .vajra-feedback-required {
          margin-top: 10px;
          color: rgba(240, 229, 214, 0.78);
          font-family: 'Manrope', sans-serif;
          font-size: 0.95rem;
        }

        .vajra-feedback-submit-wrap {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          margin-top: 32px;
        }

        .vajra-feedback-submit {
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

        .vajra-feedback-submit:hover {
          transform: translateY(-1px);
          background: rgba(185, 185, 185, 0.88);
        }

        .vajra-feedback-cta-note {
          color: rgba(240, 229, 214, 0.66);
          font-family: 'Manrope', sans-serif;
          font-size: 0.9rem;
          line-height: 1.7;
        }

        .vajra-feedback-visual {
          position: relative;
          min-height: 100%;
          background:
            linear-gradient(180deg, rgba(20, 21, 40, 0.14), rgba(13, 14, 32, 0.32)),
            linear-gradient(90deg, rgba(7, 7, 23, 0.76) 0%, rgba(7, 7, 23, 0.14) 24%, rgba(7, 7, 23, 0.08) 100%);
        }

        .vajra-feedback-visual::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(3, 3, 18, 0.94) 0%, rgba(3, 3, 18, 0.28) 24%, rgba(3, 3, 18, 0.24) 100%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(3, 3, 18, 0.28)),
            radial-gradient(circle at 72% 34%, rgba(122, 135, 255, 0.16), transparent 28%);
          pointer-events: none;
        }

        .vajra-feedback-visual img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 62% center;
          filter: grayscale(1) contrast(1.08) brightness(0.42);
          display: block;
        }

        @media (max-width: 1100px) {
          .vajra-feedback-frame {
            grid-template-columns: 1fr;
          }

          .vajra-feedback-layout,
          .vajra-feedback-frame {
            min-height: auto;
          }

          .vajra-feedback-main {
            padding: 52px 34px 40px;
          }

          .vajra-feedback-copy {
            max-width: 100%;
          }

          .vajra-feedback-visual {
            min-height: 420px;
          }
        }

        @media (max-width: 820px) {
          .vajra-feedback-main {
            padding: 38px 20px 32px;
          }

          .vajra-feedback-form {
            grid-template-columns: 1fr;
            gap: 34px;
          }

          .vajra-feedback-copy {
            margin-bottom: 48px;
            max-width: 100%;
            font-size: clamp(1.8rem, 8vw, 2.4rem);
          }

          .vajra-feedback-back {
            padding: 24px 20px 0;
            font-size: 0.88rem;
            letter-spacing: 0.12em;
          }

          .vajra-feedback-panel-head {
            margin-bottom: 30px;
          }

          .vajra-feedback-visual {
            min-height: 320px;
          }
        }
      `}</style>

      <div className="vajra-feedback-page">
        <div className="vajra-feedback-shell">
          <a href="/contact-us" className="vajra-feedback-back">
            <ArrowLeft size={20} strokeWidth={2.2} />
            <span>Back</span>
          </a>

          <div className="vajra-feedback-stage">
            <div className="vajra-feedback-layout">
              <div className="vajra-feedback-frame">
                <div className="vajra-feedback-main">
                  <div className="vajra-feedback-panel-head">
                    <div className="vajra-feedback-eyebrow">
                      <MessageCircleMore size={34} strokeWidth={1.8} color="#5b97ff" />
                      <span>Website Feedback</span>
                    </div>
                  </div>

                  <p className="vajra-feedback-copy">
                    Let us know what you think of the The Vajra website experience. We welcome your
                    suggestions, comments, and opinions.
                  </p>

                  {submitted ? (
                    <div className="vajra-feedback-success" role="status" aria-live="polite">
                      <div>
                        <strong>Thanks for sharing your feedback.</strong>
                        <span>
                          Your mail draft is opening so you can review and send it. We appreciate
                          every suggestion that helps improve the experience.
                        </span>
                      </div>
                    </div>
                  ) : null}

                  <form className="vajra-feedback-form" onSubmit={handleSubmit}>
                    <label className={`vajra-feedback-field${errors.firstName ? ' is-error' : ''}`}>
                      <span className="vajra-feedback-label">First name*</span>
                      <input
                        className="vajra-feedback-input"
                        value={form.firstName}
                        onChange={(event) => updateField('firstName', event.target.value)}
                      />
                      {errors.firstName ? <span className="vajra-feedback-error">{errors.firstName}</span> : null}
                    </label>

                    <label className={`vajra-feedback-field${errors.lastName ? ' is-error' : ''}`}>
                      <span className="vajra-feedback-label">Last name*</span>
                      <input
                        className="vajra-feedback-input"
                        value={form.lastName}
                        onChange={(event) => updateField('lastName', event.target.value)}
                      />
                      {errors.lastName ? <span className="vajra-feedback-error">{errors.lastName}</span> : null}
                    </label>

                    <label className={`vajra-feedback-field-full${errors.email ? ' is-error' : ''}`}>
                      <span className="vajra-feedback-label">Email*</span>
                      <input
                        type="email"
                        className="vajra-feedback-input"
                        value={form.email}
                        onChange={(event) => updateField('email', event.target.value)}
                      />
                      {errors.email ? <span className="vajra-feedback-error">{errors.email}</span> : null}
                    </label>

                    <label className={`vajra-feedback-field-full${errors.feedback ? ' is-error' : ''}`}>
                      <span className="vajra-feedback-label">How can we help you?*</span>
                      <textarea
                        className="vajra-feedback-textarea"
                        maxLength={1500}
                        value={form.feedback}
                        onChange={(event) => updateField('feedback', event.target.value)}
                      />
                      <span className="vajra-feedback-meta">{form.feedback.length}/1500</span>
                      {errors.feedback ? <span className="vajra-feedback-error">{errors.feedback}</span> : null}
                    </label>

                    <div className="vajra-feedback-field-full">
                      <div className="vajra-feedback-checks">
                        <label className="vajra-feedback-check">
                          <input
                            type="checkbox"
                            checked={form.consent}
                            onChange={(event) => updateField('consent', event.target.checked)}
                          />
                          <span>
                            I consent to processing of my personal data entered above for the purpose
                            of recording the feedback. *
                          </span>
                        </label>
                      </div>
                      {errors.consent ? <span className="vajra-feedback-error">{errors.consent}</span> : null}
                    </div>

                    <div className="vajra-feedback-field-full">
                      <p className="vajra-feedback-note">
                        For further details on how your personal data will be processed and how your
                        consent can be managed, refer to the <a href="/privacy">The Vajra Privacy
                        Notice</a>.
                      </p>
                      <p className="vajra-feedback-required">*Mandatory fields</p>
                      <div className="vajra-feedback-submit-wrap">
                        <button type="submit" className="vajra-feedback-submit">
                          Send
                        </button>
                        <p className="vajra-feedback-cta-note">
                          Your suggestions help us improve the website experience.
                        </p>
                      </div>
                    </div>
                  </form>
                </div>

                <aside className="vajra-feedback-visual" aria-label="Website feedback visual">
                  <img src="/auth-right-side.png" alt="Website feedback visual" />
                </aside>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
