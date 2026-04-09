import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const COMPANY_NAME = 'The VajraCognixia Technologies Private Limited';
const BRAND_NAME = 'The Vajra';
const PRODUCT_NAME = 'The Vajra Campus Delivery';
const HOME_TITLE = `${PRODUCT_NAME} | ${COMPANY_NAME}`;

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function Login() {
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const redirectTo = `${window.location.origin}/auth/callback`;

  useEffect(() => {
    document.title = HOME_TITLE;
  }, []);

  const openModal = (m: 'signup' | 'signin') => {
    setMode(m);
    setModalOpen(true);
    setMessage('');
    setEmail('');
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) {
      setMessage('Something went wrong. Try again.');
    } else {
      setMessage('Success: Magic link sent. Check your email.');
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #fff; }
        button { cursor: pointer; }

        @media (max-width: 720px) {
          .login-navbar {
            padding: 14px 16px !important;
          }

          .login-logo {
            gap: 10px !important;
          }

          .login-logo-icon {
            width: 40px !important;
            height: 40px !important;
            border-radius: 14px !important;
          }

          .login-logo-title {
            font-size: 20px !important;
          }

          .login-logo-accent {
            font-size: 10px !important;
            letter-spacing: 0.08em !important;
          }

          .login-nav-right {
            gap: 10px !important;
          }

          .login-nav-btn-mobile-hide {
            display: none !important;
          }

          .login-hero {
            justify-content: flex-start !important;
            padding: 48px 18px 56px !important;
          }

          .login-hero-title {
            font-size: 42px !important;
            line-height: 1.04 !important;
            letter-spacing: -1px !important;
            margin-bottom: 14px !important;
          }

          .login-hero-sub {
            max-width: 100% !important;
            font-size: 15px !important;
            line-height: 1.7 !important;
            margin-bottom: 12px !important;
          }

          .login-company-line {
            margin-bottom: 24px !important;
          }

          .login-pill-row {
            gap: 8px !important;
            margin-bottom: 28px !important;
            max-width: 100% !important;
            padding: 0 4px !important;
          }

          .login-pill {
            padding: 7px 12px !important;
            font-size: 12px !important;
          }

          .login-cta-btn {
            width: 100% !important;
            max-width: 280px !important;
            justify-content: center !important;
            margin-bottom: 14px !important;
          }

          .login-secondary-link-row {
            margin-top: 2px !important;
          }

          .login-secondary-link {
            font-size: 13px !important;
            color: #9a6844 !important;
          }

          .login-footer-bar {
            padding: 16px 18px !important;
            align-items: flex-start !important;
            justify-content: flex-start !important;
            gap: 10px !important;
          }

          .login-footer-links {
            flex-wrap: wrap !important;
            gap: 10px !important;
          }

          .login-modal {
            width: calc(100% - 24px) !important;
            max-width: 440px !important;
            border-radius: 18px !important;
            padding: 38px 20px 26px !important;
          }

          .login-modal-title {
            font-size: 24px !important;
            margin-bottom: 22px !important;
          }

          .login-social-btn,
          .login-email-input,
          .login-submit-btn {
            min-height: 48px !important;
          }

          .login-modal-footer {
            padding: 0 16px !important;
          }
        }

        @media (max-width: 420px) {
          .login-navbar {
            padding: 12px 14px !important;
          }

          .login-logo-title {
            font-size: 18px !important;
          }

          .login-hero {
            padding: 42px 16px 48px !important;
          }

          .login-hero-title {
            font-size: 35px !important;
          }

          .login-pill-row {
            gap: 7px !important;
          }

          .login-cta-btn {
            max-width: 100% !important;
          }

          .login-modal {
            width: calc(100% - 18px) !important;
            padding: 34px 16px 22px !important;
          }

          .login-modal-footer {
            padding: 0 8px !important;
          }
        }
      `}</style>

      <div style={styles.page}>
        {/* NAVBAR */}
        <nav className="login-navbar" style={styles.navbar}>
          <div className="login-logo" style={styles.logo}>
            <img
              src="/the-vajra-mark.svg"
              alt="The Vajra Campus Delivery logo"
              className="login-logo-icon"
              style={styles.logoIcon}
            />
            <div style={styles.logoTextGroup}>
              <span className="login-logo-title" style={styles.logoTitle}>{BRAND_NAME}</span>
              <span className="login-logo-accent" style={styles.logoAccent}>Campus delivery</span>
            </div>
          </div>
          <div className="login-nav-right" style={styles.navRight}>
            <button style={styles.navLink} onClick={() => openModal('signin')}>Sign in</button>
            <button className="login-nav-btn-mobile-hide" style={styles.navBtn} onClick={() => openModal('signup')}>Get started</button>
          </div>
        </nav>

        {/* HERO */}
        <section className="login-hero" style={styles.hero}>
          <p style={styles.heroTag}>Campus ordering platform for LPU</p>
          <h1 className="login-hero-title" style={styles.heroTitle}>{PRODUCT_NAME}</h1>
          <p className="login-hero-sub" style={styles.heroSub}>
            Order food, discover campus offers, and access student services in one place with
            The Vajra.
          </p>
          <p className="login-company-line" style={styles.companyLine}>Operated by {COMPANY_NAME}</p>
          <div className="login-pill-row" style={styles.pillRow}>
            {['Food delivery', 'Campus offers', 'Student marketplace', 'Fast ordering', 'Campus services'].map((p) => (
              <span key={p} className="login-pill" style={styles.pill}>{p}</span>
            ))}
          </div>
          <button className="login-cta-btn" style={styles.ctaBtn} onClick={() => openModal('signup')}>{'Start now ->'}</button>
          <p style={styles.signInHint}>
            Already have an account?{' '}
            <button style={styles.hintLink} onClick={() => openModal('signin')}>Sign in</button>
          </p>
          <p className="login-secondary-link-row" style={styles.secondaryLinkRow}>
            <a href="/founder" className="login-secondary-link" style={styles.secondaryLink}>Read founder story</a>
          </p>
        </section>
      </div>

      <footer style={styles.siteFooter}>
        <div className="login-footer-bar" style={styles.footerBar}>
          <p style={styles.footerCopy}>(c) {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.</p>
          <div className="login-footer-links" style={styles.footerLinks}>
            <a href="/privacy" style={styles.footerBarLink}>Privacy Policy</a>
            <span style={{ color: '#555' }}>|</span>
            <a href="/terms" style={styles.footerBarLink}>Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* MODAL */}
      {modalOpen && (
        <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="login-modal" style={styles.modal}>
            <button style={styles.closeBtn} onClick={() => setModalOpen(false)}>x</button>
            <h2 className="login-modal-title" style={styles.modalTitle}>
              {mode === 'signup' ? `Join ${BRAND_NAME}.` : 'Welcome back.'}
            </h2>

            <button className="login-social-btn" style={styles.socialBtn} onClick={handleGoogleLogin}>
              <GoogleIcon />
              Continue with Google
            </button>

            <div style={styles.divider}>
              <span style={styles.dividerLine} />
              <span style={styles.dividerText}>or</span>
              <span style={styles.dividerLine} />
            </div>

            <form onSubmit={handleEmailSubmit}>
              <input
                className="login-email-input"
                style={styles.emailInput}
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button className="login-submit-btn" style={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? 'Sending...' : mode === 'signup' ? 'Continue with email' : 'Sign in with email'}
              </button>
            </form>

            {message && (
              <p style={{ textAlign: 'center', fontSize: 13, color: message.startsWith('Success:') ? '#2a7a4f' : '#c0392b', marginBottom: 12 }}>
                {message}
              </p>
            )}

            <p className="login-modal-footer" style={styles.modalFooter}>
              By continuing, you agree to our <a href="/terms" style={styles.modalFooterLink}>Terms</a> and <a href="/privacy" style={styles.modalFooterLink}>Privacy Policy</a>.
            </p>

            <div style={styles.switchRow}>
              {mode === 'signup' ? (
                <>Already have an account? <button style={styles.switchBtn} onClick={() => setMode('signin')}>Sign in</button></>
              ) : (
                <>No account yet? <button style={styles.switchBtn} onClick={() => setMode('signup')}>Create one</button></>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', background: '#fff' },
  navbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px', borderBottom: '1px solid #e8e8e8' },
  logo: { display: 'flex', alignItems: 'center', gap: 12 },
  logoIcon: { width: 44, height: 44, borderRadius: 16, display: 'block', boxShadow: '0 18px 36px rgba(15, 19, 26, 0.2)' },
  logoTextGroup: { display: 'flex', flexDirection: 'column', gap: 2 },
  logoTitle: { fontFamily: "'Source Serif 4', serif", fontSize: 24, fontWeight: 600, color: '#1a1a1a', lineHeight: 1 },
  logoAccent: { color: '#C0572A', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' },
  navRight: { display: 'flex', alignItems: 'center', gap: 16 },
  navLink: { fontSize: 14, color: '#555', background: 'none', border: 'none', fontFamily: 'inherit', padding: '8px 4px' },
  navBtn: { padding: '9px 22px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 40, fontSize: 14, fontFamily: 'inherit' },
  hero: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 20px' },
  heroTag: { fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999', marginBottom: 20 },
  heroTitle: { fontFamily: "'Source Serif 4', serif", fontSize: 58, fontWeight: 600, lineHeight: 1.08, letterSpacing: '-1.5px', maxWidth: 620, marginBottom: 18, color: '#1a1a1a' },
  heroSub: { fontSize: 16, color: '#666', lineHeight: 1.65, maxWidth: 520, marginBottom: 14 },
  companyLine: { fontSize: 13, color: '#8a5d3b', lineHeight: 1.6, marginBottom: 32, fontWeight: 600, letterSpacing: '0.02em' },
  pillRow: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 40 },
  pill: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 20, padding: '7px 16px', fontSize: 13, color: '#333' },
  ctaBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 30px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 40, fontSize: 16, fontFamily: 'inherit', marginBottom: 16 },
  signInHint: { fontSize: 14, color: '#777' },
  hintLink: { color: '#1a1a1a', textDecoration: 'underline', background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 14, padding: 0 },
  secondaryLinkRow: { fontSize: 14, color: '#777' },
  secondaryLink: { color: '#8a5d3b', textDecoration: 'none', fontWeight: 600 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.48)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  modal: { background: '#fff', width: '100%', maxWidth: 440, borderRadius: 6, padding: '48px 40px 36px', position: 'relative' },
  closeBtn: { position: 'absolute', top: 14, right: 18, fontSize: 24, color: '#aaa', background: 'none', border: 'none', lineHeight: 1 },
  modalTitle: { fontFamily: "'Source Serif 4', serif", fontSize: 28, fontWeight: 600, textAlign: 'center', marginBottom: 28, color: '#1a1a1a' },
  socialBtn: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '13px 20px', border: '1px solid #ddd', borderRadius: 40, background: '#fff', fontSize: 15, fontFamily: 'inherit', color: '#1a1a1a', marginBottom: 12 },
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' },
  dividerLine: { flex: 1, height: 1, background: '#ececec' },
  dividerText: { fontSize: 13, color: '#bbb' },
  emailInput: { width: '100%', padding: '13px 18px', border: '1px solid #ddd', borderRadius: 40, fontSize: 15, fontFamily: 'inherit', outline: 'none', marginBottom: 10, display: 'block', background: '#f9f9f9', color: '#1a1a1a' },
  submitBtn: { width: '100%', padding: 13, background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 40, fontSize: 15, fontFamily: 'inherit', marginBottom: 16 },
  modalFooter: { fontSize: 12, color: '#aaa', textAlign: 'center', lineHeight: 1.7, marginBottom: 12, padding: '0 80px' },
  modalFooterLink: { color: '#555', textDecoration: 'underline' },
  switchRow: { textAlign: 'center', marginTop: 20, paddingTop: 18, borderTop: '1px solid #ececec', fontSize: 14, color: '#666' },
  switchBtn: { color: '#1a1a1a', fontWeight: 500, background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 14, textDecoration: 'underline', padding: 0 },
  siteFooter: { width: '100%', padding: 0 },
  footerBar: { background: '#0a0a0a', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  footerCopy: { fontSize: 13, color: '#666', margin: 0 },
  footerLinks: { display: 'flex', alignItems: 'center', gap: 12 },
  footerBarLink: { fontSize: 13, color: '#666', textDecoration: 'none' },
};
