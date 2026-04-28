import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ArrowUpRight,
  Briefcase,
  Check,
  Globe2,
  Instagram,
  Mail,
  Menu,
  MapPin,
  Package,
  ShieldCheck,
  X,
  Zap,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const HOME_TITLE = 'The Vajra';
const SUPPORT_EMAIL = 'support@vajracognixia.in';
const COMPANY_WEBSITE_URL = 'https://www.vajracognixia.in/';
const COMPANY_INSTAGRAM_URL = 'https://www.instagram.com/vajracognixia.in/';
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
  { label: 'Why Vajra', href: '#benefits' },
  { label: 'Delivery Model', href: '#specifications' },
  { label: 'Vision', href: '#how-to' },
  { label: 'Contact', href: '#contact' },
  { label: 'Founder', href: '/founder' },
  { label: 'Careers', href: '/careers' },
] as const;

const benefits = [
  {
    title: 'Drone-First Dispatch',
    body: 'The Vajra is being built around drone-led delivery to reduce delays between pickup and drop-off.',
    icon: Zap,
  },
  {
    title: 'Smarter Route Visibility',
    body: 'Live order visibility and coordinated routing help customers and operators know where every delivery stands.',
    icon: MapPin,
  },
  {
    title: 'Safer Delivery Control',
    body: 'Tracked movement, clearer handoff flow, and controlled operations are central to the product design.',
    icon: ShieldCheck,
  },
  {
    title: 'Built Beyond One Use Case',
    body: 'The same logistics foundation can support food, essentials, parcels, and future local commerce services.',
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

export default function Login() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [floatingNavVisible, setFloatingNavVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [footerNewsletterEmail, setFooterNewsletterEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [benefitsAudioEnabled, setBenefitsAudioEnabled] = useState(false);
  const [launchCountdown, setLaunchCountdown] = useState(getLaunchCountdown);
  const benefitsVideoRef = useRef<HTMLVideoElement | null>(null);
  const benefitsVideoStageRef = useRef<HTMLDivElement | null>(null);
  const redirectTo = `${window.location.origin}/auth/callback`;

  useEffect(() => {
    document.title = HOME_TITLE;
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
    setLoading(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (error) {
      setMessage('Something went wrong. Try again.');
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
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

        .area-contact-button {
          width: min(100%, 610px);
        }

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
          padding: 48px 0 28px;
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
          .area-testimonial-grid {
            grid-template-columns: 1fr;
          }

          .area-feature-visual {
            max-width: 520px;
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

          .area-steps {
            grid-template-columns: 1fr;
          }

          .area-specs {
            padding-bottom: 70px;
          }

          .area-howto-head {
            flex-direction: column;
            align-items: flex-start;
          }

          .area-footer-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 36px;
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
          .area-contact .area-title,
          .area-howto-head .area-title {
            font-size: clamp(2.6rem, 12vw, 3.8rem);
          }

          .area-benefit-card h3 {
            font-size: 1.75rem;
          }

          .area-feature,
          .area-specs,
          .area-testimonial,
          .area-howto,
          .area-contact {
            padding-top: 52px;
            padding-bottom: 56px;
          }

          .area-feature-grid {
            gap: 26px;
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

          .area-table {
            min-width: 760px;
          }

          .area-table-heading {
            min-height: 84px;
            font-size: 18px;
          }

          .area-table-row {
            min-height: 78px;
            padding: 0 16px;
            font-size: 13px;
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

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          .area-button,
          .area-hero-visual,
          .area-benefits-audio-toggle {
            transition: none;
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
                <a href="/careers" className="area-button area-job-cta">
                  Apply for Job
                  <Briefcase size={16} />
                </a>

                <button type="button" className="area-button area-button-primary area-nav-cta" onClick={() => openModal('signup')}>
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

                <a href="/careers" className="area-button area-job-cta" onClick={() => setMobileMenuOpen(false)}>
                  Apply for Job
                  <Briefcase size={16} />
                </a>

                <button type="button" className="area-button area-button-primary" onClick={() => openModal('signup')}>
                  Get Started
                  <ArrowUpRight size={16} />
                </button>
              </div>
            )}
          </header>

          <main id="top">
            <section className="area-hero">
              <h1 className="area-title area-hero-title">Delivering the future.</h1>

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
                  src="/area/vajra-hero-drone.jpg"
                  alt="Vajra drone front view with glowing red lights"
                  className="area-hero-visual area-hero-desktop-visual"
                />

                <img
                  src="/area/vajra-hero-drone.jpg"
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
                <h2 className="area-title">Drone delivery, built for real life.</h2>
                <p className="area-copy">The Vajra is creating a faster and smarter delivery layer for everyday orders.</p>
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
                  <h2 className="area-title">A logistics layer, not just another app.</h2>
                  <p className="area-copy">
                    The Vajra is being shaped as a technology-led delivery system that can coordinate dispatch, visibility, and drone-powered fulfilment in one product.
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
                  <img src="/area/podium.png" alt="Elevated platform representing precise drone delivery operations" className="area-feature-image" />
                </div>
              </div>
            </section>

            <div className="area-divider" />

            <section id="specifications" className="area-specs">
              <div className="area-specs-header">
                <p className="area-section-label">Why Vajra</p>
                <h2 className="area-title">Why Choose The Vajra?</h2>
                <p className="area-copy">
                  The future of delivery needs more than another marketplace app. The Vajra is being built to combine drone-led speed, smarter coordination, and a stronger logistics foundation.
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

            <section className="area-testimonial">
              <div className="area-testimonial-grid">
                <img src="/area/balance.png" alt="Abstract balance sculpture representing precision and control in delivery operations" className="area-testimonial-image" />

                <div>
                  <blockquote className="area-testimonial-quote">
                    "We are building The Vajra to make delivery faster, smarter, and ready for a future where drones are part of everyday logistics."
                  </blockquote>

                  <div className="area-testimonial-meta">
                    The Vajra Team
                    <span className="area-testimonial-role">The VajraCognixia Technologies Private Limited</span>
                  </div>
                </div>
              </div>
            </section>

            <div className="area-divider" />

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

              <button type="button" className="area-button area-button-primary area-contact-button" onClick={() => openModal('signup')}>
                Request early access
                <ArrowUpRight size={16} />
              </button>
            </section>
          </main>

          <footer className="area-footer">
            <div className="area-footer-inner">
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
                    <a href="#top">Home</a>
                    <a href="#benefits">Why Vajra</a>
                    <a href="#specifications">Delivery Model</a>
                    <a href="/founder">Founder</a>
                    <a href="/careers">Careers</a>
                  </nav>
                </div>

                <div>
                  <h3 className="area-footer-heading">Company</h3>
                  <nav className="area-footer-list" aria-label="Company links">
                    <a href={COMPANY_WEBSITE_URL} target="_blank" rel="noreferrer">VajraCognixia</a>
                    <a href="#contact">Partnerships</a>
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
                    Get updates from The Vajra on launch news, careers, and product announcements.
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

              <div className="area-footer-bottom">
                <div className="area-footer-legal">
                  <a href="/privacy">Privacy</a>
                  <a href="/terms">Terms</a>
                  <a href="/careers">Careers</a>
                </div>
                <div>Copyright {new Date().getFullYear()} The VajraCognixia Technologies Private Limited</div>
              </div>
            </div>
          </footer>
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

            <button className="login-social-btn" onClick={handleGoogleLogin} disabled={loading}>
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
              By continuing, you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.
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
    </>
  );
}
