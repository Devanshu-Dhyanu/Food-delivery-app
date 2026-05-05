import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ArrowUpRight,
  BatteryFull,
  Bell,
  Briefcase,
  Check,
  ChevronRight,
  Clock3,
  Globe2,
  Home,
  Instagram,
  Mail,
  MessageCircle,
  Menu,
  MapPin,
  Package,
  Search,
  ShieldCheck,
  SignalHigh,
  Sparkles,
  Store,
  Users,
  UserCircle2,
  Wifi,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { applyDefaultSeo } from '../lib/seo';

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

const getMockPhoneTime = () =>
  new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata',
  }).format(new Date());

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

type ShowcaseSideCard = {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  image?: string;
  tone?: 'soft' | 'accent';
};

const showcaseSideCards: ShowcaseSideCard[] = [
  {
    title: 'Track order live',
    subtitle: 'Follow every dispatch step with clearer delivery visibility.',
    icon: MapPin,
    tone: 'soft',
  },
  {
    title: 'Food delivery',
    subtitle: 'Show restaurant menus, delivery tracking, and fast ordering in one clean flow.',
    image: '/founder.png',
  },
  {
    title: 'AI support',
    subtitle: 'Ask about The Vajra, careers, founder details, or any general question.',
    icon: ShieldCheck,
    tone: 'accent',
  },
  {
    title: 'Marketplace',
    subtitle: 'Highlight product listings, buyer-seller discovery, and trusted commerce signals.',
    icon: Briefcase,
    tone: 'soft',
  },
  {
    title: 'Everyday services',
    subtitle: 'Present transport, support, and connected service access in one ecosystem.',
    image: '/area/podium.png',
  },
  {
    title: 'Launch access',
    subtitle: 'Join early and stay close to a smarter platform for delivery, marketplace, and daily services.',
    icon: Zap,
    tone: 'accent',
  },
] as const;

const showcasePhoneHighlights = [
  'Food delivery, marketplace, and services in one app',
  'Support assistant available now',
  'Smart delivery and everyday convenience in one flow',
] as const;

const showcaseCommunityPosts = [
  {
    author: 'Aarav Jain',
    avatar: '/founder.png',
    title: 'Campus creators meetup',
    time: '2m ago',
    body: 'See founder notes, seller stories, and launch updates shared in one active community stream.',
    metric: '184 joined',
    replies: '26 replies',
    image: '/area/podium.png',
  },
  {
    author: 'Neha Verma',
    avatar: '/founder.png',
    title: 'Marketplace buzz',
    time: '11m ago',
    body: 'Trending listings, local demand, and quick buyer activity keep the platform feeling alive.',
    metric: '92 posts',
    replies: '14 comments',
    image: '/area/vajra-hero-drone.jpg',
  },
] as const;

const showcaseSupportItems = [
  {
    title: 'Track my order',
    body: 'Live ETA, rider visibility, and issue updates in a single help thread.',
    tone: 'primary',
  },
  {
    title: 'Payments and refunds',
    body: 'Quick answers for failed payments, refund status, and wallet credits.',
    tone: 'soft',
  },
  {
    title: 'Seller and service help',
    body: 'Listing support, account review, and service onboarding from one place.',
    tone: 'soft',
  },
] as const;

const showcaseQuickActions = [
  { label: 'Food', icon: Package },
  { label: 'Sell', icon: Store },
  { label: 'Ride', icon: MapPin },
  { label: 'Help', icon: MessageCircle },
] as const;

const showcaseHomeStats = [
  { label: 'Active orders', value: '24' },
  { label: 'Sellers live', value: '108' },
  { label: 'Avg ETA', value: '14m' },
] as const;

const showcaseOrderTimeline = [
  { title: 'Order placed', body: 'Paneer wrap combo confirmed for Sector 14.' },
  { title: 'Kitchen preparing', body: 'Estimated dispatch in 6 minutes.' },
  { title: 'Rider assigned', body: 'Arjun is heading to pickup now.' },
] as const;

const showcaseSupportReplies = ['Track order', 'Refund update', 'Talk to support'] as const;

type ShowcaseTab = 'home' | 'community' | 'support';

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
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<ShowcaseTab>('home');
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
  const [mockPhoneTime, setMockPhoneTime] = useState(getMockPhoneTime);
  const benefitsVideoRef = useRef<HTMLVideoElement | null>(null);
  const benefitsVideoStageRef = useRef<HTMLDivElement | null>(null);
  const showcaseScrollRef = useRef<HTMLDivElement | null>(null);
  const redirectTo = `${window.location.origin}/auth/callback`;

  const handleShowcaseTabChange = (tab: ShowcaseTab) => {
    setActiveShowcaseTab(tab);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    showcaseScrollRef.current?.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  useEffect(() => {
    applyDefaultSeo();
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
    const syncMockPhoneTime = () => {
      setMockPhoneTime(getMockPhoneTime());
    };

    syncMockPhoneTime();
    const timer = window.setInterval(syncMockPhoneTime, 60_000);

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

        .area-showcase {
          position: relative;
          padding: 76px 0 88px;
          overflow: hidden;
        }

        .area-showcase::before {
          content: '';
          position: absolute;
          inset: 18% 12% auto;
          height: 58%;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(217, 226, 194, 0.68) 0%, rgba(248, 246, 240, 0) 72%);
          pointer-events: none;
          filter: blur(18px);
        }

        .area-showcase-head {
          max-width: 760px;
          margin: 0 auto 42px;
          text-align: center;
        }

        .area-showcase-head .area-title {
          margin: 18px 0 18px;
          font-size: clamp(3rem, 5vw, 4.2rem);
          line-height: 0.98;
        }

        .area-showcase-head .area-copy {
          max-width: 680px;
          margin: 0 auto;
        }

        .area-showcase-stage {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
          align-items: center;
          gap: 22px;
        }

        .area-showcase-column {
          display: grid;
          gap: 22px;
        }

        .area-showcase-column.is-left {
          padding-right: 14px;
        }

        .area-showcase-column.is-right {
          padding-left: 14px;
        }

        .area-showcase-card {
          display: grid;
          grid-template-columns: 92px minmax(0, 1fr);
          align-items: stretch;
          min-height: 168px;
          border: 1px solid rgba(17, 17, 17, 0.08);
          border-radius: 32px;
          background: rgba(255, 253, 248, 0.84);
          box-shadow: 0 18px 44px rgba(17, 17, 17, 0.08);
          overflow: hidden;
          backdrop-filter: blur(12px);
        }

        .area-showcase-card-media {
          position: relative;
          min-height: 100%;
          background: linear-gradient(135deg, #dce9b6, #f4ebd4);
        }

        .area-showcase-card-media img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .area-showcase-card-media.is-soft {
          background: linear-gradient(135deg, rgba(220, 233, 182, 0.94), rgba(255, 253, 248, 0.82));
        }

        .area-showcase-card-media.is-accent {
          background: linear-gradient(135deg, rgba(95, 118, 22, 0.94), rgba(129, 152, 51, 0.92));
        }

        .area-showcase-card-icon {
          position: absolute;
          inset: 50% auto auto 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 54px;
          height: 54px;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 255, 255, 0.88);
          color: #223006;
          box-shadow: 0 14px 26px rgba(17, 17, 17, 0.12);
        }

        .area-showcase-card-copy {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 10px;
          padding: 20px 20px 22px;
        }

        .area-showcase-card-copy h3 {
          font-size: 1.55rem;
          line-height: 1.05;
          letter-spacing: -0.05em;
        }

        .area-showcase-card-copy p {
          color: var(--area-muted);
          font-size: 14px;
          line-height: 1.65;
        }

        .area-showcase-device-wrap {
          position: relative;
          display: flex;
          justify-content: center;
          padding: 10px 6px;
        }

        .area-showcase-device-glow {
          position: absolute;
          inset: 16% 8% 12%;
          background: radial-gradient(circle, rgba(243, 239, 228, 0.96) 0%, rgba(243, 239, 228, 0.1) 72%, rgba(243, 239, 228, 0) 100%);
          filter: blur(14px);
          pointer-events: none;
        }

        .area-showcase-device {
          position: relative;
          width: min(100%, 356px);
          padding: 12px;
          border-radius: 42px;
          background: linear-gradient(180deg, #1f1f1d 0%, #050505 100%);
          box-shadow:
            0 28px 60px rgba(17, 17, 17, 0.22),
            inset 0 0 0 2px rgba(255, 255, 255, 0.08);
          overflow: hidden;
        }

        .area-showcase-device::before {
          content: '';
          position: absolute;
          inset: 10px 12px auto auto;
          width: 38%;
          height: 22%;
          border-radius: 999px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.24), rgba(255, 255, 255, 0));
          filter: blur(8px);
          opacity: 0.6;
          pointer-events: none;
        }

        .area-showcase-device-screen {
          position: relative;
          height: 660px;
          padding: 20px 16px 14px;
          border-radius: 34px;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 244, 236, 0.98)),
            #ffffff;
          overflow: hidden;
        }

        .area-showcase-device-screen::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 20% 12%, rgba(111, 78, 246, 0.09), transparent 28%),
            radial-gradient(circle at 82% 18%, rgba(164, 198, 73, 0.14), transparent 20%);
          pointer-events: none;
        }

        .area-showcase-device-body {
          position: relative;
          height: calc(100% - 92px);
          padding-bottom: 66px;
        }

        .area-showcase-device-scroll {
          height: 100%;
          padding: 2px 2px 18px;
          overflow-y: auto;
          overscroll-behavior: contain;
          scrollbar-width: none;
        }

        .area-showcase-device-scroll::-webkit-scrollbar {
          display: none;
        }

        .area-showcase-device-panel {
          display: grid;
          gap: 14px;
          animation: areaShowcasePanelIn 220ms ease;
        }

        .area-showcase-scroll-fade {
          position: absolute;
          left: 0;
          right: 0;
          height: 26px;
          pointer-events: none;
          z-index: 2;
        }

        .area-showcase-scroll-fade.is-top {
          top: 0;
          background: linear-gradient(180deg, rgba(249, 247, 241, 0.96), rgba(249, 247, 241, 0));
        }

        .area-showcase-scroll-fade.is-bottom {
          bottom: 64px;
          background: linear-gradient(0deg, rgba(249, 247, 241, 0.98), rgba(249, 247, 241, 0));
        }

        @keyframes areaShowcasePanelIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .area-showcase-notch {
          position: absolute;
          top: 12px;
          left: 50%;
          width: 124px;
          height: 28px;
          border-radius: 999px;
          background: #050505;
          transform: translateX(-50%);
          box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.06);
        }

        .area-showcase-status {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 10px;
          margin-bottom: 14px;
          color: #111111;
          font-size: 15px;
          font-weight: 700;
        }

        .area-showcase-status-right {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .area-showcase-status-battery {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 7px;
          border-radius: 999px;
          background: rgba(17, 17, 17, 0.06);
          font-size: 11px;
          font-weight: 700;
        }

        .area-showcase-appbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .area-showcase-appbar-copy {
          display: grid;
          gap: 4px;
        }

        .area-showcase-wordmark {
          color: #6f4ef6;
          font-size: 1.72rem;
          font-weight: 800;
          letter-spacing: -0.06em;
        }

        .area-showcase-subtitle {
          color: #77736d;
          font-size: 12px;
          font-weight: 600;
        }

        .area-showcase-appicons {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .area-showcase-appicon {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: 1px solid rgba(17, 17, 17, 0.08);
          border-radius: 50%;
          color: #252525;
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 6px 14px rgba(17, 17, 17, 0.06);
        }

        .area-showcase-appicon-badge {
          position: absolute;
          top: 1px;
          right: 1px;
          width: 9px;
          height: 9px;
          border: 2px solid #ffffff;
          border-radius: 50%;
          background: #6f4ef6;
        }

        .area-showcase-feed-card {
          border: 1px solid rgba(17, 17, 17, 0.08);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 10px 24px rgba(17, 17, 17, 0.05);
          overflow: hidden;
        }

        .area-showcase-feed-card + .area-showcase-feed-card {
          margin-top: 16px;
        }

        .area-showcase-feed-head {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 18px 10px;
        }

        .area-showcase-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          object-fit: cover;
        }

        .area-showcase-feed-name {
          color: #111111;
          font-size: 1rem;
          font-weight: 700;
        }

        .area-showcase-feed-time {
          color: #8d8d88;
          font-size: 12px;
        }

        .area-showcase-feed-text {
          padding: 0 18px 14px;
          color: #373731;
          font-size: 13px;
          line-height: 1.6;
        }

        .area-showcase-feed-image {
          display: block;
          width: calc(100% - 28px);
          height: 206px;
          margin: 0 auto;
          border-radius: 20px;
          object-fit: cover;
        }

        .area-showcase-feed-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px 18px;
        }

        .area-showcase-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 36px;
          padding: 0 14px;
          border: 1px solid rgba(17, 17, 17, 0.08);
          border-radius: 999px;
          color: #3c3c38;
          font-size: 14px;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.94);
        }

        .area-showcase-quick-actions {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .area-showcase-quick-action {
          display: grid;
          justify-items: center;
          gap: 8px;
          padding: 12px 8px;
          border: 1px solid rgba(17, 17, 17, 0.08);
          border-radius: 20px;
          color: #36352f;
          font-size: 12px;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.82);
          box-shadow: 0 10px 24px rgba(17, 17, 17, 0.04);
          transition: transform 180ms ease, box-shadow 180ms ease;
        }

        .area-showcase-quick-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(17, 17, 17, 0.08);
        }

        .area-showcase-quick-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 14px;
          color: #6f4ef6;
          background: rgba(111, 78, 246, 0.08);
        }

        .area-showcase-order-card {
          padding: 18px;
          border: 1px solid rgba(17, 17, 17, 0.08);
          border-radius: 24px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(244, 240, 233, 0.94));
          box-shadow: 0 12px 28px rgba(17, 17, 17, 0.06);
        }

        .area-showcase-order-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .area-showcase-order-eyebrow {
          color: #77736d;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .area-showcase-order-head h3 {
          margin-top: 6px;
          color: #171717;
          font-size: 1.05rem;
          font-weight: 700;
        }

        .area-showcase-order-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 10px;
          border-radius: 999px;
          color: #6f4ef6;
          font-size: 12px;
          font-weight: 700;
          background: rgba(111, 78, 246, 0.1);
        }

        .area-showcase-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 16px;
        }

        .area-showcase-stat {
          padding: 12px 10px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.82);
        }

        .area-showcase-stat-value {
          color: #111111;
          font-size: 1rem;
          font-weight: 800;
        }

        .area-showcase-stat-label {
          margin-top: 4px;
          color: #7b7771;
          font-size: 11px;
          line-height: 1.35;
        }

        .area-showcase-order-timeline {
          display: grid;
          gap: 12px;
        }

        .area-showcase-order-step {
          display: grid;
          grid-template-columns: 22px minmax(0, 1fr);
          gap: 10px;
          align-items: start;
        }

        .area-showcase-order-step-dot {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          color: #6f4ef6;
          background: rgba(111, 78, 246, 0.1);
        }

        .area-showcase-order-step-dot::after {
          content: '';
          position: absolute;
          top: 22px;
          left: 50%;
          width: 1px;
          height: calc(100% + 14px);
          background: rgba(111, 78, 246, 0.18);
          transform: translateX(-50%);
        }

        .area-showcase-order-step:last-child .area-showcase-order-step-dot::after {
          display: none;
        }

        .area-showcase-order-step-title {
          color: #161616;
          font-size: 13px;
          font-weight: 700;
        }

        .area-showcase-order-step-body {
          margin-top: 3px;
          color: #6f6b64;
          font-size: 12px;
          line-height: 1.5;
        }

        .area-showcase-highlight {
          position: relative;
          margin-top: 0;
          padding: 16px 16px 18px;
          border-radius: 24px;
          background: linear-gradient(135deg, #6f4ef6, #8b6fff);
          color: #ffffff;
          overflow: hidden;
        }

        .area-showcase-highlight::after {
          content: '';
          position: absolute;
          right: -18px;
          bottom: -18px;
          width: 108px;
          height: 108px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.12);
        }

        .area-showcase-highlight-label {
          display: inline-flex;
          margin-bottom: 12px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          opacity: 0.84;
        }

        .area-showcase-highlight h3 {
          max-width: 14ch;
          margin-bottom: 14px;
          font-size: 1.9rem;
          line-height: 0.98;
          letter-spacing: -0.05em;
        }

        .area-showcase-highlight-list {
          display: grid;
          gap: 10px;
          position: relative;
          z-index: 1;
        }

        .area-showcase-highlight-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          line-height: 1.45;
        }

        .area-showcase-highlight-item::before {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.88);
        }

        .area-showcase-bottom-nav {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 14px;
          padding: 14px 8px 2px;
        }

        .area-showcase-bottom-nav button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          height: 38px;
          border: 1px solid rgba(17, 17, 17, 0.08);
          border-radius: 999px;
          color: #8d8d88;
          font-size: 12px;
          font-weight: 600;
          text-align: center;
          background: rgba(255, 255, 255, 0.9);
          transition: all 180ms ease;
          cursor: pointer;
        }

        .area-showcase-bottom-nav button:hover {
          transform: translateY(-1px);
        }

        .area-showcase-bottom-nav button.is-active {
          color: #6f4ef6;
          border-color: rgba(111, 78, 246, 0.18);
          background: rgba(111, 78, 246, 0.08);
          box-shadow: inset 0 0 0 1px rgba(111, 78, 246, 0.08);
        }

        .area-showcase-panel-stack {
          display: grid;
          gap: 14px;
        }

        .area-showcase-community-card {
          overflow: hidden;
          border: 1px solid rgba(17, 17, 17, 0.08);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 10px 24px rgba(17, 17, 17, 0.05);
        }

        .area-showcase-community-thumb {
          width: 100%;
          height: 118px;
          object-fit: cover;
        }

        .area-showcase-community-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 16px 18px 10px;
        }

        .area-showcase-community-author {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .area-showcase-community-author img {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          object-fit: cover;
        }

        .area-showcase-community-title {
          color: #151515;
          font-size: 0.94rem;
          font-weight: 700;
        }

        .area-showcase-community-time {
          color: #8d8d88;
          font-size: 12px;
        }

        .area-showcase-community-body {
          padding: 0 18px;
          color: #45453f;
          font-size: 13px;
          line-height: 1.6;
        }

        .area-showcase-community-stats {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px 18px;
        }

        .area-showcase-community-metric {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 999px;
          color: #4b4741;
          font-size: 12px;
          font-weight: 700;
          background: rgba(17, 17, 17, 0.05);
        }

        .area-showcase-community-metric.is-accent {
          color: #6f4ef6;
          background: rgba(111, 78, 246, 0.09);
        }

        .area-showcase-support-card {
          padding: 16px 18px;
          border: 1px solid rgba(17, 17, 17, 0.08);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.94);
          box-shadow: 0 10px 24px rgba(17, 17, 17, 0.05);
        }

        .area-showcase-support-card.is-primary {
          color: #ffffff;
          border-color: transparent;
          background: linear-gradient(135deg, #6f4ef6, #8b6fff);
        }

        .area-showcase-support-label {
          display: inline-flex;
          margin-bottom: 10px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          opacity: 0.78;
        }

        .area-showcase-support-card h3 {
          margin-bottom: 10px;
          font-size: 1rem;
          font-weight: 700;
        }

        .area-showcase-support-card p {
          font-size: 13px;
          line-height: 1.6;
          color: inherit;
        }

        .area-showcase-support-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 16px 18px;
          border: 1px solid rgba(17, 17, 17, 0.08);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.94);
          box-shadow: 0 10px 24px rgba(17, 17, 17, 0.05);
        }

        .area-showcase-support-presence {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .area-showcase-support-presence-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #6dbd45;
          box-shadow: 0 0 0 6px rgba(109, 189, 69, 0.12);
        }

        .area-showcase-support-presence h3 {
          color: #181818;
          font-size: 0.98rem;
          font-weight: 700;
        }

        .area-showcase-support-presence p {
          color: #7c786f;
          font-size: 12px;
        }

        .area-showcase-support-chat {
          display: grid;
          gap: 10px;
        }

        .area-showcase-chat-bubble {
          max-width: 86%;
          padding: 12px 14px;
          border-radius: 18px;
          font-size: 13px;
          line-height: 1.55;
          box-shadow: 0 8px 20px rgba(17, 17, 17, 0.05);
        }

        .area-showcase-chat-bubble.is-user {
          margin-left: auto;
          border-bottom-right-radius: 6px;
          color: #ffffff;
          background: linear-gradient(135deg, #6f4ef6, #8b6fff);
        }

        .area-showcase-chat-bubble.is-assistant {
          border-bottom-left-radius: 6px;
          color: #2f2e29;
          background: rgba(255, 255, 255, 0.98);
        }

        .area-showcase-support-replies {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .area-showcase-support-reply {
          display: inline-flex;
          align-items: center;
          height: 34px;
          padding: 0 12px;
          border: 1px solid rgba(111, 78, 246, 0.16);
          border-radius: 999px;
          color: #6f4ef6;
          font-size: 12px;
          font-weight: 700;
          background: rgba(111, 78, 246, 0.06);
        }

        .area-showcase-support-typing {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #7b776f;
          font-size: 12px;
          font-weight: 600;
        }

        .area-showcase-support-typing span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #6f4ef6;
          animation: areaTypingPulse 1.2s infinite ease-in-out;
        }

        .area-showcase-support-typing span:nth-child(2) {
          animation-delay: 120ms;
        }

        .area-showcase-support-typing span:nth-child(3) {
          animation-delay: 240ms;
        }

        @keyframes areaTypingPulse {
          0%,
          80%,
          100% {
            opacity: 0.35;
            transform: scale(0.9);
          }

          40% {
            opacity: 1;
            transform: scale(1);
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
          .area-testimonial-grid,
          .area-showcase-stage {
            grid-template-columns: 1fr;
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

          .area-steps {
            grid-template-columns: 1fr;
          }

          .area-specs {
            padding-bottom: 70px;
          }

          .area-showcase {
            padding-top: 62px;
            padding-bottom: 72px;
          }

          .area-showcase-card {
            grid-template-columns: 82px minmax(0, 1fr);
            min-height: 148px;
          }

          .area-showcase-device {
            width: min(100%, 340px);
          }

          .area-showcase-device-screen {
            height: 620px;
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
          .area-showcase-head .area-title,
          .area-contact .area-title,
          .area-howto-head .area-title {
            font-size: clamp(2.6rem, 12vw, 3.8rem);
          }

          .area-benefit-card h3 {
            font-size: 1.75rem;
          }

          .area-feature,
          .area-specs,
          .area-showcase,
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

          .area-showcase-head {
            margin-bottom: 30px;
          }

          .area-showcase-stage {
            gap: 18px;
          }

          .area-showcase-column {
            gap: 18px;
          }

          .area-showcase-card {
            grid-template-columns: 1fr;
            min-height: auto;
          }

          .area-showcase-card-media {
            min-height: 124px;
          }

          .area-showcase-card-copy {
            padding: 18px 18px 20px;
          }

          .area-showcase-card-copy h3 {
            font-size: 1.4rem;
          }

          .area-showcase-device {
            width: min(100%, 296px);
            border-radius: 34px;
            padding: 10px;
          }

          .area-showcase-device-screen {
            height: 560px;
            padding: 18px 14px 12px;
            border-radius: 28px;
          }

          .area-showcase-notch {
            width: 104px;
            height: 24px;
          }

          .area-showcase-wordmark {
            font-size: 1.55rem;
          }

          .area-showcase-subtitle {
            font-size: 11px;
          }

          .area-showcase-appicons {
            gap: 8px;
          }

          .area-showcase-appicon {
            width: 32px;
            height: 32px;
          }

          .area-showcase-quick-actions,
          .area-showcase-stats {
            gap: 8px;
          }

          .area-showcase-quick-action,
          .area-showcase-stat {
            padding-left: 8px;
            padding-right: 8px;
          }

          .area-showcase-feed-image {
            width: calc(100% - 20px);
            height: 190px;
            border-radius: 20px;
          }

          .area-showcase-highlight h3 {
            font-size: 1.55rem;
          }

          .area-showcase-community-stats,
          .area-showcase-support-replies {
            flex-wrap: wrap;
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
          .area-benefits-audio-toggle,
          .area-showcase-device-panel,
          .area-showcase-quick-action,
          .area-showcase-bottom-nav button,
          .area-showcase-support-typing span {
            transition: none;
            animation: none;
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

            <section className="area-showcase" aria-labelledby="vajra-showcase-title">
              <div className="area-showcase-head">
                <p className="area-section-label">Inside The Experience</p>
                <h2 id="vajra-showcase-title" className="area-title">A closer look at how The Vajra could feel in your hand.</h2>
                <p className="area-copy">
                  Right after Why Vajra, this preview makes the platform feel tangible: support, careers, live tracking, and founder context all presented like one polished mobile flow.
                </p>
              </div>

              <div className="area-showcase-stage">
                <div className="area-showcase-column is-left">
                  {showcaseSideCards.slice(0, 3).map((card) => {
                    const Icon = card.icon;

                    return (
                      <article key={card.title} className="area-showcase-card">
                        <div className={`area-showcase-card-media ${card.tone ? `is-${card.tone}` : ''}`}>
                          {card.image ? (
                            <img src={card.image} alt={card.title} />
                          ) : Icon ? (
                            <span className="area-showcase-card-icon">
                              <Icon size={24} strokeWidth={1.9} />
                            </span>
                          ) : null}
                        </div>
                        <div className="area-showcase-card-copy">
                          <h3>{card.title}</h3>
                          <p>{card.subtitle}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div className="area-showcase-device-wrap">
                  <div className="area-showcase-device-glow" aria-hidden="true" />
                  <div className="area-showcase-device">
                    <div className="area-showcase-device-screen">
                      <div className="area-showcase-notch" aria-hidden="true" />

                      <div className="area-showcase-status">
                        <span>{mockPhoneTime}</span>
                        <div className="area-showcase-status-right" aria-hidden="true">
                          <SignalHigh size={14} strokeWidth={2.1} />
                          <Wifi size={14} strokeWidth={2.1} />
                          <span className="area-showcase-status-battery">
                            <BatteryFull size={14} strokeWidth={2} />
                            92%
                          </span>
                        </div>
                      </div>

                      <div className="area-showcase-appbar">
                        <div className="area-showcase-appbar-copy">
                          <div className="area-showcase-wordmark">The Vajra.</div>
                          <p className="area-showcase-subtitle">Your daily delivery layer</p>
                        </div>
                        <div className="area-showcase-appicons" aria-hidden="true">
                          <span className="area-showcase-appicon">
                            <Search size={16} strokeWidth={2.2} />
                          </span>
                          <span className="area-showcase-appicon">
                            <Bell size={16} strokeWidth={2.2} />
                            <span className="area-showcase-appicon-badge" />
                          </span>
                          <span className="area-showcase-appicon">
                            <UserCircle2 size={17} strokeWidth={2} />
                          </span>
                        </div>
                      </div>

                      <div className="area-showcase-device-body">
                        <div className="area-showcase-scroll-fade is-top" aria-hidden="true" />
                        <div className="area-showcase-scroll-fade is-bottom" aria-hidden="true" />

                        <div className="area-showcase-device-scroll" ref={showcaseScrollRef}>
                        {activeShowcaseTab === 'home' ? (
                          <div className="area-showcase-device-panel">
                            <div className="area-showcase-quick-actions">
                              {showcaseQuickActions.map(({ label, icon: Icon }) => (
                                <div key={label} className="area-showcase-quick-action">
                                  <span className="area-showcase-quick-icon">
                                    <Icon size={16} strokeWidth={2.1} />
                                  </span>
                                  <span>{label}</span>
                                </div>
                              ))}
                            </div>

                            <section className="area-showcase-order-card">
                              <div className="area-showcase-order-head">
                                <div>
                                  <span className="area-showcase-order-eyebrow">Live dispatch</span>
                                  <h3>Dinner order is moving</h3>
                                </div>
                                <span className="area-showcase-order-chip">
                                  <Clock3 size={13} strokeWidth={2.1} />
                                  14 min
                                </span>
                              </div>

                              <div className="area-showcase-stats">
                                {showcaseHomeStats.map((item) => (
                                  <div key={item.label} className="area-showcase-stat">
                                    <div className="area-showcase-stat-value">{item.value}</div>
                                    <div className="area-showcase-stat-label">{item.label}</div>
                                  </div>
                                ))}
                              </div>

                              <div className="area-showcase-order-timeline">
                                {showcaseOrderTimeline.map((item) => (
                                  <div key={item.title} className="area-showcase-order-step">
                                    <span className="area-showcase-order-step-dot">
                                      <Check size={12} strokeWidth={2.4} />
                                    </span>
                                    <div>
                                      <p className="area-showcase-order-step-title">{item.title}</p>
                                      <p className="area-showcase-order-step-body">{item.body}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </section>

                            <article className="area-showcase-feed-card">
                              <div className="area-showcase-feed-head">
                                <img
                                  src="/founder.png"
                                  alt="Founder profile"
                                  className="area-showcase-avatar"
                                />
                                <div>
                                  <p className="area-showcase-feed-name">Founder Signal</p>
                                  <p className="area-showcase-feed-time">12m ago</p>
                                </div>
                              </div>
                              <p className="area-showcase-feed-text">
                                Building one connected platform where ordering, marketplace access, and everyday services feel like one clean system.
                              </p>
                              <img
                                src="/area/vajra-hero-drone.jpg"
                                alt="Drone showcase preview"
                                className="area-showcase-feed-image"
                              />
                              <div className="area-showcase-feed-actions">
                                <span className="area-showcase-pill">12k</span>
                                <span className="area-showcase-pill">48</span>
                                <span className="area-showcase-pill">Share</span>
                              </div>
                            </article>

                            <div className="area-showcase-highlight">
                              <span className="area-showcase-highlight-label">Live inside Vajra</span>
                              <h3>Support, updates, and launch signals in one flow.</h3>
                              <div className="area-showcase-highlight-list">
                                {showcasePhoneHighlights.map((item) => (
                                  <div key={item} className="area-showcase-highlight-item">
                                    {item}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {activeShowcaseTab === 'community' ? (
                          <div className="area-showcase-device-panel">
                            {showcaseCommunityPosts.map((post) => (
                              <article key={post.title} className="area-showcase-community-card">
                                <img src={post.image} alt={post.title} className="area-showcase-community-thumb" />
                                <div className="area-showcase-community-meta">
                                  <div className="area-showcase-community-author">
                                    <img src={post.avatar} alt={post.author} />
                                    <div>
                                      <p className="area-showcase-community-title">{post.title}</p>
                                      <span className="area-showcase-community-time">{post.author} - {post.time}</span>
                                    </div>
                                  </div>
                                  <ChevronRight size={16} strokeWidth={2.1} color="#9b9791" />
                                </div>
                                <p className="area-showcase-community-body">{post.body}</p>
                                <div className="area-showcase-community-stats">
                                  <span className="area-showcase-community-metric is-accent">
                                    <Users size={13} strokeWidth={2.1} />
                                    {post.metric}
                                  </span>
                                  <span className="area-showcase-community-metric">
                                    <MessageCircle size={13} strokeWidth={2.1} />
                                    {post.replies}
                                  </span>
                                </div>
                              </article>
                            ))}
                          </div>
                        ) : null}

                        {activeShowcaseTab === 'support' ? (
                          <div className="area-showcase-device-panel">
                            <section className="area-showcase-support-header">
                              <div className="area-showcase-support-presence">
                                <span className="area-showcase-support-presence-dot" />
                                <div>
                                  <h3>Vajra Support AI</h3>
                                  <p>Instant help, order updates, seller guidance</p>
                                </div>
                              </div>
                              <Sparkles size={18} strokeWidth={2.1} color="#6f4ef6" />
                            </section>

                            <div className="area-showcase-support-chat">
                              <div className="area-showcase-chat-bubble is-user">
                                My order is late. Can you check the live status?
                              </div>
                              <div className="area-showcase-chat-bubble is-assistant">
                                Your rider has reached the restaurant and pickup is being packed now. Updated arrival is 14 minutes.
                              </div>
                            </div>

                            {showcaseSupportItems.map((item) => (
                              <article
                                key={item.title}
                                className={`area-showcase-support-card ${item.tone === 'primary' ? 'is-primary' : ''}`}
                              >
                                <span className="area-showcase-support-label">Quick help</span>
                                <h3>{item.title}</h3>
                                <p>{item.body}</p>
                              </article>
                            ))}

                            <div className="area-showcase-support-replies">
                              {showcaseSupportReplies.map((reply) => (
                                <span key={reply} className="area-showcase-support-reply">
                                  {reply}
                                </span>
                              ))}
                            </div>

                            <div className="area-showcase-support-typing" aria-hidden="true">
                              <span />
                              <span />
                              <span />
                              Support is typing...
                            </div>
                          </div>
                        ) : null}

                        <div className="area-showcase-bottom-nav" role="tablist" aria-label="Phone preview tabs">
                          <button
                            type="button"
                            className={activeShowcaseTab === 'home' ? 'is-active' : ''}
                            onClick={() => handleShowcaseTabChange('home')}
                            aria-selected={activeShowcaseTab === 'home'}
                          >
                            <Home size={14} strokeWidth={2.15} />
                            <span>Home</span>
                          </button>
                          <button
                            type="button"
                            className={activeShowcaseTab === 'community' ? 'is-active' : ''}
                            onClick={() => handleShowcaseTabChange('community')}
                            aria-selected={activeShowcaseTab === 'community'}
                          >
                            <Users size={14} strokeWidth={2.15} />
                            <span>Community</span>
                          </button>
                          <button
                            type="button"
                            className={activeShowcaseTab === 'support' ? 'is-active' : ''}
                            onClick={() => handleShowcaseTabChange('support')}
                            aria-selected={activeShowcaseTab === 'support'}
                          >
                            <MessageCircle size={14} strokeWidth={2.15} />
                            <span>Support</span>
                          </button>
                        </div>
                      </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="area-showcase-column is-right">
                  {showcaseSideCards.slice(3).map((card) => {
                    const Icon = card.icon;

                    return (
                      <article key={card.title} className="area-showcase-card">
                        <div className={`area-showcase-card-media ${card.tone ? `is-${card.tone}` : ''}`}>
                          {card.image ? (
                            <img src={card.image} alt={card.title} />
                          ) : Icon ? (
                            <span className="area-showcase-card-icon">
                              <Icon size={24} strokeWidth={1.9} />
                            </span>
                          ) : null}
                        </div>
                        <div className="area-showcase-card-copy">
                          <h3>{card.title}</h3>
                          <p>{card.subtitle}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="area-testimonial">
              <div className="area-testimonial-grid">
                <img src="/area/balance.png" alt="Abstract balance sculpture representing precision and control in delivery operations" className="area-testimonial-image" />

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

              <a href="/support" className="area-button area-support-cta area-contact-button">
                Get Support
                <Mail size={16} />
              </a>
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
                    The Vajra powers smart delivery, online marketplace access, and everyday services in one modern platform.
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
    </>
  );
}
