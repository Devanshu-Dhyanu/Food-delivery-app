import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ArrowUpRight,
  Briefcase,
  Check,
  Mail,
  Menu,
  MapPin,
  Package,
  X,
  Zap,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { applyDefaultSeo } from '../lib/seo';
import FloatingContactTab from './FloatingContactTab';
import LandingFooter from './LandingFooter';
import TurnstileWidget from './TurnstileWidget';

// Support and company constants are defined in shared footer components.
const LAUNCH_DATE_ISO = '2026-08-15T10:00:00+05:30';
const LAUNCH_DATE_LABEL = '15 August 2026, 10:00 AM IST';

const getLaunchCountdown = () => {
  const remainingMs = new Date(LAUNCH_DATE_ISO).getTime() - Date.now();

  if (remainingMs <= 0) {
    return {
      days: '00',
      hours: '00',
      minutes: '00',
      seconds: '00',
      isLive: true,
    };
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
    isLive: false,
  };
};

const navLinks = [
  { label: 'What We Do', href: '/what-we-do' },
  { label: 'Delivery Model', href: '#specifications' },
  { label: 'Contact', href: '/contact-us' },
  { label: 'Founder', href: '/founder' },
  { label: 'Careers', href: '/careers' },
] as const;

const benefits = [
  {
    title: 'Online Food Delivery',
    body: 'Order food online with a smooth delivery experience built for speed, convenience, and real-time access. The Vajra helps users discover meals, place orders quickly, and enjoy a smarter way to get food delivered.',
    icon: Zap,
  },
  {
    title: 'Buy and Sell Marketplace',
    body: 'Buy and sell products easily through a trusted online marketplace designed for everyday needs. The Vajra helps people list items, discover local deals, and connect buyers and sellers in one simple platform.',
    icon: MapPin,
  },
  {
    title: 'Everyday Services Platform',
    body: 'Access everyday services from one connected platform designed for convenience and future-ready delivery. The Vajra brings together transport, support, and smart service access in a way that saves time and improves daily life.',
    icon: Package,
  },
] as const;

const insightSteps = [
  'Orders move into one digital flow from confirmation to dispatch.',
  'Pickup, routing, and drone-ready coordination are designed for faster movement.',
  'Live tracking keeps customers and operators aligned through the full journey.',
  'The Vajra is being shaped as a long-term logistics layer for local commerce.',
] as const;

const roadmapSteps = [
  {
    number: '01',
    title: 'Order Confirmed',
    body: 'The request is received, verified, and prepared for rapid fulfilment.',
  },
  {
    number: '02',
    title: 'Dispatch Coordinated',
    body: 'Pickup, routing, and drone-led delivery planning are aligned in one operating flow.',
  },
  {
    number: '03',
    title: 'Drop-Off Completed',
    body: 'Customers get a clearer and faster delivery experience from source to destination.',
  },
] as const;

const comparisonColumns = [
  {
    title: 'The Vajra',
    highlighted: true,
    rows: [
      'Drone-first logistics roadmap',
      'Live status from order to handoff',
      'Rapid short-range dispatch design',
      'Hardware-aware routing foundation',
      'Built for food, parcels, and essentials',
      'Designed for phased real-world rollout',
    ],
  },
  {
    title: 'Traditional Delivery',
    highlighted: false,
    rows: [
      'Traffic-bound last-mile movement',
      'Limited customer visibility after pickup',
      'Peak-hour delays affect dispatch speed',
      'Road-only fulfilment model',
      'Timing varies heavily by location and rider load',
      'Scale often depends on larger rider fleets',
    ],
  },
  {
    title: 'Legacy Platforms',
    highlighted: false,
    rows: [
      'App-first but not drone-native',
      'Generic tracking and fulfilment flows',
      'Conventional courier logic at the core',
      'Lower flexibility for hardware integration',
      'Less control over delivery innovation',
      'Harder to stand out on speed and operations',
    ],
  },
] as const;

const deliverySignals = [
  'Drone Dispatch',
  'Smart Routing',
  'Live Tracking',
  'Safer Handoffs',
  'Local Commerce',
  'Future Logistics',
] as const;

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }} aria-hidden="true">
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

import AiOrbitAnimation from './AiOrbitAnimation';

  export default function Login() {
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? '';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [floatingNavVisible, setFloatingNavVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaResetCount, setCaptchaResetCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [storeNotice, setStoreNotice] = useState('');
  const [appPromoVisible, setAppPromoVisible] = useState(false);
  const [benefitsAudioEnabled, setBenefitsAudioEnabled] = useState(false);
  const [launchCountdown, setLaunchCountdown] = useState(getLaunchCountdown);
  const appPromoRef = useRef<HTMLElement | null>(null);
  const benefitsVideoRef = useRef<HTMLVideoElement | null>(null);
  const benefitsVideoStageRef = useRef<HTMLDivElement | null>(null);
  const storeNoticeTimerRef = useRef<number | null>(null);
  const captchaEnabled = turnstileSiteKey.length > 0;
  const googleBlockedByCaptcha = captchaEnabled && !captchaToken;
  const redirectTo = `${window.location.origin}/auth/callback`;

  useEffect(() => {
    applyDefaultSeo();
  }, []);

  useEffect(() => {
    return () => {
      if (storeNoticeTimerRef.current) {
        window.clearTimeout(storeNoticeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const syncCountdown = () => {
      setLaunchCountdown(getLaunchCountdown());
    };

    syncCountdown();
    const timer = window.setInterval(syncCountdown, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const section = appPromoRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setAppPromoVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '0px 0px -18% 0px',
        threshold: 0.18,
      }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const syncFloatingNav = () => {
      const nextVisible = window.scrollY > 120;
      setFloatingNavVisible((current) => (current === nextVisible ? current : nextVisible));
    };

    syncFloatingNav();
    window.addEventListener('scroll', syncFloatingNav, { passive: true });

    return () => {
      window.removeEventListener('scroll', syncFloatingNav);
    };
  }, []);

  useEffect(() => {
    const video = benefitsVideoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.volume = 0;

    void video.play().catch(() => {
      // Browser autoplay policies may still pause playback until the user interacts.
    });
  }, []);

  useEffect(() => {
    const stage = benefitsVideoStageRef.current;
    const video = benefitsVideoRef.current;
    if (!stage || !video) return;

    const muteBenefitsVideo = () => {
      video.muted = true;
      video.volume = 0;
      setBenefitsAudioEnabled(false);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || entry.intersectionRatio < 0.55) {
          muteBenefitsVideo();
        }
      },
      {
        threshold: [0, 0.3, 0.55, 0.8],
      }
    );

    const handlePageHide = () => {
      if (document.visibilityState !== 'visible') {
        muteBenefitsVideo();
      }
    };

    observer.observe(stage);
    document.addEventListener('visibilitychange', handlePageHide);
    window.addEventListener('blur', handlePageHide);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handlePageHide);
      window.removeEventListener('blur', handlePageHide);
    };
  }, []);

  const openModal = (nextMode: 'signup' | 'signin') => {
    setMode(nextMode);
    setModalOpen(true);
    setMobileMenuOpen(false);
    setMessage('');
    setEmail('');
    setCaptchaToken('');
    setCaptchaResetCount((current) => current + 1);
    setLoading(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCaptchaToken('');
    setCaptchaResetCount((current) => current + 1);
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    if (captchaEnabled && !captchaToken) {
      setMessage('Please complete the captcha first.');
      return;
    }

    setLoading(true);
    setMessage('');
  
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        ...(captchaEnabled ? { captchaToken } : {}),
      },
    });
  
    if (error) {
      setMessage('Something went wrong. Try again.');
      if (captchaEnabled) {
        setCaptchaToken('');
        setCaptchaResetCount((current) => current + 1);
      }
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setMessage('Please enter your email first.');
      return;
    }

    if (captchaEnabled && !captchaToken) {
      setMessage('Please complete the captcha first.');
      return;
    }

    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        emailRedirectTo: redirectTo,
        ...(captchaEnabled ? { captchaToken } : {}),
      },
    });

    if (error) {
      setMessage('Something went wrong. Try again.');
    } else {
      setMessage('Success: Magic link sent. Check your email.');
    }

    if (captchaEnabled) {
      setCaptchaToken('');
      setCaptchaResetCount((current) => current + 1);
    }
    setLoading(false);
  };

  const handleBenefitsAudioToggle = async () => {
    const video = benefitsVideoRef.current;
    if (!video) return;

    const nextAudioEnabled = !benefitsAudioEnabled;
    setBenefitsAudioEnabled(nextAudioEnabled);
    video.muted = !nextAudioEnabled;
    video.volume = nextAudioEnabled ? 0.9 : 0;

    if (nextAudioEnabled) {
      try {
        await video.play();
      } catch {
        video.muted = true;
        video.volume = 0;
        setBenefitsAudioEnabled(false);
      }
    }
  };

  const showStoreComingSoon = (storeName: string) => {
    setStoreNotice(`${storeName} is coming soon.`);

    if (storeNoticeTimerRef.current) {
      window.clearTimeout(storeNoticeTimerRef.current);
    }

    storeNoticeTimerRef.current = window.setTimeout(() => {
      setStoreNotice('');
      storeNoticeTimerRef.current = null;
    }, 2600);
  };

  const countdownUnits = [
    { label: 'Days', value: launchCountdown.days },
    { label: 'Hours', value: launchCountdown.hours },
    { label: 'Minutes', value: launchCountdown.minutes },
    { label: 'Seconds', value: launchCountdown.seconds },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&family=Prata&display=swap');

        :root {
          --area-bg: #f8f6f0;
          --area-surface: #fffdf8;
          --area-text: #111111;
          --area-muted: #7f7f7a;
          --area-line: #e8e3d7;
          --area-accent: #5f7616;
          --area-accent-soft: #dce9b6;
          --area-card-shadow: 0 20px 44px rgba(17, 17, 17, 0.06);
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          font-family: 'Inter', sans-serif;
          background: var(--area-bg);
          color: var(--area-text);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        button {
          cursor: pointer;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .area-page {
          min-height: 100vh;
          background: var(--area-bg);
        }

        .area-shell {
          width: min(1376px, calc(100% - 64px));
          margin: 0 auto;
        }

        .area-page main[id],
        .area-page section[id] {
          scroll-margin-top: 116px;
        }

        .area-divider {
          height: 1px;
          width: 100%;
          background: var(--area-line);
        }

        .area-section-label {
          color: #758449;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.18em;
        }

        .area-title {
          font-family: 'Instrument Serif', serif;
          font-weight: 400;
          letter-spacing: -0.05em;
          color: var(--area-text);
        }

        .area-copy {
          color: var(--area-muted);
          font-size: 16px;
          line-height: 1.7;
        }

        .area-button {
          border: none;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 52px;
          padding: 0 26px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 700;
          transition: transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
        }

        .area-button:hover {
          transform: translateY(-1px);
        }

        .area-button:disabled {
          cursor: not-allowed;
          opacity: 0.7;
          transform: none;
        }

        .area-button-primary {
          background: var(--area-accent);
          color: #fefef7;
          box-shadow: 0 14px 30px rgba(95, 118, 22, 0.18);
        }

        .area-button-soft {
          background: var(--area-accent-soft);
          color: #1c1c16;
        }

        .area-nav {
          padding: 18px 0 26px;
        }

        .area-nav-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .area-brand {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          color: var(--area-text);
          white-space: nowrap;
        }

        .area-brand::before {
          content: '';
          width: 11px;
          height: 11px;
          border: 1.5px solid rgba(95, 118, 22, 0.92);
          border-radius: 2px;
          transform: rotate(45deg);
          box-shadow: 0 0 0 5px rgba(95, 118, 22, 0.08);
        }

        .area-brand-wordmark {
          display: inline-flex;
          flex-direction: column;
          gap: 3px;
          line-height: 1;
        }

        .area-brand-wordmark-prefix {
          margin-left: 0.3rem;
          color: #758449;
          font-size: 0.52rem;
          font-weight: 700;
          letter-spacing: 0.42em;
          text-transform: uppercase;
        }

        .area-brand-wordmark-main {
          font-family: 'Prata', serif;
          font-size: 1.62rem;
          font-weight: 400;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .area-nav-links {
          display: flex;
          align-items: center;
          gap: 36px;
        }

        .area-nav-links a {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .area-floating-nav {
          position: fixed;
          top: 14px;
          left: 50%;
          z-index: 40;
          width: max-content;
          max-width: calc(100vw - 32px);
          opacity: 0;
          pointer-events: none;
          transform: translate(-50%, -16px);
          transition: opacity 180ms ease, transform 180ms ease;
        }

        .area-floating-nav.is-visible {
          opacity: 1;
          pointer-events: auto;
          transform: translate(-50%, 0);
        }

        .area-floating-nav-links {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: max-content;
          max-width: 100%;
          padding: 10px 12px;
          border: 1px solid rgba(255, 255, 255, 0.28);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          box-shadow: 0 18px 40px rgba(17, 17, 17, 0.12);
          backdrop-filter: blur(18px) saturate(135%);
          -webkit-backdrop-filter: blur(18px) saturate(135%);
          white-space: nowrap;
        }

        .area-floating-nav-links a {
          padding: 10px 16px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: -0.02em;
          transition: background-color 180ms ease, color 180ms ease;
        }

        .area-floating-nav-links a:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .area-nav-cta {
          min-width: 142px;
        }

        .area-nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .area-job-cta {
          min-width: 148px;
          border: 1px solid rgba(17, 17, 17, 0.1);
          background: rgba(255, 255, 255, 0.88);
          color: var(--area-text);
          box-shadow: 0 12px 28px rgba(17, 17, 17, 0.06);
        }

        .area-support-cta {
          min-width: 148px;
          border: 1px solid rgba(95, 118, 22, 0.18);
          background: rgba(220, 233, 182, 0.68);
          color: #243004;
          box-shadow: 0 12px 28px rgba(95, 118, 22, 0.12);
        }

        .area-nav-menu-toggle {
          display: none;
          align-items: center;
          justify-content: center;
          width: 46px;
          height: 46px;
          border: 1px solid rgba(17, 17, 17, 0.08);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.94);
          color: var(--area-text);
          box-shadow: 0 10px 30px rgba(17, 17, 17, 0.05);
        }

        .area-mobile-menu {
          display: none;
          margin-top: 14px;
          padding: 18px;
          border: 1px solid rgba(17, 17, 17, 0.08);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 20px 40px rgba(17, 17, 17, 0.05);
        }

        .area-mobile-menu nav {
          display: grid;
          gap: 10px;
          margin-bottom: 14px;
        }

        .area-mobile-menu nav a {
          font-size: 14px;
          font-weight: 600;
          padding: 10px 6px;
        }

        .area-mobile-menu .area-button {
          width: 100%;
          margin-top: 10px;
        }

        .area-hero {
          padding-bottom: 30px;
          text-align: center;
        }

        .area-hero-title {
          width: max-content;
          max-width: 100%;
          margin: 38px auto 40px;
          font-size: clamp(5.1rem, 8.55vw, 8.15rem);
          line-height: 0.84;
          letter-spacing: -0.075em;
          white-space: nowrap;
        }

        .area-launch-card {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) auto;
          align-items: center;
          gap: 18px;
          width: min(880px, calc(100% - 20px));
          margin: 0 auto 30px;
          padding: 18px 20px;
          border: 1px solid rgba(255, 255, 255, 0.38);
          border-radius: 26px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.08));
          box-shadow: 0 18px 40px rgba(17, 17, 17, 0.08);
          backdrop-filter: blur(24px) saturate(135%);
          -webkit-backdrop-filter: blur(24px) saturate(135%);
        }

        .area-launch-copy {
          text-align: left;
        }

        .area-launch-kicker {
          margin-bottom: 8px;
          color: #758449;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }

        .area-launch-text {
          color: #202019;
          font-size: 15px;
          line-height: 1.65;
        }

        .area-launch-text strong {
          font-weight: 700;
        }

        .area-launch-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(78px, 92px));
          gap: 10px;
        }

        .area-launch-unit {
          padding: 12px 10px 11px;
          border: 1px solid rgba(255, 255, 255, 0.28);
          border-radius: 20px;
          background: rgba(16, 22, 46, 0.16);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
          text-align: center;
        }

        .area-launch-value {
          display: block;
          color: #111111;
          font-size: clamp(1.8rem, 2.4vw, 2.35rem);
          font-weight: 700;
          line-height: 1;
          font-variant-numeric: tabular-nums;
        }

        .area-launch-label {
          display: block;
          margin-top: 7px;
          color: #5f6f3d;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .area-launch-live {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 54px;
          padding: 0 18px;
          border: 1px solid rgba(95, 118, 22, 0.24);
          border-radius: 999px;
          background: rgba(95, 118, 22, 0.12);
          color: #243008;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .area-hero-visual-wrap {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          width: 100%;
          padding-top: 12px;
          overflow: hidden;
        }

        .area-hero-visual-wrap::before {
          display: none;
        }

        .area-hero-visual {
          position: relative;
          z-index: 1;
          display: block;
          max-width: 100%;
          height: auto;
          border: 1px solid rgba(17, 17, 17, 0.08);
          border-radius: 32px;
          box-shadow: 0 28px 60px rgba(17, 17, 17, 0.14);
          transform: scale(1);
          transform-origin: center center;
          transition: transform 240ms ease, box-shadow 240ms ease;
          will-change: transform;
        }

        .area-hero-desktop-visual {
          width: min(1300px, 100%);
        }

        .area-hero-mobile-visual {
          display: none;
          width: min(500px, 96vw);
        }

        @media (hover: hover) and (pointer: fine) {
          .area-hero-visual-wrap {
            cursor: zoom-in;
          }

          .area-hero-visual-wrap:hover .area-hero-visual,
          .area-hero-visual-wrap:focus-within .area-hero-visual {
            transform: scale(1.035);
            box-shadow: 0 34px 76px rgba(17, 17, 17, 0.18);
          }
        }

        .area-trusted {
          padding: 22px 0 56px;
        }

        .area-trusted-label {
          margin-bottom: 10px;
          color: var(--area-muted);
          font-size: 18px;
        }

        .area-trusted-note {
          max-width: 720px;
          margin: 0 auto 34px;
          color: #8a8a84;
          font-size: 15px;
          line-height: 1.7;
        }

        .area-logos {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          align-items: center;
          gap: 28px;
          color: #a9a9a6;
        }

        .area-logo-item {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.03em;
        }

        .area-logo-symbol {
          width: auto;
          height: 34px;
        }

        .area-benefits {
          padding: 56px 0 76px;
        }

        .area-app-promo {
          position: relative;
          overflow: hidden;
          min-height: clamp(340px, 40vh, 430px);
          margin: 42px 0 0;
          margin-right: calc(50% - 50vw);
          margin-left: calc(50% - 50vw);
          border-radius: 0;
          background:
            linear-gradient(90deg, rgba(0, 0, 0, 0.94) 0%, rgba(0, 0, 0, 0.78) 37%, rgba(0, 0, 0, 0.32) 100%),
            url('/area/dornepath.png?v=2') center / cover no-repeat;
          color: #ffffff;
          isolation: isolate;
          opacity: 0;
          transform: translateX(120px);
          transition:
            opacity 760ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 900ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: opacity, transform;
        }

        .area-app-promo.is-visible {
          opacity: 1;
          transform: translateX(0);
        }

        .area-app-promo::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 72% 25%, rgba(255, 255, 255, 0.16), transparent 22%),
            linear-gradient(180deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.52));
          pointer-events: none;
          z-index: -1;
        }

        .area-app-promo-inner {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 0.92fr) minmax(420px, 1.08fr);
          align-items: center;
          min-height: inherit;
          gap: clamp(28px, 5vw, 74px);
          padding: clamp(34px, 4vw, 46px) 0;
        }

        .area-app-promo-copy {
          max-width: 680px;
          padding-left: clamp(0px, 1vw, 10px);
          opacity: 0;
          transform: translateX(42px);
          transition:
            opacity 620ms ease 220ms,
            transform 760ms cubic-bezier(0.22, 1, 0.36, 1) 220ms;
        }

        .area-app-promo.is-visible .area-app-promo-copy {
          opacity: 1;
          transform: translateX(0);
        }

        .area-app-promo-kicker {
          margin-bottom: 22px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.9);
        }

        .area-app-promo-title {
          max-width: 620px;
          font-family: 'Inter', sans-serif;
          font-size: clamp(2rem, 3.2vw, 3.5rem);
          font-weight: 800;
          line-height: 1.15;
          color: #f7f7f3;
          text-wrap: balance;
        }

        .area-app-store-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 18px 24px;
          margin-top: 28px;
        }

        .area-store-button {
          min-width: 198px;
          height: 60px;
          display: inline-flex;
          align-items: center;
          gap: 14px;
          padding: 0 18px;
          border: 1px solid rgba(255, 255, 255, 0.82);
          border-radius: 9px;
          background: rgba(10, 10, 10, 0.72);
          color: #ffffff;
          font-family: inherit;
          text-align: left;
          box-shadow: 0 18px 46px rgba(0, 0, 0, 0.24);
          transition: transform 180ms ease, background-color 180ms ease, border-color 180ms ease;
        }

        .area-store-button:hover {
          transform: translateY(-2px);
          border-color: #ffffff;
          background: rgba(18, 18, 18, 0.9);
        }

        .area-store-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 36px;
          width: 36px;
          height: 36px;
          color: #ffffff;
        }

        .area-store-icon svg {
          width: 100%;
          height: 100%;
        }

        .area-store-icon.is-vajra {
          border: 1px solid rgba(255, 255, 255, 0.72);
          border-radius: 50%;
          background: radial-gradient(circle at 42% 35%, rgba(255, 255, 255, 0.22), rgba(95, 118, 22, 0.72));
          font-family: 'Prata', serif;
          font-size: 17px;
          letter-spacing: 0.08em;
        }

        .area-store-eyebrow {
          display: block;
          font-size: 13px;
          line-height: 1;
          color: rgba(255, 255, 255, 0.86);
        }

        .area-store-name {
          display: block;
          margin-top: 5px;
          font-size: 21px;
          font-weight: 700;
          line-height: 1;
          letter-spacing: -0.02em;
        }

        .area-app-promo-visual {
          position: relative;
          min-height: clamp(300px, 35vh, 390px);
          width: min(100%, 740px);
          justify-self: end;
          opacity: 0;
          transform: translateX(140px) scale(0.96);
          transition:
            opacity 720ms ease 120ms,
            transform 960ms cubic-bezier(0.22, 1, 0.36, 1) 120ms;
        }

        .area-app-promo.is-visible .area-app-promo-visual {
          opacity: 1;
          transform: translateX(0) scale(1);
        }

        .area-app-phone {
          position: absolute;
          overflow: visible;
          width: clamp(218px, 21vw, 315px);
          aspect-ratio: 9 / 19.5;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: clamp(34px, 4vw, 52px);
          background:
            linear-gradient(135deg, #4d5355 0%, #16191a 13%, #070808 48%, #313638 100%),
            #080909;
          padding: clamp(8px, 0.9vw, 12px);
          box-shadow:
            inset 0 0 0 2px rgba(255, 255, 255, 0.08),
            inset 0 0 0 8px rgba(0, 0, 0, 0.62),
            0 34px 80px rgba(0, 0, 0, 0.54);
        }

        .area-app-phone::before {
          content: '';
          position: absolute;
          top: clamp(16px, 2.2vw, 26px);
          left: 50%;
          z-index: 5;
          width: 28%;
          height: 4.7%;
          border-radius: 999px;
          background:
            radial-gradient(circle at 76% 50%, #2b3032 0 3px, transparent 4px),
            linear-gradient(180deg, #111415, #060707);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            0 1px 8px rgba(0, 0, 0, 0.45);
          transform: translateX(-50%);
        }

        .area-app-phone::after {
          content: '';
          position: absolute;
          inset: clamp(9px, 0.9vw, 13px);
          z-index: 4;
          border-radius: clamp(26px, 3.4vw, 42px);
          background:
            linear-gradient(115deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.04) 16%, transparent 38%),
            linear-gradient(270deg, rgba(255, 255, 255, 0.09), transparent 20%);
          pointer-events: none;
          mix-blend-mode: screen;
        }

        .area-app-phone-main {
          z-index: 2;
          top: 0;
          left: 10%;
          transform: rotate(-2deg);
        }

        .area-app-phone-back {
          z-index: 1;
          top: 12%;
          right: 3%;
          width: clamp(210px, 20vw, 300px);
          opacity: 0.9;
          transform: rotate(4deg) scale(0.98);
        }

        .area-app-phone-screen {
          position: absolute;
          inset: clamp(10px, 1vw, 14px);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          padding: clamp(58px, 6vw, 78px) clamp(14px, 1.4vw, 20px) clamp(16px, 1.8vw, 24px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: clamp(24px, 3vw, 38px);
          background:
            linear-gradient(180deg, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.72)),
            url('/area/reference-login-hub.png') center / cover no-repeat;
          box-shadow:
            inset 0 0 0 1px rgba(0, 0, 0, 0.7),
            inset 0 20px 36px rgba(0, 0, 0, 0.42);
        }

        .area-app-phone-screen::before {
          content: '10:15';
          position: absolute;
          top: 18px;
          left: 20px;
          z-index: 2;
          color: rgba(255, 255, 255, 0.92);
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.01em;
        }

        .area-app-phone-screen::after {
          content: '';
          position: absolute;
          top: 19px;
          right: 18px;
          z-index: 2;
          width: 48px;
          height: 14px;
          border-radius: 999px;
          background:
            linear-gradient(90deg, #ffffff 0 8px, transparent 8px 13px, #ffffff 13px 21px, transparent 21px 26px, #ffffff 26px 34px, transparent 34px),
            linear-gradient(#ffffff, #ffffff) right center / 18px 9px no-repeat;
          opacity: 0.9;
        }

        .area-app-phone-back .area-app-phone-screen {
          justify-content: flex-end;
          background:
            linear-gradient(180deg, rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.86)),
            url('/area/Hero2.png') center / cover no-repeat;
        }

        .area-phone-brand {
          margin-bottom: 22px;
          text-align: center;
          font-size: 19px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-shadow: 0 2px 18px rgba(0, 0, 0, 0.46);
        }

        .area-phone-card {
          margin-top: auto;
          padding: 18px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 24px;
          background: linear-gradient(180deg, rgba(8, 9, 9, 0.18), rgba(8, 9, 9, 0.78));
          color: #ffffff;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            0 16px 34px rgba(0, 0, 0, 0.32);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.42);
        }

        .area-phone-card small {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.86);
        }

        .area-phone-card strong {
          display: block;
          font-size: 24px;
          line-height: 1.15;
        }

        .area-phone-card p {
          margin-top: 10px;
          font-size: 15px;
          line-height: 1.45;
          color: rgba(255, 255, 255, 0.9);
        }

        .area-phone-pill {
          align-self: center;
          margin-top: 18px;
          padding: 11px 32px;
          border-radius: 999px;
          background: #e91645;
          color: #ffffff;
          font-size: 14px;
          font-weight: 800;
          box-shadow: 0 14px 26px rgba(233, 22, 69, 0.28);
        }

        .area-app-toast {
          position: fixed;
          left: 50%;
          bottom: 28px;
          z-index: 80;
          padding: 14px 20px;
          border: 1px solid rgba(255, 255, 255, 0.28);
          border-radius: 999px;
          background: rgba(15, 15, 14, 0.88);
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          box-shadow: 0 18px 46px rgba(0, 0, 0, 0.34);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transform: translateX(-50%);
        }

        .area-benefits-visual-frame {
          position: relative;
          overflow: hidden;
          min-height: clamp(360px, 46vw, 640px);
          border-radius: 36px;
          box-shadow: 0 30px 60px rgba(17, 17, 17, 0.1);
        }

        .area-benefits-visual-frame.is-video {
          display: flex;
          align-items: stretch;
          justify-content: stretch;
          padding: clamp(14px, 1.8vw, 18px);
          border: 1px solid rgba(17, 17, 17, 0.06);
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 246, 240, 0.96) 100%);
          box-shadow:
            0 28px 60px rgba(17, 17, 17, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.72);
        }

        .area-benefits-video-shell {
          position: relative;
          width: 100%;
          min-height: inherit;
        }

        .area-benefits-video-stage {
          --area-benefits-video-bleed-x: clamp(34px, 4vw, 62px);
          --area-benefits-video-bleed-top: clamp(10px, 1.4vw, 16px);
          --area-benefits-video-bleed-bottom: clamp(84px, 10vw, 128px);
          position: relative;
          width: 100%;
          min-height: inherit;
          overflow: hidden;
          border-radius: 28px;
          background: #ffffff;
          box-shadow: 0 18px 34px rgba(17, 17, 17, 0.08);
        }

        .area-benefits-video-stage::after {
          content: '';
          position: absolute;
          right: 0;
          bottom: 0;
          left: 0;
          height: clamp(18px, 2.8vw, 34px);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.84) 72%, #ffffff 100%);
          pointer-events: none;
          z-index: 1;
        }

        .area-benefits-audio-toggle {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 2;
          border: 1px solid rgba(17, 17, 17, 0.08);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.9);
          color: #171717;
          padding: 12px 18px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.02em;
          backdrop-filter: blur(14px);
          box-shadow: 0 16px 30px rgba(17, 17, 17, 0.12);
          transition: transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
        }

        .area-benefits-audio-toggle:hover {
          transform: translateY(-1px);
          box-shadow: 0 20px 36px rgba(17, 17, 17, 0.16);
        }

        .area-benefits-audio-toggle.is-active {
          background: #5f7616;
          color: #fffdf8;
        }

        .area-benefits-visual {
          display: block;
          width: 100%;
          height: 100%;
          min-height: inherit;
          object-fit: cover;
          object-position: center 58%;
        }

        .area-benefits-video {
          position: absolute;
          top: calc(-1 * var(--area-benefits-video-bleed-top));
          left: calc(-1 * var(--area-benefits-video-bleed-x));
          display: block;
          width: calc(100% + var(--area-benefits-video-bleed-x) + var(--area-benefits-video-bleed-x));
          height: calc(100% + var(--area-benefits-video-bleed-top) + var(--area-benefits-video-bleed-bottom));
          min-height: calc(
            clamp(360px, 46vw, 640px) + var(--area-benefits-video-bleed-top) + var(--area-benefits-video-bleed-bottom)
          );
          max-width: none;
          z-index: 0;
          border-radius: inherit;
          background: #ffffff;
          object-fit: cover;
          object-position: center 36%;
          pointer-events: none;
          user-select: none;
          -webkit-user-select: none;
          -webkit-user-drag: none;
        }

        .area-benefits-visual-frame .area-title,
        .area-benefits-visual-frame .area-copy,
        .area-benefits-grid {
          display: none;
        }

        #benefits + .area-wide-image {
          display: none;
        }

        .area-wide-image {
          display: block;
          width: 100%;
          border-radius: 32px;
        }

        .area-feature {
          padding: 72px 0 92px;
        }

        .area-feature-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(360px, 480px);
          gap: 36px;
          align-items: start;
        }

        .area-feature-copy .area-title {
          margin: 44px 0 18px;
          font-size: clamp(3rem, 5vw, 4.2rem);
          line-height: 0.98;
        }

        .area-feature-copy .area-copy {
          max-width: 520px;
          margin-bottom: 32px;
        }

        .area-feature-list {
          display: grid;
          gap: 0;
          margin-bottom: 38px;
        }

        .area-feature-list-item {
          display: grid;
          grid-template-columns: 40px minmax(0, 1fr);
          gap: 16px;
          padding: 20px 0;
          border-top: 1px solid var(--area-line);
          font-size: 15px;
          line-height: 1.6;
        }

        .area-feature-list-item:last-child {
          border-bottom: 1px solid var(--area-line);
        }

        .area-feature-list-item span:first-child {
          color: #8d8d88;
          font-weight: 600;
        }

        .area-feature-cta {
          min-width: 160px;
        }

        .area-feature-visual {
          background: linear-gradient(135deg, #d0b98a 0%, #f4ebd4 100%);
          border-radius: 32px;
          padding: 0;
          overflow: hidden;
        }

        .area-feature-image {
          display: block;
          width: 100%;
          height: auto;
        }

        .area-encryption {
          position: relative;
          margin: 24px calc(50% - 50vw) 0;
          padding: 0 max(72px, calc((100vw - 1376px) / 2 + 32px)) 74px;
          overflow: hidden;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          background: #000;
          color: #f8f8f8;
        }

        .area-encryption::before {
          content: '';
          position: absolute;
          left: 47%;
          top: 70px;
          width: 150px;
          height: 520px;
          pointer-events: none;
          background:
            linear-gradient(90deg, transparent 0 16%, rgba(255, 255, 255, 0.035) 16% 34%, transparent 34% 55%, rgba(255, 255, 255, 0.04) 55% 74%, transparent 74% 100%);
          opacity: 0.75;
        }

        .area-encryption-kicker {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 14px;
          margin-top: 28px;
          color: #8f8f8f;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.42em;
          text-transform: uppercase;
        }

        .area-encryption-kicker::before {
          content: '';
          width: 10px;
          height: 10px;
          background: #ff6a00;
        }

        .area-encryption-title {
          position: relative;
          z-index: 1;
          max-width: 1060px;
          margin: 34px 0 0;
          color: #f7f7f7;
          font-size: clamp(64px, 6.9vw, 118px);
          font-weight: 800;
          line-height: 0.98;
          letter-spacing: -0.055em;
        }

        .area-encryption-title span {
          display: block;
          color: #a7a7a7;
        }

        .area-encryption-copy {
          position: relative;
          z-index: 1;
          max-width: 780px;
          margin: 36px 0 76px;
          color: #a7a7a7;
          font-size: 22px;
          line-height: 1.55;
          letter-spacing: -0.03em;
        }

        .area-inference-window {
          position: relative;
          z-index: 1;
          border: 1px solid #242424;
          background: #121212;
          min-height: 316px;
        }

        .area-inference-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          min-height: 40px;
          padding: 0 20px;
          border-bottom: 1px solid #242424;
          background: #101010;
          color: #686868;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .area-inference-topbar-left,
        .area-inference-lock {
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }

        .area-inference-dots {
          display: inline-flex;
          gap: 7px;
        }

        .area-inference-dots span {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #2f2f2f;
        }

        .area-inference-lock {
          color: #ff9a00;
          letter-spacing: 0.02em;
          text-transform: none;
        }

        .area-inference-lock svg {
          width: 12px;
          height: 12px;
        }

        .area-inference-flow {
          display: grid;
          grid-template-columns: 180px minmax(180px, 1fr) 180px minmax(180px, 1fr) 270px;
          align-items: center;
          min-height: 238px;
          padding: 50px;
        }

        .area-inference-card {
          display: grid;
          place-items: center;
          min-height: 96px;
          border: 1px solid #2c2c2c;
          background: #141414;
          text-align: center;
        }

        .area-inference-card.is-proxy {
          min-height: 126px;
          border-color: rgba(255, 106, 0, 0.62);
          background: rgba(255, 106, 0, 0.06);
        }

        .area-inference-icon {
          display: grid;
          place-items: center;
          margin-bottom: 18px;
          color: #d8d8d8;
        }

        .area-inference-card.is-proxy .area-inference-icon {
          color: #ffad4f;
        }

        .area-inference-label {
          color: #f2f2f2;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .area-inference-sub {
          margin-top: 8px;
          color: #6c6c6c;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
          font-size: 11px;
          font-weight: 800;
        }

        .area-inference-line {
          position: relative;
          height: 1px;
          background: repeating-linear-gradient(90deg, rgba(255, 106, 0, 0.48) 0 7px, transparent 7px 15px);
        }

        .area-inference-pill {
          position: absolute;
          left: 50%;
          top: 50%;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 24px;
          padding: 0 14px;
          border: 1px solid #2d1b08;
          border-radius: 999px;
          transform: translate(-50%, -50%);
          background: #050505;
          color: #ff9a00;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.24em;
          text-transform: uppercase;
        }

        .area-model-stack {
          min-height: 96px;
          padding: 18px;
          border: 1px solid #2c2c2c;
          background: #141414;
          text-align: center;
        }

        .area-model-stack-title {
          color: #f2f2f2;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .area-model-icons {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 16px;
        }

        .area-model-icons span {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          border: 1px solid #333;
          border-radius: 999px;
          background: #1c1c1c;
          color: #a7a7a7;
          font-size: 11px;
          font-weight: 900;
        }

        .area-inference-footnote {
          padding: 0 24px 42px;
          color: #5f5f5f;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.28em;
          text-align: center;
          text-transform: uppercase;
        }

        .area-specs {
          padding: 72px 0 84px;
        }

        .area-specs-header {
          max-width: 780px;
          margin: 0 auto 48px;
          text-align: center;
        }

        .area-specs-header .area-title {
          margin: 24px 0 20px;
          font-size: clamp(3rem, 5vw, 4.3rem);
          line-height: 0.98;
        }

        .area-specs-header .area-copy {
          max-width: 720px;
          margin: 0 auto 28px;
        }

        .area-specs-cta {
          min-width: 160px;
        }

        .area-table-wrap {
          overflow-x: auto;
          padding-bottom: 8px;
        }

        .area-table {
          display: grid;
          grid-template-columns: repeat(3, minmax(280px, 1fr));
          gap: 0;
          min-width: 920px;
        }

        .area-table-column {
          border-top: 1px solid var(--area-line);
          border-right: 1px solid var(--area-line);
          background: transparent;
        }

        .area-table-column:last-child {
          border-right: none;
        }

        .area-table-column.highlighted {
          position: relative;
          border: 1px solid rgba(17, 17, 17, 0.08);
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.78);
          box-shadow: var(--area-card-shadow);
          overflow: hidden;
        }

        .area-table-heading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 112px;
          font-size: 22px;
          font-weight: 600;
          letter-spacing: -0.04em;
        }

        .area-table-row {
          display: flex;
          align-items: center;
          gap: 14px;
          min-height: 102px;
          padding: 0 26px;
          border-top: 1px solid var(--area-line);
          font-size: 14px;
          line-height: 1.5;
        }

        .area-table-row svg {
          flex-shrink: 0;
          width: 16px;
          height: 16px;
          color: #768749;
        }

        .area-careers-band {
          margin: 0 calc(50% - 50vw);
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: clamp(72px, 8vw, 112px) max(72px, calc((100vw - 1376px) / 2 + 32px));
          background: #000000;
          color: #ffffff;
        }

        .area-careers-band-grid {
          width: 100%;
          display: block;
        }

        .area-careers-band-kicker {
          margin-bottom: 22px;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .area-careers-band-title {
          font-family: 'Inter', sans-serif;
          max-width: 11ch;
          font-size: clamp(4rem, 10vw, 9rem);
          font-weight: 500;
          line-height: 0.96;
          letter-spacing: -0.03em;
        }

        .area-careers-band-copy {
          max-width: 760px;
          margin-top: clamp(28px, 4vw, 44px);
          color: rgba(255, 255, 255, 0.92);
          font-size: clamp(1.4rem, 2.6vw, 2.35rem);
          font-weight: 500;
          line-height: 1.42;
          letter-spacing: -0.02em;
        }

        .area-careers-band-cta {
          display: inline-flex;
          align-items: center;
          gap: 22px;
          margin-top: 46px;
          color: #ffffff;
          font-size: clamp(1.4rem, 2vw, 1.9rem);
          font-weight: 700;
          letter-spacing: -0.03em;
        }

        .area-careers-band-cta-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 999px;
          background: #ffffff;
          color: #000000;
          transition: transform 180ms ease, background-color 180ms ease;
        }

        .area-careers-band-cta:hover .area-careers-band-cta-icon {
          transform: translateX(4px);
          background: #f2f2f2;
        }

        .area-showcase {
          position: relative;
          margin: 28px 0 0;
          overflow: hidden;
          border-radius: 42px;
          background: linear-gradient(180deg, #ff860f 0%, #ff7003 100%);
          box-shadow: 0 34px 70px rgba(255, 115, 0, 0.22);
        }

        .area-showcase::before {
          content: '';
          position: absolute;
          inset: auto 0 0;
          height: 140px;
          background: linear-gradient(180deg, rgba(183, 76, 0, 0), rgba(183, 76, 0, 0.2));
          pointer-events: none;
        }

        .area-showcase-shell {
          position: relative;
          min-height: 920px;
          padding: 34px 24px 0;
        }

        .area-showcase-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .area-showcase-menu {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border: none;
          border-radius: 18px;
          background: transparent;
          color: #141414;
          cursor: pointer;
        }

        .area-showcase-app-cta {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          min-height: 58px;
          padding: 0 24px;
          border-radius: 999px;
          background: #080808;
          color: #fff;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.03em;
          text-decoration: none;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.18);
        }

        .area-showcase-app-cta-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
        }

        .area-showcase-head {
          max-width: 820px;
          margin: 12px auto 0;
          text-align: center;
        }

        .area-showcase-head .area-title {
          margin: 0;
          color: #fff;
          font-size: clamp(3.6rem, 7vw, 6rem);
          font-weight: 900;
          line-height: 0.96;
          letter-spacing: -0.06em;
          text-transform: uppercase;
        }

        .area-showcase-stage {
          position: relative;
          min-height: 720px;
          margin-top: 30px;
        }

        .area-showcase-phone {
          position: relative;
          z-index: 1;
          width: min(100%, 492px);
          margin: 0 auto;
          padding: 10px;
          border-radius: 58px;
          background: linear-gradient(180deg, #3d3d3d 0%, #090909 42%, #202020 100%);
          box-shadow:
            0 24px 54px rgba(0, 0, 0, 0.28),
            inset 0 0 0 2px rgba(255, 255, 255, 0.16);
        }

        .area-showcase-phone::before {
          content: '';
          position: absolute;
          inset: 8px;
          border-radius: 50px;
          box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.08);
          pointer-events: none;
        }

        .area-showcase-phone-screen {
          position: relative;
          min-height: 560px;
          padding: 24px 22px 28px;
          border-radius: 48px;
          background:
            radial-gradient(circle at 100% 100%, rgba(254, 224, 201, 0.82), transparent 34%),
            linear-gradient(180deg, #f6e9d6 0%, #fff7ef 100%);
          overflow: hidden;
        }

        .area-showcase-phone-screen::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.4;
          background-image:
            radial-gradient(circle at 22px 22px, rgba(240, 183, 126, 0.14) 2px, transparent 2.5px),
            linear-gradient(45deg, transparent 48%, rgba(240, 183, 126, 0.12) 49%, rgba(240, 183, 126, 0.12) 51%, transparent 52%);
          background-size: 36px 36px, 78px 78px;
          pointer-events: none;
        }

        .area-showcase-phone-status {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
          padding: 0 6px;
          color: #4e4b46;
          font-size: 14px;
          font-weight: 700;
        }

        .area-showcase-phone-status-icons {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .area-showcase-phone-status-icons span {
          display: block;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #4e4b46;
          opacity: 0.8;
        }

        .area-showcase-phone-topbar {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
          padding: 0 8px 0 10px;
        }

        .area-showcase-phone-menu {
          color: #686868;
        }

        .area-showcase-jobs-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 7px;
          border-radius: 999px;
          background: rgba(232, 222, 208, 0.92);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.78);
        }

        .area-showcase-jobs-pill-brand,
        .area-showcase-jobs-pill-tab {
          display: inline-flex;
          align-items: center;
          min-height: 54px;
          padding: 0 22px;
          border-radius: 999px;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.04em;
        }

        .area-showcase-jobs-pill-brand {
          gap: 10px;
          background: #fff;
          color: #272727;
        }

        .area-showcase-jobs-pill-avatar {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 999px;
          background: linear-gradient(180deg, #ffb042 0%, #eb7f08 100%);
          color: #fff;
          font-size: 20px;
          box-shadow: 0 10px 18px rgba(235, 127, 8, 0.28);
        }

        .area-showcase-jobs-pill-tab {
          color: rgba(39, 39, 39, 0.7);
        }

        .area-showcase-chat {
          position: relative;
          z-index: 1;
          display: grid;
          gap: 10px;
          padding: 8px 6px 0;
        }

        .area-showcase-chat-bubble {
          width: 100%;
          max-width: 356px;
          padding: 18px 18px 16px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.9);
          color: #2c2c2c;
          font-size: 22px;
          line-height: 1.12;
          letter-spacing: -0.05em;
          box-shadow: 0 3px 0 rgba(0, 0, 0, 0.08);
        }

        .area-showcase-chat-bubble.is-short {
          max-width: 322px;
          padding-top: 14px;
          padding-bottom: 14px;
        }

        .area-showcase-couch-wrap {
          position: relative;
          z-index: 3;
          width: min(100%, 860px);
          margin: -94px auto 0;
        }

        .area-showcase-couch {
          position: absolute;
          inset: 0 0 18px;
          height: 282px;
          border-radius: 28px 28px 18px 18px;
          background:
            linear-gradient(180deg, rgba(164, 90, 39, 0.28), rgba(109, 48, 15, 0.08)),
            linear-gradient(180deg, #9a5728 0%, #6a3418 100%);
          box-shadow:
            0 22px 40px rgba(93, 39, 7, 0.34),
            inset 0 2px 10px rgba(255, 255, 255, 0.18);
        }

        .area-showcase-couch::before,
        .area-showcase-couch::after {
          content: '';
          position: absolute;
          top: 62px;
          width: 18px;
          height: 126px;
          border-radius: 14px;
          background: linear-gradient(180deg, #86471f 0%, #5a2811 100%);
        }

        .area-showcase-couch::before {
          left: -8px;
        }

        .area-showcase-couch::after {
          right: -8px;
        }

        .area-showcase-couch-seat {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          height: 100%;
          gap: 2px;
          padding: 0 14px 14px;
        }

        .area-showcase-couch-cushion {
          position: relative;
          margin-top: 14px;
          border-radius: 20px;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.1), transparent 26%),
            linear-gradient(180deg, #975427 0%, #6b3618 100%);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
        }

        .area-showcase-couch-cushion::before {
          content: '';
          position: relative;
          display: block;
          width: 100%;
          height: 100%;
          border-radius: inherit;
          box-shadow:
            inset 0 -18px 24px rgba(52, 21, 9, 0.22),
            inset 0 14px 22px rgba(255, 255, 255, 0.05);
        }

        .area-showcase-laptop {
          position: absolute;
          left: 46%;
          bottom: 126px;
          width: 124px;
          height: 84px;
          border-radius: 10px 10px 8px 8px;
          transform: translateX(-50%);
          background: linear-gradient(180deg, #c8c0b8 0%, #8e877f 100%);
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.16);
        }

        .area-showcase-laptop::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          width: 14px;
          height: 14px;
          border-radius: 999px;
          transform: translate(-50%, -50%);
          background: rgba(255, 255, 255, 0.72);
        }

        .area-showcase-laptop::after {
          content: '';
          position: absolute;
          left: -22px;
          right: -18px;
          bottom: -8px;
          height: 12px;
          border-radius: 10px;
          background: linear-gradient(180deg, #7c766f 0%, #5c5752 100%);
        }

        .area-showcase-papers {
          position: absolute;
          left: 25%;
          bottom: 110px;
          width: 92px;
          height: 18px;
          transform: rotate(-8deg);
          border-radius: 4px;
          background: #fff7ef;
          box-shadow:
            0 10px 14px rgba(0, 0, 0, 0.08),
            12px 8px 0 0 rgba(239, 236, 230, 0.92);
        }

        .area-showcase-pillow {
          position: absolute;
          right: 84px;
          bottom: 98px;
          width: 142px;
          height: 122px;
          border-radius: 38px;
          background: radial-gradient(circle at 30% 30%, #8cff46 0%, #34d110 72%);
          box-shadow:
            inset 0 10px 18px rgba(255, 255, 255, 0.22),
            0 18px 24px rgba(72, 145, 27, 0.24);
        }

        .area-showcase-mascot {
          position: absolute;
          right: 126px;
          bottom: 18px;
          width: 280px;
          height: 402px;
        }

        .area-showcase-mascot-head {
          position: absolute;
          left: 84px;
          top: 0;
          width: 142px;
          height: 132px;
          border-radius: 46% 46% 42% 42%;
          background: linear-gradient(180deg, #ffb23f 0%, #ea8600 100%);
          box-shadow: inset 0 -10px 16px rgba(161, 77, 0, 0.18);
        }

        .area-showcase-mascot-head::before,
        .area-showcase-mascot-head::after {
          content: '';
          position: absolute;
          top: -18px;
          width: 42px;
          height: 42px;
          border-radius: 10px 10px 4px 4px;
          background: linear-gradient(180deg, #ffab2b 0%, #e67c00 100%);
          transform: rotate(45deg);
        }

        .area-showcase-mascot-head::before {
          left: 12px;
        }

        .area-showcase-mascot-head::after {
          right: 12px;
        }

        .area-showcase-mascot-face {
          position: absolute;
          inset: 0;
        }

        .area-showcase-mascot-brow {
          position: absolute;
          top: 42px;
          width: 34px;
          height: 8px;
          border-radius: 999px;
          background: #5a2709;
        }

        .area-showcase-mascot-brow.is-left {
          left: 30px;
          transform: rotate(-14deg);
        }

        .area-showcase-mascot-brow.is-right {
          right: 30px;
          transform: rotate(14deg);
        }

        .area-showcase-mascot-eye {
          position: absolute;
          top: 62px;
          width: 18px;
          height: 12px;
          border-radius: 999px;
          background: #201814;
        }

        .area-showcase-mascot-eye.is-left {
          left: 42px;
        }

        .area-showcase-mascot-eye.is-right {
          right: 42px;
        }

        .area-showcase-mascot-snout {
          position: absolute;
          left: 50%;
          bottom: 18px;
          width: 76px;
          height: 54px;
          border-radius: 999px;
          transform: translateX(-50%);
          background: linear-gradient(180deg, #f8d0a6 0%, #efbf8a 100%);
        }

        .area-showcase-mascot-nose {
          position: absolute;
          left: 50%;
          top: 12px;
          width: 22px;
          height: 16px;
          border-radius: 10px;
          transform: translateX(-50%);
          background: #1d1715;
        }

        .area-showcase-mascot-mouth {
          position: absolute;
          left: 50%;
          top: 30px;
          width: 30px;
          height: 14px;
          border-bottom: 3px solid #1d1715;
          border-radius: 0 0 999px 999px;
          transform: translateX(-50%);
        }

        .area-showcase-mascot-body {
          position: absolute;
          left: 58px;
          top: 94px;
          width: 190px;
          height: 238px;
        }

        .area-showcase-mascot-shirt {
          position: absolute;
          left: 58px;
          top: 42px;
          width: 88px;
          height: 126px;
          border-radius: 28px 28px 22px 22px;
          background: linear-gradient(180deg, #f8f0dd 0%, #dcccb0 100%);
        }

        .area-showcase-mascot-vest {
          position: absolute;
          top: 18px;
          width: 64px;
          height: 138px;
          border-radius: 24px;
          background: linear-gradient(180deg, #4e412f 0%, #2a241d 100%);
        }

        .area-showcase-mascot-vest.is-left {
          left: 36px;
          transform: rotate(8deg);
        }

        .area-showcase-mascot-vest.is-right {
          right: 12px;
          transform: rotate(-8deg);
        }

        .area-showcase-mascot-arm {
          position: absolute;
          top: 100px;
          width: 34px;
          height: 102px;
          border-radius: 20px;
          background: linear-gradient(180deg, #f9b03f 0%, #dc8400 100%);
        }

        .area-showcase-mascot-arm.is-left {
          left: 18px;
          transform: rotate(16deg);
        }

        .area-showcase-mascot-arm.is-right {
          right: -2px;
          height: 84px;
          transform: rotate(4deg);
        }

        .area-showcase-mascot-leg {
          position: absolute;
          bottom: 16px;
          width: 54px;
          height: 118px;
          border-radius: 26px;
          background: linear-gradient(180deg, #35312a 0%, #191714 100%);
        }

        .area-showcase-mascot-leg.is-left {
          left: 58px;
          transform: rotate(16deg);
        }

        .area-showcase-mascot-leg.is-right {
          right: 34px;
          transform: rotate(-6deg);
        }

        .area-showcase-mascot-shoe {
          position: absolute;
          bottom: -10px;
          width: 56px;
          height: 30px;
          border-radius: 18px 18px 12px 12px;
          background: linear-gradient(180deg, #ff9228 0%, #e16e00 100%);
          box-shadow: inset 0 -6px 0 rgba(255, 255, 255, 0.8);
        }

        .area-showcase-mascot-shoe.is-left {
          left: 44px;
          transform: rotate(10deg);
        }

        .area-showcase-mascot-shoe.is-right {
          right: 18px;
          transform: rotate(-4deg);
        }

        .area-showcase-badge {
          position: absolute;
          z-index: 4;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          min-height: 56px;
          padding: 0 22px;
          border-radius: 999px;
          color: #fff;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: -0.02em;
          box-shadow: 0 18px 30px rgba(95, 30, 0, 0.16);
        }

        .area-showcase-badge span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 999px;
          background: rgba(255, 215, 94, 0.95);
          color: #2d2300;
          font-size: 18px;
          box-shadow: 0 8px 14px rgba(255, 184, 0, 0.18);
        }

        .area-showcase-badge.is-left-top {
          left: 14%;
          bottom: 214px;
          transform: rotate(-6deg);
          background: linear-gradient(90deg, #6d7dff 0%, #7f8eff 100%);
        }

        .area-showcase-badge.is-left-bottom {
          left: 18%;
          bottom: 100px;
          transform: rotate(-8deg);
          background: linear-gradient(90deg, #d994f6 0%, #bb8fe9 100%);
        }

        .area-showcase-badge.is-right {
          right: 14%;
          bottom: 204px;
          transform: rotate(6deg);
          background: linear-gradient(90deg, #7c88ff 0%, #8a93ff 100%);
        }

        .area-showcase-floor {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 44px;
          background: rgba(233, 105, 0, 0.42);
          filter: blur(10px);
        }

        .area-showcase-frame {
          position: relative;
          z-index: 1;
          width: 100%;
        }

        .area-showcase-image {
          display: block;
          width: 100%;
          height: auto;
        }

        .area-showcase-image-mobile {
          display: none;
        }

        @media (max-width: 1100px) {
          .area-showcase-shell {
            min-height: 980px;
          }

          .area-showcase-badge.is-left-top {
            left: 4%;
          }

          .area-showcase-badge.is-left-bottom {
            left: 8%;
          }

          .area-showcase-badge.is-right {
            right: 4%;
          }
        }

        @media (max-width: 860px) {
          .area-showcase {
            border-radius: 30px;
          }

          .area-showcase-shell {
            min-height: auto;
            padding: 20px 16px 24px;
          }

          .area-showcase-toolbar {
            align-items: flex-start;
          }

          .area-showcase-app-cta {
            min-height: 50px;
            padding: 0 18px;
            font-size: 16px;
          }

          .area-showcase-stage {
            min-height: auto;
            padding-bottom: 280px;
          }

          .area-showcase-phone {
            width: min(100%, 420px);
          }

          .area-showcase-phone-screen {
            min-height: 490px;
          }

          .area-showcase-chat-bubble {
            font-size: 18px;
          }

          .area-showcase-couch-wrap {
            width: min(100%, 620px);
            margin-top: -66px;
          }

          .area-showcase-couch {
            height: 214px;
          }

          .area-showcase-mascot {
            right: 66px;
            bottom: -4px;
            transform: scale(0.78);
            transform-origin: bottom right;
          }

          .area-showcase-pillow {
            right: 34px;
            bottom: 68px;
            width: 108px;
            height: 94px;
          }

          .area-showcase-laptop {
            width: 96px;
            height: 68px;
            bottom: 90px;
          }

          .area-showcase-papers {
            left: 22%;
            bottom: 82px;
          }

          .area-showcase-badge {
            min-height: 50px;
            padding: 0 18px;
            font-size: 14px;
          }

          .area-showcase-badge.is-left-top {
            left: 0;
            bottom: 194px;
          }

          .area-showcase-badge.is-left-bottom {
            left: 8%;
            bottom: 112px;
          }

          .area-showcase-badge.is-right {
            right: 0;
            bottom: 188px;
          }
        }

        @media (max-width: 640px) {
          .area-showcase-head .area-title {
            font-size: 3rem;
          }

          .area-showcase-toolbar {
            gap: 12px;
          }

          .area-showcase-menu {
            width: 44px;
            height: 44px;
          }

          .area-showcase-app-cta {
            gap: 10px;
            padding: 0 14px;
            font-size: 14px;
          }

          .area-showcase-app-cta-icon {
            width: 24px;
            height: 24px;
          }

          .area-showcase-stage {
            margin-top: 18px;
            padding-bottom: 286px;
          }

          .area-showcase-phone {
            width: 100%;
            padding: 8px;
            border-radius: 34px;
          }

          .area-showcase-phone-screen {
            min-height: 422px;
            padding: 18px 14px 20px;
            border-radius: 28px;
          }

          .area-showcase-jobs-pill {
            gap: 6px;
            padding: 5px;
          }

          .area-showcase-jobs-pill-brand,
          .area-showcase-jobs-pill-tab {
            min-height: 44px;
            padding: 0 14px;
            font-size: 17px;
          }

          .area-showcase-jobs-pill-avatar {
            width: 34px;
            height: 34px;
            font-size: 16px;
          }

          .area-showcase-chat-bubble {
            max-width: 280px;
            padding: 14px;
            font-size: 16px;
          }

          .area-showcase-couch-wrap {
            margin-top: -40px;
          }

          .area-showcase-couch {
            height: 160px;
            border-radius: 22px 22px 16px 16px;
          }

          .area-showcase-laptop {
            left: 44%;
            bottom: 66px;
            width: 72px;
            height: 52px;
          }

          .area-showcase-papers {
            left: 18%;
            bottom: 62px;
            width: 60px;
            height: 12px;
          }

          .area-showcase-pillow {
            right: 14px;
            bottom: 44px;
            width: 76px;
            height: 68px;
            border-radius: 24px;
          }

          .area-showcase-mascot {
            right: 14px;
            bottom: -8px;
            width: 220px;
            transform: scale(0.54);
          }

          .area-showcase-badge {
            min-height: 40px;
            padding: 0 12px;
            gap: 8px;
            font-size: 11px;
          }

          .area-showcase-badge span {
            width: 26px;
            height: 26px;
            font-size: 14px;
          }

          .area-showcase-badge.is-left-top {
            left: -4px;
            bottom: 160px;
          }

          .area-showcase-badge.is-left-bottom {
            left: 8%;
            bottom: 100px;
          }

          .area-showcase-badge.is-right {
            right: -8px;
            bottom: 160px;
          }
        }

        .area-testimonial {
          padding: 70px 0 82px;
        }

        .area-testimonial-grid {
          display: grid;
          grid-template-columns: minmax(320px, 0.95fr) minmax(0, 1fr);
          gap: 54px;
          align-items: center;
        }

        .area-testimonial-image {
          display: block;
          width: 100%;
          border-radius: 28px;
        }

        .area-testimonial-quote {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(2.4rem, 5vw, 4rem);
          line-height: 1.1;
          letter-spacing: -0.04em;
          color: var(--area-text);
        }

        .area-testimonial-meta {
          margin-top: 42px;
          font-size: 18px;
          font-weight: 500;
        }

        .area-testimonial-role {
          display: block;
          margin-top: 8px;
          color: #80904c;
          font-size: 14px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .area-howto {
          padding: 70px 0 76px;
        }

        .area-howto-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 38px;
        }

        .area-howto-head .area-title {
          font-size: clamp(3rem, 5vw, 4.3rem);
          line-height: 0.98;
        }

        .area-howto-cta {
          min-width: 160px;
        }

        .area-steps {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 52px;
        }

        .area-step {
          border-top: 1px solid var(--area-line);
          padding-top: 24px;
        }

        .area-step-number {
          margin-bottom: 28px;
          color: #b2b2ad;
          font-size: clamp(4.4rem, 8vw, 5.6rem);
          font-weight: 400;
          line-height: 0.9;
          letter-spacing: -0.05em;
        }

        .area-step-title {
          margin-bottom: 14px;
          font-family: 'Instrument Serif', serif;
          font-size: 1.85rem;
          font-weight: 400;
          letter-spacing: -0.04em;
        }

        .area-step-body {
          color: var(--area-muted);
          font-size: 15px;
          line-height: 1.7;
        }

        .area-contact {
          padding: 74px 0 78px;
          text-align: center;
        }

        .area-contact .area-title {
          font-size: clamp(3rem, 5vw, 4.2rem);
          line-height: 0.98;
        }

        .area-contact .area-copy {
          max-width: 620px;
          margin: 24px auto 34px;
        }

        .area-contact-actions {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
          width: min(100%, 1280px);
          margin: 0 auto;
        }

        .area-contact-button {
          width: 100%;
          min-height: 54px;
          padding-inline: clamp(20px, 3vw, 34px);
        }

        .login-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(17, 17, 17, 0.42);
          backdrop-filter: blur(8px);
        }

        .login-modal {
          position: relative;
          width: min(100%, 452px);
          padding: 44px 36px 34px;
          border-radius: 30px;
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 28px 60px rgba(17, 17, 17, 0.18);
        }

        .login-close-btn {
          position: absolute;
          top: 18px;
          right: 18px;
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 12px;
          background: rgba(17, 17, 17, 0.04);
          color: rgba(17, 17, 17, 0.7);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .login-modal-title {
          margin-bottom: 26px;
          text-align: center;
          font-family: 'Instrument Serif', serif;
          font-size: 2.15rem;
          font-weight: 400;
          letter-spacing: -0.04em;
          line-height: 1;
        }

        .login-social-btn,
        .login-submit-btn {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          height: 52px;
          border-radius: 999px;
          font-size: 15px;
          font-weight: 700;
        }

        .login-social-btn {
          border: 1px solid #ddd6c7;
          background: #fff;
          color: var(--area-text);
          margin-bottom: 14px;
        }

        .login-social-btn.is-blocked {
          opacity: 0.58;
          cursor: not-allowed;
          box-shadow: none;
        }

        .login-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 16px 0;
        }

        .login-divider-line {
          flex: 1;
          height: 1px;
          background: #ece7dc;
        }

        .login-divider-text {
          color: #a3a098;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .login-form {
          display: grid;
          gap: 12px;
        }

        .login-email-input {
          width: 100%;
          height: 52px;
          padding: 0 20px;
          border: 1px solid #ddd6c7;
          border-radius: 999px;
          background: #111;
          color: #fff;
          box-shadow: inset 2px 5px 10px rgb(5, 5, 5);
          outline: none;
        }

        .login-email-input::placeholder {
          color: rgba(255, 255, 255, 0.76);
        }

        .login-email-input:focus {
          box-shadow:
            inset 2px 5px 10px rgb(5, 5, 5),
            0 0 0 2px rgba(192, 87, 42, 0.28);
        }

        .login-submit-btn {
          border: none;
          background: var(--area-text);
          color: #fff;
        }

        .login-modal-message {
          margin-top: 14px;
          text-align: center;
          font-size: 13px;
          line-height: 1.6;
        }

        .login-modal-message.success {
          color: #2a7a4f;
        }

        .login-modal-message.error {
          color: #c0392b;
        }

        .login-modal-footer {
          margin-top: 18px;
          text-align: center;
          color: #8e8b83;
          font-size: 12px;
          line-height: 1.7;
        }

        .login-modal-footer a {
          color: #555;
          text-decoration: underline;
        }

        .login-switch-row {
          margin-top: 18px;
          padding-top: 18px;
          border-top: 1px solid #ece7dc;
          text-align: center;
          color: #6c6a63;
          font-size: 14px;
        }

        .login-switch-row button {
          border: none;
          background: none;
          color: var(--area-text);
          font-weight: 600;
          text-decoration: underline;
          padding: 0;
        }

        @media (max-width: 1180px) {
          .area-hero-title {
            width: auto;
            max-width: 8ch;
            white-space: normal;
            line-height: 0.9;
          }
        }

        @media (max-width: 1100px) {
          .area-steps {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .area-feature-grid,
          .area-testimonial-grid,
          .area-careers-band-grid,
          .area-inference-flow,
          .area-showcase-stage {
            grid-template-columns: 1fr;
          }

          .area-inference-flow {
            gap: 32px;
          }

          .area-inference-line {
            width: 1px;
            height: 72px;
            margin: 0 auto;
            background: repeating-linear-gradient(180deg, rgba(255, 106, 0, 0.48) 0 7px, transparent 7px 15px);
          }

          .area-feature-visual {
            max-width: 520px;
          }

          .area-showcase-column.is-left,
          .area-showcase-column.is-right {
            padding: 0;
          }

          .area-showcase-device-wrap {
            order: -1;
            margin-bottom: 12px;
          }
        }

        @media (max-width: 900px) {
          .area-shell {
            width: min(100%, calc(100% - 32px));
          }

          .area-nav {
            padding: 12px 0 24px;
          }

          .area-nav-row {
            min-height: 56px;
            padding: 0 16px;
            border: 1px solid rgba(17, 17, 17, 0.06);
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.95);
            box-shadow: 0 10px 28px rgba(17, 17, 17, 0.04);
          }

          .area-nav-links,
          .area-nav-actions,
          .area-nav-cta,
          .area-floating-nav {
            display: none;
          }

          .area-nav-menu-toggle {
            display: inline-flex;
          }

          .area-mobile-menu {
            display: block;
          }

          .area-hero-title {
            margin: 30px auto 38px;
            width: auto;
            max-width: 7ch;
            font-size: clamp(3.7rem, 16vw, 5.4rem);
            line-height: 0.92;
            letter-spacing: -0.06em;
            white-space: normal;
          }

          .area-launch-card {
            grid-template-columns: 1fr;
            justify-items: center;
            padding: 16px 18px;
          }

          .area-launch-copy {
            text-align: center;
          }

          .area-hero-visual-wrap {
            overflow: visible;
          }

          .area-hero-desktop-visual {
            display: none;
          }

          .area-hero-mobile-visual {
            display: block;
          }

          .area-logos {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 22px 28px;
          }

            .area-benefits {
            padding-top: 50px;
          }

          .area-app-promo-inner {
            grid-template-columns: 1fr;
          }

          .area-app-promo-copy {
            max-width: 720px;
          }

          .area-app-promo-visual {
            min-height: 340px;
          }

          .area-steps {
            grid-template-columns: 1fr;
          }

          .area-specs {
            padding-bottom: 70px;
          }

          .area-careers-band {
            min-height: 100vh;
            margin-right: calc(50% - 50vw);
            margin-left: calc(50% - 50vw);
            padding: 64px 20px;
          }

          .area-careers-band-grid {
            width: 100%;
          }

          .area-careers-band-copy {
            margin-top: 22px;
          }

          .area-careers-band-cta {
            margin-top: 30px;
          }

          .area-showcase {
            margin-top: 18px;
            padding: 0;
            border-radius: 28px;
          }

          .area-showcase-frame {
            border-radius: inherit;
            overflow: hidden;
          }

          .area-howto-head {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 640px) {
          .area-shell {
            width: min(100%, calc(100% - 20px));
          }

          .area-brand {
            gap: 10px;
          }

          .area-brand::before {
            width: 9px;
            height: 9px;
            box-shadow: 0 0 0 4px rgba(95, 118, 22, 0.08);
          }

          .area-brand-wordmark {
            gap: 2px;
          }

          .area-brand-wordmark-prefix {
            margin-left: 0.2rem;
            font-size: 0.42rem;
            letter-spacing: 0.34em;
          }

          .area-brand-wordmark-main {
            font-size: 1.08rem;
          }

          .area-hero {
            padding-bottom: 28px;
          }

          .area-launch-card {
            gap: 14px;
            margin-bottom: 24px;
            padding: 14px;
            border-radius: 22px;
          }

          .area-launch-text {
            font-size: 13px;
          }

          .area-launch-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            width: 100%;
          }

          .area-launch-unit {
            padding: 12px 8px 10px;
          }

          .area-launch-value {
            font-size: 1.65rem;
          }

          .area-launch-label {
            font-size: 10px;
          }

          .area-trusted {
            padding-bottom: 42px;
          }

          .area-trusted-label {
            margin-bottom: 8px;
            font-size: 14px;
          }

          .area-trusted-note {
            margin-bottom: 24px;
            font-size: 13px;
          }

          .area-logo-item {
            min-height: 32px;
            font-size: 14px;
          }

          .area-logo-symbol {
            height: 26px;
          }

          .area-feature-copy .area-title,
          .area-specs-header .area-title,
          .area-showcase-head .area-title,
          .area-contact .area-title,
          .area-howto-head .area-title {
            font-size: clamp(2.6rem, 12vw, 3.8rem);
          }

          .area-benefit-card h3 {
            font-size: 1.75rem;
          }

          .area-feature,
          .area-encryption,
          .area-specs,
          .area-showcase,
          .area-testimonial,
          .area-howto,
          .area-contact {
            padding-top: 52px;
            padding-bottom: 56px;
          }

          .area-encryption {
            margin-right: calc(50% - 50vw);
            margin-left: calc(50% - 50vw);
            padding-right: 20px;
            padding-left: 20px;
          }

          .area-encryption-title {
            font-size: 54px;
          }

          .area-encryption-copy {
            margin-bottom: 48px;
            font-size: 18px;
          }

          .area-inference-window {
            min-height: 0;
          }

          .area-inference-topbar {
            padding: 0 14px;
          }

          .area-inference-flow {
            padding: 34px 18px;
          }

          .area-model-icons {
            flex-wrap: wrap;
          }

          .area-feature-grid {
            gap: 26px;
          }

          .area-app-promo {
            min-height: auto;
            margin-top: 30px;
          }

          .area-app-promo-inner {
            padding: 34px 0 36px;
          }

          .area-app-promo-kicker {
            margin-bottom: 22px;
            font-size: 12px;
          }

          .area-app-store-actions {
            gap: 12px;
            margin-top: 28px;
          }

          .area-store-button {
            width: 100%;
            min-width: 0;
            height: 62px;
          }

          .area-store-name {
            font-size: 20px;
          }

          .area-app-promo-visual {
            min-height: 260px;
            width: min(100%, 520px);
            justify-self: center;
          }

          .area-app-phone-main {
            left: 1%;
            width: clamp(156px, 39vw, 204px);
            border-radius: 34px;
          }

          .area-app-phone-back {
            right: 1%;
            width: clamp(146px, 36vw, 194px);
            border-radius: 34px;
          }

          .area-app-phone::before {
            top: 16px;
            width: 31%;
            height: 4.8%;
          }

          .area-app-phone::after {
            inset: 9px;
            border-radius: 30px;
          }

          .area-app-phone-screen {
            inset: 10px;
            padding: 52px 13px 14px;
            border-radius: 28px;
          }

          .area-app-phone-screen::before {
            top: 14px;
            left: 15px;
            font-size: 11px;
          }

          .area-app-phone-screen::after {
            top: 15px;
            right: 13px;
            transform: scale(0.78);
            transform-origin: top right;
          }

          .area-benefits-visual-frame {
            min-height: 240px;
            border-radius: 28px;
          }

          .area-benefits-audio-toggle {
            right: 12px;
            top: 12px;
            padding: 10px 14px;
            font-size: 12px;
          }

          .area-feature-list-item {
            grid-template-columns: 32px minmax(0, 1fr);
            gap: 12px;
            padding: 18px 0;
            font-size: 14px;
          }

          .area-table-wrap {
            overflow: visible;
            padding-bottom: 0;
          }

          .area-table {
            min-width: 0;
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .area-table-column {
            border: 1px solid var(--area-line);
            border-radius: 22px;
            background: rgba(255, 255, 255, 0.82);
            overflow: hidden;
          }

          .area-table-column:last-child {
            border-right: 1px solid var(--area-line);
          }

          .area-table-column.highlighted {
            border-color: rgba(17, 17, 17, 0.08);
          }

          .area-table-heading {
            min-height: 84px;
            padding: 0 20px;
            font-size: 18px;
          }

          .area-table-row {
            min-height: 72px;
            padding: 0 16px;
            font-size: 13px;
          }

          .area-showcase {
            border-radius: 22px;
          }

          .area-showcase-image-desktop {
            display: none;
          }

          .area-showcase-image-mobile {
            display: block;
          }

          .area-testimonial-quote {
            font-size: clamp(2.2rem, 11vw, 3.4rem);
          }

          .area-step-number {
            font-size: 4.1rem;
          }

          .area-step-title {
            font-size: 1.6rem;
          }

          .area-contact-button {
            width: 100%;
          }

          .area-contact-actions {
            gap: 12px;
          }

          .login-overlay {
            padding: 16px;
          }

          .login-modal {
            padding: 40px 22px 28px;
            border-radius: 24px;
          }

          .login-modal-title {
            font-size: 1.9rem;
          }
        }

        @media (min-width: 768px) {
          .area-contact-actions {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          .area-button,
          .area-hero-visual,
          .area-app-promo,
          .area-app-promo-copy,
          .area-app-promo-visual,
          .area-benefits-audio-toggle,
          .area-showcase-device-panel,
          .area-showcase-quick-action,
          .area-showcase-bottom-nav button,
          .area-showcase-support-typing span {
            transition: none;
            animation: none;
          }

          .area-app-promo,
          .area-app-promo-copy,
          .area-app-promo-visual {
            opacity: 1;
            transform: none;
          }

          .area-button:hover {
            transform: none;
          }

          .area-hero-visual-wrap:hover .area-hero-visual,
          .area-hero-visual-wrap:focus-within .area-hero-visual {
            transform: none;
          }

        }
      `}</style>

      <div className="area-page">
        <div className={`area-floating-nav ${floatingNavVisible && !mobileMenuOpen && !modalOpen ? 'is-visible' : ''}`}>
          <nav className="area-floating-nav-links" aria-label="Sticky navigation">
            {navLinks.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="area-shell">
          <header className="area-nav">
            <div className="area-nav-row">
              <a href="#top" className="area-brand">
                <span className="area-brand-wordmark" aria-label="The Vajra">
                  <span className="area-brand-wordmark-prefix">The</span>
                  <span className="area-brand-wordmark-main">Vajra</span>
                </span>
              </a>

              <nav className="area-nav-links" aria-label="Primary">
                {navLinks.map((item) => (
                  <a key={item.href} href={item.href}>
                    {item.label}
                  </a>
                ))}
              </nav>

              <div className="area-nav-actions">
                <a href="/support" className="area-button area-support-cta">
                  Get Support
                  <Mail size={16} />
                </a>

                <a href="/careers" className="area-button area-job-cta">
                  Apply for Job
                  <Briefcase size={16} />
                </a>

                <button type="button" className="area-button area-button-primary area-nav-cta" onClick={() => (window.location.href = '/login')}>
                  Get Started
                  <ArrowUpRight size={16} />
                </button>
              </div>

              <button
                type="button"
                className="area-nav-menu-toggle"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMobileMenuOpen((current) => !current)}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="area-mobile-menu">
                <nav aria-label="Mobile">
                  {navLinks.map((item) => (
                    <a key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                      {item.label}
                    </a>
                  ))}
                </nav>

                <a href="/support" className="area-button area-support-cta" onClick={() => setMobileMenuOpen(false)}>
                  Get Support
                  <Mail size={16} />
                </a>

                <a href="/careers" className="area-button area-job-cta" onClick={() => setMobileMenuOpen(false)}>
                  Apply for Job
                  <Briefcase size={16} />
                </a>

                <button type="button" className="area-button area-button-primary" onClick={() => (window.location.href = '/login')}>
                  Get Started
                  <ArrowUpRight size={16} />
                </button>
              </div>
            )}
          </header>

          <main id="top">
            <section className="area-hero">
              <h1 className="area-title area-hero-title">Delivering The Future</h1>
              <p className="area-copy">
                Order food online, buy and sell products, and access everyday services with The Vajra, a fast and future-ready platform built for modern delivery and convenience.
              </p>

              <div className="area-launch-card" aria-live="polite">
                <div className="area-launch-copy">
                  <p className="area-launch-kicker">Launch Countdown</p>
                  <p className="area-launch-text">
                    The Vajra goes live on <strong>{LAUNCH_DATE_LABEL}</strong>.
                  </p>
                </div>

                {launchCountdown.isLive ? (
                  <div className="area-launch-live">Now Live</div>
                ) : (
                  <div className="area-launch-grid">
                    {countdownUnits.map((unit) => (
                      <div key={unit.label} className="area-launch-unit">
                        <span className="area-launch-value">{unit.value}</span>
                        <span className="area-launch-label">{unit.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="area-hero-visual-wrap">
                <img
                  src="/area/Hero2.png"
                  alt="Vajra drone front view with glowing red lights"
                  className="area-hero-visual area-hero-desktop-visual"
                />

                <img
                  src="/area/Hero2.png"
                  alt="Vajra drone front view with glowing red lights"
                  className="area-hero-visual area-hero-mobile-visual"
                />
              </div>
            </section>

            <section className="area-trusted" aria-labelledby="trusted-by-heading">
              <p id="trusted-by-heading" className="area-trusted-label">
                What powers The Vajra:
              </p>
              <p className="area-trusted-note">
                Drone-powered logistics for faster everyday delivery, clearer tracking, and a stronger operational foundation from dispatch to drop-off.
              </p>

              <div className="area-logos">
                {deliverySignals.map((signal) => (
                  <div key={signal} className="area-logo-item">
                    {signal}
                  </div>
                ))}
              </div>
            </section>

            <div className="area-divider" />

            <section
              ref={appPromoRef}
              className={`area-app-promo ${appPromoVisible ? 'is-visible' : ''}`}
              aria-labelledby="vajra-app-promo-title"
            >
              <div className="area-shell area-app-promo-inner">
                <div className="area-app-promo-copy">
                  <p className="area-app-promo-kicker">The Vajra at your fingertips.</p>
                  <h2 id="vajra-app-promo-title" className="area-app-promo-title">
                    Discover food, marketplace, and smart delivery in one Vajra app.
                  </h2>

                  <div className="area-app-store-actions" aria-label="App availability">
                    <button type="button" className="area-store-button" onClick={() => showStoreComingSoon('App Store')}>
                      <span className="area-store-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16.5 1.8c.1 1.2-.4 2.4-1.2 3.3-.8.9-2 1.6-3.1 1.5-.1-1.2.4-2.4 1.1-3.2.8-.9 2.1-1.6 3.2-1.6Zm3.8 15.8c-.5 1.1-.8 1.6-1.4 2.6-.9 1.4-2.2 3.1-3.8 3.1-1.4 0-1.8-.9-3.7-.9s-2.3.9-3.8 1c-1.6.1-2.8-1.5-3.7-2.9-2.6-4-2.9-8.7-1.3-11.1 1.1-1.7 2.8-2.7 4.4-2.7 1.7 0 2.7.9 4 .9 1.3 0 2.1-.9 4-.9 1.4 0 2.9.8 4 2.1-3.5 1.9-2.9 6.9 1.3 8.8Z" />
                        </svg>
                      </span>
                      <span>
                        <span className="area-store-eyebrow">Download on the</span>
                        <span className="area-store-name">App Store</span>
                      </span>
                    </button>

                    <button type="button" className="area-store-button" onClick={() => showStoreComingSoon('Google Play')}>
                      <span className="area-store-icon" aria-hidden="true">
                        <GoogleIcon />
                      </span>
                      <span>
                        <span className="area-store-eyebrow">GET IT ON</span>
                        <span className="area-store-name">Google Play</span>
                      </span>
                    </button>

                    <button type="button" className="area-store-button" onClick={() => showStoreComingSoon('Vajra Apps')}>
                      <span className="area-store-icon is-vajra" aria-hidden="true">V</span>
                      <span>
                        <span className="area-store-eyebrow">Available on</span>
                        <span className="area-store-name">Vajra Apps</span>
                      </span>
                    </button>
                  </div>
                </div>

                <div className="area-app-promo-visual" aria-hidden="true">
                  <div className="area-app-phone area-app-phone-main">
                    <div className="area-app-phone-screen">
                      <div className="area-phone-brand">THE VAJRA</div>
                      <div className="area-phone-card">
                        <small>Platform Preview</small>
                        <strong>Food, products, and everyday services.</strong>
                        <p>One connected experience for faster discovery, ordering, tracking, and support.</p>
                        <div className="area-phone-pill">Coming Soon</div>
                      </div>
                    </div>
                  </div>

                  <div className="area-app-phone area-app-phone-back">
                    <div className="area-app-phone-screen">
                      <div className="area-phone-card">
                        <strong>Drone-ready delivery flow</strong>
                        <p>Order accepted, dispatch coordinated, and delivered with clearer live visibility.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="benefits" className="area-benefits">
              <div className="area-benefits-visual-frame is-video">
                <div className="area-benefits-video-shell">
                  <div ref={benefitsVideoStageRef} className="area-benefits-video-stage">
                    <video
                      ref={benefitsVideoRef}
                      className="area-benefits-video"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      disablePictureInPicture
                      disableRemotePlayback
                      controlsList="nodownload nofullscreen noplaybackrate noremoteplayback"
                      draggable={false}
                      tabIndex={-1}
                      onContextMenu={(event) => event.preventDefault()}
                    >
                      <source src="/area/vajra-drone-fan-video.mp4" type="video/mp4" />
                    </video>

                    <button
                      type="button"
                      className={`area-benefits-audio-toggle ${benefitsAudioEnabled ? 'is-active' : ''}`}
                      onClick={handleBenefitsAudioToggle}
                    >
                      {benefitsAudioEnabled ? 'Mute drone sound' : 'Enable drone sound'}
                    </button>
                  </div>
                </div>
                <h2 className="area-title">One platform for food, products, and everyday access.</h2>
                <p className="area-copy">The Vajra combines delivery, marketplace discovery, and service access in one smarter digital experience.</p>
              </div>

              <div className="area-benefits-grid">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon;

                  return (
                    <article key={benefit.title} className="area-benefit-card">
                      <Icon className="area-benefit-icon" strokeWidth={1.75} />
                      <h3>{benefit.title}</h3>
                      <p>{benefit.body}</p>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="area-feature">
              <div className="area-feature-grid">
                <div className="area-feature-copy">
                  <div className="area-divider" />
                  <h2 className="area-title">A connected platform, not just another app.</h2>
                  <p className="area-copy">
                    The Vajra is being shaped as a technology-led platform that brings delivery, commerce, and everyday service access together in one product.
                  </p>

                  <div className="area-feature-list">
                    {insightSteps.map((item, index) => (
                      <div key={item} className="area-feature-list-item">
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <a href="#specifications" className="area-button area-button-soft area-feature-cta">
                    Explore the model
                  </a>
                </div>

                <div className="area-feature-visual">
                  <img src="/area/vajra-building.jpg  " alt="Elevated platform representing precise drone delivery operations" className="area-feature-image" />
                </div>
              </div>
            </section>

            <div className="area-divider" />

            <section className="area-encryption" aria-labelledby="encrypted-inference-title">
              <p className="area-encryption-kicker">Drone Inference</p>
              <h2 id="encrypted-inference-title" className="area-encryption-title">
                All payments. All Orders.
                <span>End-to-end encrypted.</span>
              </h2>
              <p className="area-encryption-copy">
                One inference path for every user - Every Order on the platform.
                Encrypted from your device to the server and drone, with customer-managed keys and zero data retention.
                Your data is Safe with us.
              </p>

              <div className="area-inference-window">
                <div className="area-inference-topbar">
                  <div className="area-inference-topbar-left">
                    <span className="area-inference-dots" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                    <span>Inference-Path</span>
                  </div>
                  <span className="area-inference-lock">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" />
                      <path d="M7 11h10v8H7z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    end-to-end encrypted
                  </span>
                </div>

                <div className="area-inference-flow">
                  <div className="area-inference-card">
                    <div>
                      <span className="area-inference-icon" aria-hidden="true">
                        <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                          <path d="M8 9h18v12H8z" stroke="currentColor" strokeWidth="1.8" />
                          <path d="M13 26h8M17 21v5M10 12h4" stroke="currentColor" strokeWidth="1.8" />
                        </svg>
                      </span>
                      <div className="area-inference-label">You Order</div>
                      <div className="area-inference-sub">User</div>
                    </div>
                  </div>

                  <div className="area-inference-line">
                    <span className="area-inference-pill">
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" />
                        <path d="M7 11h10v8H7z" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      Encrypted
                    </span>
                  </div>

                  <div className="area-inference-card is-proxy">
                    <div>
                      <span className="area-inference-icon" aria-hidden="true">
                        <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                          <path d="M17 8l7 4v8l-7 4-7-4v-8l7-4z" stroke="currentColor" strokeWidth="1.8" />
                          <path d="M17 8v8l7-4M17 16l-7-4" stroke="currentColor" strokeWidth="1.8" />
                        </svg>
                      </span>
                      <div className="area-inference-label">Server</div>
                      <div className="area-inference-sub">Request delivery to drone</div>
                    </div>
                  </div>

                  <div className="area-inference-line">
                    <span className="area-inference-pill">
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" />
                        <path d="M7 11h10v8H7z" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      Encrypted
                    </span>
                  </div>

                  <div className="area-model-stack">
                    <div className="area-model-stack-title">Order accepted</div>
                    <div className="area-model-icons" aria-hidden="true">
                      <span>◎</span>
                      <span>Z</span>
                      <span>h</span>
                      <span>|||</span>
                      <span>+24</span>
                    </div>
                  </div>
                </div>

                <div className="area-inference-footnote">
                  Order - Accepted - Drone dispatched - Out for delivery - Delivered
                </div>
              </div>
            </section>

            <section id="specifications" className="area-specs">
              <div className="area-specs-header">
                <p className="area-section-label">Why Vajra</p>
                <h2 className="area-title">Why Choose The Vajra?</h2>
                <p className="area-copy">
                  The future of convenience needs more than a single-purpose app. The Vajra is being built to combine smarter delivery, online marketplace access, and everyday services in one connected platform.
                </p>
                <a href="#how-to" className="area-button area-button-soft area-specs-cta">
                  See the rollout
                </a>
              </div>

              <div className="area-table-wrap">
                <div className="area-table">
                  {comparisonColumns.map((column) => (
                    <div key={column.title} className={`area-table-column ${column.highlighted ? 'highlighted' : ''}`}>
                      <div className="area-table-heading">{column.title}</div>
                      {column.rows.map((row) => (
                        <div key={row} className="area-table-row">
                          <Check strokeWidth={2.2} />
                          <span>{row}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="area-careers-band" aria-labelledby="careers-band-title">
              <div className="area-shell area-careers-band-grid">
                <div>
                  <p className="area-careers-band-kicker">Careers</p>
                  <h2 id="careers-band-title" className="area-careers-band-title">
                    Seize the future
                  </h2>
                  <p className="area-careers-band-copy">
                    Our teams are building change across food delivery, marketplace access, smart services, and drone-ready logistics for a faster, more connected everyday life.
                  </p>
                  <a href="/careers" className="area-careers-band-cta">
                    Come join us
                    <span className="area-careers-band-cta-icon" aria-hidden="true">
                      <ArrowUpRight size={28} />
                    </span>
                  </a>
                </div>
              </div>
            </section>

            <section className="area-showcase" aria-labelledby="vajra-showcase-title">
              <div className="area-showcase-frame">
                <h2 id="vajra-showcase-title" className="sr-only">
                  Job search showcase
                </h2>
                <img
                  src="/area/job-search-showcase.png"
                  alt="Orange job search showcase with phone, couch, mascot, and get the app call to action"
                  className="area-showcase-image area-showcase-image-desktop"
                />
                <img
                  src="/area/job-search-showcase.png"
                  alt="Orange job search showcase with phone, couch, mascot, and get the app call to action"
                  className="area-showcase-image area-showcase-image-mobile"
                />
              </div>
            </section>

            <section className="area-testimonial">
              <div className="area-testimonial-grid">
                <img src="/area/drone-parcel.jpg" alt="Abstract balance sculpture representing precision and control in delivery operations" className="area-testimonial-image" />

                <div>
                  <blockquote className="area-testimonial-quote">
                    "The Vajra is building a smarter, faster, and more connected future for everyday life."
                  </blockquote>

                  <div className="area-testimonial-meta">
                    The Vajra Team
                    <span className="area-testimonial-role">The VajraCognixia Technologies Private Limited</span>
                  </div>
                </div>
              </div>
            </section>

            <div className="area-divider" />

            {/* Premium AI orbit animation inserted above Vision (how-to) section */}
            <AiOrbitAnimation />

            <section id="how-to" className="area-howto">
              <div className="area-howto-head">
                <h2 className="area-title">How The Vajra Works</h2>
                <a href="#contact" className="area-button area-button-soft area-howto-cta">
                  Request early access
                </a>
              </div>

              <div className="area-steps">
                {roadmapSteps.map((step) => (
                  <article key={step.number} className="area-step">
                    <div className="area-step-number">{step.number}</div>
                    <h3 className="area-step-title">{step.title}</h3>
                    <p className="area-step-body">{step.body}</p>
                  </article>
                ))}
              </div>

              <div className="area-howto-image">
                <img src="/area/coast.png" alt="Wide aerial landscape representing the scale of future drone delivery coverage" className="area-wide-image" />
              </div>
            </section>

            <div className="area-divider" />

            <section id="contact" className="area-contact">
              <h2 className="area-title">Connect with The Vajra</h2>
              <p className="area-copy">
                If you want to follow the journey, explore partnerships, or learn how The Vajra is being built, reach out to The VajraCognixia Technologies Private Limited.
              </p>

              <div className="area-contact-actions">
                <button type="button" className="area-button area-button-primary area-contact-button" onClick={() => openModal('signup')}>
                  Request early access
                  <ArrowUpRight size={16} />
                </button>

                <a href="/support" className="area-button area-support-cta area-contact-button">
                  Get Support
                  <Mail size={16} />
                </a>
              </div>
            </section>
          </main>

          <LandingFooter />
        </div>
      </div>

      {modalOpen && (
        <div className="login-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="login-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
            <button type="button" className="login-close-btn" onClick={closeModal} aria-label="Close sign-in dialog">
              <X size={18} />
            </button>

            <h2 className="login-modal-title" id="auth-title">
              {mode === 'signup' ? 'Join The Vajra.' : 'Welcome back to The Vajra.'}
            </h2>

            <button
              className={`login-social-btn${googleBlockedByCaptcha ? ' is-blocked' : ''}`}
              onClick={handleGoogleLogin}
              disabled={loading || googleBlockedByCaptcha}
            >
              <GoogleIcon />
              {loading ? 'Preparing Google...' : 'Continue with Google'}
            </button>

            <div className="login-divider">
              <span className="login-divider-line" />
              <span className="login-divider-text">or</span>
              <span className="login-divider-line" />
            </div>

            <form className="login-form" onSubmit={handleEmailSubmit}>
              <input
                className="login-email-input"
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {captchaEnabled && (
                  <div className="mt-4 overflow-hidden rounded-[18px] border border-[#e8e3d7] bg-white px-3 py-3">
                    <TurnstileWidget
                    siteKey={turnstileSiteKey}
                    resetSignal={captchaResetCount}
                    onVerify={(token) => {
                      setCaptchaToken(token);
                      setMessage('');
                    }}
                    onExpire={() => setCaptchaToken('')}
                    onError={() => {
                      setCaptchaToken('');
                      setMessage('Captcha could not be loaded. Please refresh and try again.');
                    }}
                    />
                  </div>
                )}

                {googleBlockedByCaptcha ? (
                  <p className="mt-3 text-xs font-medium text-[#7a5f3f]">
                    Complete the captcha first to continue with Google.
                  </p>
                ) : null}

                <button className="login-submit-btn" type="submit" disabled={loading}>
                {loading ? 'Sending...' : mode === 'signup' ? 'Continue with email' : 'Sign in with email'}
              </button>
            </form>

            {message && (
              <p className={`login-modal-message ${message.startsWith('Success:') ? 'success' : 'error'}`}>
                {message}
              </p>
            )}

            <p className="login-modal-footer">
              By continuing, you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>. You can also use the dedicated <a href="/login">Login</a> or <a href="/signup">Sign Up</a> pages.
            </p>

            <div className="login-switch-row">
              {mode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button type="button" onClick={() => setMode('signin')}>
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  No account yet?{' '}
                  <button type="button" onClick={() => setMode('signup')}>
                    Create one
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {!modalOpen ? <FloatingContactTab /> : null}

      {storeNotice ? (
        <div className="area-app-toast" role="status" aria-live="polite">
          {storeNotice}
        </div>
      ) : null}
    </>
  );
}
