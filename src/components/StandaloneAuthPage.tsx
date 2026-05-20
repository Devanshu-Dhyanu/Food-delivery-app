import { useEffect, useState, type FormEvent } from 'react';

import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { applySeo } from '../lib/seo';
import FloatingContactTab from './FloatingContactTab';
import LandingFooter from './LandingFooter';
import TurnstileWidget from './TurnstileWidget';


type StandaloneAuthPageProps = {
  mode: 'signin' | 'signup';
};

const redirectTo = `${window.location.origin}/auth/callback`;
const rememberedEmailKey = 'vajra_remembered_email';

function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function StandaloneAuthPage({ mode }: StandaloneAuthPageProps) {
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? '';
  const captchaEnabled = turnstileSiteKey.length > 0;
  const googleBlockedByCaptcha = captchaEnabled && !captchaToken;
  const [email, setEmail] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaResetCount, setCaptchaResetCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    applySeo({
      title: mode === 'signin' ? 'Login | The Vajra' : 'Sign Up | The Vajra',
      description:
        mode === 'signin'
          ? 'Log in to The Vajra to continue with delivery, orders, and platform access.'
          : 'Create your The Vajra account to access delivery, platform services, and future updates.',
      canonical:
        mode === 'signin'
          ? 'https://www.vajracognixia.in/login'
          : 'https://www.vajracognixia.in/signup',
    });

    try {
      const rememberedEmail = window.localStorage.getItem(rememberedEmailKey);
      if (rememberedEmail) {
        setEmail(rememberedEmail);
      }
    } catch {
      // Ignore localStorage issues.
    }

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        window.location.href = '/';
      }
    });
  }, [mode]);

  const persistRememberedEmail = (nextEmail: string) => {
    try {
      if (nextEmail.trim()) {
        window.localStorage.setItem(rememberedEmailKey, nextEmail.trim());
      }
    } catch {
      // Ignore localStorage issues.
    }
  };




  const handleGoogleLogin = async () => {
    if (captchaEnabled && !captchaToken) {
      setMessage({ type: 'error', text: 'Please complete the captcha first.' });
      return;
    }

    setLoading(true);
    setMessage(null);
  
  
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        ...(captchaEnabled ? { captchaToken } : {}),
      },
    });
  
    if (error) {
      setMessage({ type: 'error', text: 'Google sign-in could not start. Please try again.' });
      if (captchaEnabled) {
        setCaptchaToken('');
        setCaptchaResetCount((current) => current + 1);
      }
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setMessage({ type: 'error', text: 'Enter your email first, then use forgot password.' });
      return;
    }

    if (captchaEnabled && !captchaToken) {
      setMessage({ type: 'error', text: 'Please complete the captcha first.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        emailRedirectTo: redirectTo,
        ...(captchaEnabled ? { captchaToken } : {}),
      },
    });

    if (error) {
      setMessage({ type: 'error', text: 'We could not send a magic link right now.' });
    } else {
      setMessage({
        type: 'success',
        text: 'Magic link sent. Use it to get back into your account.',
      });
    }

    if (captchaEnabled) {
      setCaptchaToken('');
      setCaptchaResetCount((current) => current + 1);
    }
    setLoading(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setMessage({ type: 'error', text: 'Please enter your email address.' });
      return;
    }

    if (captchaEnabled && !captchaToken) {
      setMessage({ type: 'error', text: 'Please complete the captcha first.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    persistRememberedEmail(trimmedEmail);

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        emailRedirectTo: redirectTo,
        ...(captchaEnabled ? { captchaToken } : {}),
      },
    });

    if (error) {
      setMessage({ type: 'error', text: 'We could not send the magic link right now.' });
      if (captchaEnabled) {
        setCaptchaToken('');
        setCaptchaResetCount((current) => current + 1);
      }
      setLoading(false);
      return;
    }

    setMessage({
      type: 'success',
      text:
        mode === 'signin'
          ? 'Magic link sent. Check your email to continue.'
          : 'Sign-up link sent. Check your email to continue.',
    });
    if (captchaEnabled) {
      setCaptchaToken('');
      setCaptchaResetCount((current) => current + 1);
    }
    setLoading(false);
  };

  const heading = mode === 'signin' ? 'WELCOME BACK' : 'CREATE ACCOUNT';
  const subheading =
    mode === 'signin'
      ? 'Welcome back! Continue with your details.'
      : 'Create your account and continue with The Vajra.';
  const buttonLabel = mode === 'signin' ? 'Continue with email' : 'Sign up with email';
  const altPrompt =
    mode === 'signin' ? "Don't have an account?" : 'Already have an account?';
  const altLinkHref = mode === 'signin' ? '/signup' : '/login';
  const altLinkLabel = mode === 'signin' ? 'Sign up for free!' : 'Sign in';

  return (
    <>
      <div className="relative flex min-h-screen flex-col overflow-hidden text-[#111111]">
        <img
          src="/auth-drone-bg.jpeg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,6,6,0.76)_0%,rgba(10,10,10,0.5)_34%,rgba(8,8,8,0.3)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_50%,rgba(255,255,255,0.05),transparent_24%),radial-gradient(circle_at_84%_28%,rgba(255,255,255,0.035),transparent_22%)]" />

        <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-5 sm:px-6 md:px-8 lg:px-10">
          <div className="mx-auto flex max-w-[1180px] items-center justify-between rounded-full border border-white/28 bg-[rgba(18,18,18,0.42)] px-5 py-3 text-white shadow-[0_18px_40px_rgba(0,0,0,0.32)] backdrop-blur-xl">
            <a href="/" className="inline-flex items-center gap-3 text-white">
              <span className="h-2.5 w-2.5 rotate-45 rounded-sm border border-white bg-white/35" />
              <span className="text-sm font-semibold tracking-[0.28em] uppercase">The Vajra</span>
            </a>

            <nav className="hidden items-center gap-6 text-sm font-medium text-white/90 md:flex">
              <a href="/" className="transition hover:text-white">
                Home
              </a>
              <a href="/founder" className="transition hover:text-white">
                Founder
              </a>
              <a href="/careers" className="transition hover:text-white">
                Careers
              </a>
              <a href="/support" className="transition hover:text-white">
                Support
              </a>
            </nav>

            <a
              href={mode === 'signin' ? '/signup' : '/login'}
              className="inline-flex items-center rounded-full border border-white/26 bg-white/16 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/22"
            >
              {mode === 'signin' ? 'Sign Up' : 'Login'}
            </a>
          </div>
        </header>

        <div className="relative z-10 flex flex-1 flex-col px-4 pb-6 pt-28 sm:px-6 md:px-8 lg:px-10 lg:pb-8 lg:pt-32">
          <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-[1280px] flex-1 items-center justify-center">
            <div className="grid min-h-[590px] w-full max-w-[1040px] overflow-hidden rounded-[30px] border border-white/14 bg-[rgba(255,255,255,0.94)] shadow-[0_30px_100px_rgba(0,0,0,0.42)] backdrop-blur-sm lg:grid-cols-[0.9fr_1.1fr]">
              <section className="flex items-center justify-center px-8 py-10 sm:px-12 lg:px-14">
                <div className="w-full max-w-[350px]">
                  <a
                    href="/"
                    className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-[#536071] transition hover:text-black"
                  >
                    <ArrowLeft size={16} />
                    Back to The Vajra
                  </a>

                  <h1 className="text-[38px] font-semibold tracking-[0.01em] text-[#111111] sm:text-[44px]">
                    {heading}
                  </h1>
                  <p className="mt-3 max-w-[320px] text-[15px] leading-7 text-[#6f7785]">{subheading}</p>

                  <form onSubmit={handleSubmit} className="mt-9">
                    <label className="mb-3 block text-[14px] font-semibold text-[#1f2530]">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Enter your email"
                      className="h-[52px] w-full rounded-[16px] border border-[#d7dce3] bg-white/92 px-5 text-[16px] text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] outline-none transition placeholder:text-[#a2a9b6] focus:border-[#f0444a] focus:ring-2 focus:ring-[#f0444a]/10"
                      autoComplete="email"
                      required
                    />

                    {message && (
                      <div
                        className={`mt-5 rounded-[14px] px-4 py-3 text-sm ${message.type === 'success'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-600'
                          }`}
                      >
                        {message.text}
                      </div>
                    )}

                    {mode === 'signin' && (
                      <div className="mt-5 flex items-center justify-between gap-4 text-[14px] text-[#1f2530]">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border border-[#cfcfcf]"
                          />
                          <span>Remember me</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => void handleForgotPassword()}
                          className="font-medium transition hover:text-[#f0444a]"
                        >
                          Forgot password
                        </button>
                      </div>
                    )}

                    {captchaEnabled && (
                      <div className="mt-5 overflow-hidden rounded-[16px] border border-[#d7dce3] bg-white px-3 py-3">
                        <TurnstileWidget
                          siteKey={turnstileSiteKey}
                          resetSignal={captchaResetCount}
                          onVerify={(token) => {
                            setCaptchaToken(token);
                            setMessage(null);
                          }}
                          onExpire={() => setCaptchaToken('')}
                          onError={() => {
                            setCaptchaToken('');
                            setMessage({
                              type: 'error',
                              text: 'Captcha could not be loaded. Please refresh and try again.',
                            });
                          }}
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-6 h-[52px] w-full rounded-[16px] bg-[#f0444a] text-[16px] font-semibold text-white shadow-[0_16px_30px_rgba(240,68,74,0.28)] transition hover:bg-[#e53b42] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : buttonLabel}
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleGoogleLogin()}
                      disabled={loading || googleBlockedByCaptcha}
                      className={`mt-4 flex h-[52px] w-full items-center justify-center gap-3 rounded-[16px] border border-[#d7dce3] bg-white text-[16px] font-medium text-[#111111] shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-70 ${googleBlockedByCaptcha ? 'opacity-60 shadow-none' : ''}`}
                    >
                      <GoogleIcon />
                      <span>{mode === 'signin' ? 'Sign in with Google' : 'Continue with Google'}</span>
                    </button>

                    {googleBlockedByCaptcha ? (
                      <p className="mt-3 text-xs font-medium text-[#7a5f3f]">
                        Complete the captcha first to continue with Google.
                      </p>
                    ) : null}
                  </form>

                  <p className="mt-5 text-center text-[14px] text-[#69707d]">
                    {altPrompt}{' '}
                    <a href={altLinkHref} className="font-medium text-[#f0444a] hover:underline">
                      {altLinkLabel}
                    </a>
                  </p>
                </div>
              </section>

              <section className="relative hidden overflow-hidden bg-[#ececec] lg:block">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))]" />
                <img
                  src="/auth-right-side.png"
                  alt="The Vajra authentication illustration"
                  className="relative h-full w-full object-contain object-center p-8"
                />
              </section>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-auto">
          <LandingFooter />
        </div>
      </div>
      <FloatingContactTab />
    </>
  );
}
