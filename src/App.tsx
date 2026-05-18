import { useEffect, useReducer, useState } from 'react';
import { VAJRA_INTERNAL_PATH_CHANGE_EVENT } from './lib/vajraNavigationEvents';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import RestaurantList from './components/RestaurantList';
import RestaurantMenu from './components/RestaurantMenu';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderTracking from './components/OrderTracking';
import AnnouncementsScreen from './components/AnnouncementsScreen';
import Login from './components/Login';
import AuthCallback from './components/AuthCallback';
import Onboarding from './components/Onboarding';
import Footer from './components/Footer';
import SmartTabTitle from './components/SmartTabTitle';
import ContinueOrderPill from './components/ContinueOrderPill';
import Profile from './components/Profile';
import FounderPage from './components/FounderPage';
import BrandedLoader from './components/BrandedLoader';
import ContactUs from './components/ContactUs';
import JobApplication from './components/JobApplication';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsAndConditions';
import RefundCancellationPolicy from './components/RefundCancellationPolicy';
import ShippingPolicy from './components/ShippingPolicy';
import SupportChatPage from './components/SupportChatPage';
import PaymentCallback from './components/PaymentCallback';
import DeliveryPartnerHub from './components/DeliveryPartnerHub';
import PostLoginServiceHub from './components/PostLoginServiceHub';
import StandaloneAuthPage from './components/StandaloneAuthPage';
import FeelItPage from './components/FeelItPage';
import { DeliveryVoiceCallProvider } from './context/DeliveryVoiceCallContext';
import { logAdminSignInEvent } from './lib/adminActivity';
import {
  DELIVERY_APP_MODE_STORAGE_KEY,
  DELIVERY_ACTIVE_TRIP_LOCK_STATUSES,
  DELIVERY_MODE_SYNC_INTERVAL,
  normalizeDeliveryAccountMode,
} from './lib/deliveryPartner';
import { supabase, Announcement, type DeliveryPartnerAccountMode } from './lib/supabase';

type Page =
  | 'service-hub'
  | 'home'
  | 'car-rent'
  | 'second-hand-market'
  | 'taxi'
  | 'menu'
  | 'cart'
  | 'checkout'
  | 'orders'
  | 'order-placed'
  | 'announcements'
  | 'profile'
  | 'founder'
  | 'careers'
  | 'contact-us'
  | 'terms-conditions'
  | 'privacy-policy'
  | 'refund-cancellation'
  | 'shipping-policy'
  | 'payment-callback'
  | 'support';
type AppMode = DeliveryPartnerAccountMode;

const ANNOUNCEMENT_DISMISS_KEY = 'vc_dismissed_announcements';
const FOUNDER_PATHS = ['/founder', '/about-founder', '/about-vajra'] as const;
const CAREERS_PATHS = ['/careers', '/apply', '/job-application'] as const;
const TERMS_PATHS = ['/terms', '/terms-conditions'] as const;
const PRIVACY_PATHS = ['/privacy', '/privacy-policy'] as const;
const REFUND_PATHS = ['/refund-cancellation', '/refund-cancellation-policy'] as const;
const SHIPPING_PATHS = ['/shipping-policy', '/shipping'] as const;
const SUPPORT_PATHS = ['/support', '/get-support'] as const;
const CONTACT_US_PATHS = ['/contact-us', '/contact'] as const;
const FEEL_IT_PATHS = ['/feel-it'] as const;
const TEAM_PATHS = ['/team', '/our-team'] as const;
const LOGIN_PATHS = ['/login', '/sign-in'] as const;
const SIGNUP_PATHS = ['/signup', '/sign-up', '/register'] as const;

const getInitialPageFromPath = (): Page => {
  const pathname = window.location.pathname.toLowerCase();

  if (FOUNDER_PATHS.includes(pathname as (typeof FOUNDER_PATHS)[number])) {
    return 'founder';
  }

  if (CAREERS_PATHS.includes(pathname as (typeof CAREERS_PATHS)[number])) {
    return 'careers';
  }

  if (TERMS_PATHS.includes(pathname as (typeof TERMS_PATHS)[number])) {
    return 'terms-conditions';
  }

  if (PRIVACY_PATHS.includes(pathname as (typeof PRIVACY_PATHS)[number])) {
    return 'privacy-policy';
  }

  if (REFUND_PATHS.includes(pathname as (typeof REFUND_PATHS)[number])) {
    return 'refund-cancellation';
  }

  if (SHIPPING_PATHS.includes(pathname as (typeof SHIPPING_PATHS)[number])) {
    return 'shipping-policy';
  }

  if (SUPPORT_PATHS.includes(pathname as (typeof SUPPORT_PATHS)[number])) {
    return 'support';
  }

  if (CONTACT_US_PATHS.includes(pathname as (typeof CONTACT_US_PATHS)[number])) {
    return 'contact-us';
  }

  if (FEEL_IT_PATHS.includes(pathname as (typeof FEEL_IT_PATHS)[number])) {
    return 'service-hub';
  }

  return 'service-hub';
};

const priorityRank: Record<Announcement['priority'], number> = {
  high: 0,
  normal: 1,
  low: 2,
};

const sortAnnouncements = (items: Announcement[]) =>
  [...items].sort((a, b) => {
    const priorityDifference = priorityRank[a.priority] - priorityRank[b.priority];

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

function App() {
  /** Re-read path-based gates (e.g. leave /founder → /) without full reload */
  const [, syncPathToReact] = useReducer((v: number) => v + 1, 0);

  useEffect(() => {
    const bump = () => {
      
      syncPathToReact();
    };
    window.addEventListener('popstate', bump);
    window.addEventListener(VAJRA_INTERNAL_PATH_CHANGE_EVENT, bump);
    return () => {
      window.removeEventListener('popstate', bump);
      window.removeEventListener(VAJRA_INTERNAL_PATH_CHANGE_EVENT, bump);
    };
  }, []);

  const [currentPage, setCurrentPage] = useState<Page>(() => getInitialPageFromPath());
  const [appMode, setAppMode] = useState<AppMode>(() => {
    try {
      return window.localStorage.getItem(DELIVERY_APP_MODE_STORAGE_KEY) === 'delivery'
        ? 'delivery'
        : 'customer';
    } catch {
      return 'customer';
    }
  });
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [placedOrderId, setPlacedOrderId] = useState<string>('');
  const [appModeBusy, setAppModeBusy] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userDisplayName, setUserDisplayName] = useState('');
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [dismissedAnnouncementIds, setDismissedAnnouncementIds] = useState<string[]>(() => {
    try {
      const storedValue = window.localStorage.getItem(ANNOUNCEMENT_DISMISS_KEY);
      return storedValue ? JSON.parse(storedValue) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let isMounted = true;
    // Keep the branded splash visible slightly longer for a cinematic feel
    // without freezing the UI — this is a gentle increase from 2s → 3.8s.
    const loadingFallback = window.setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 3800);

    const loadUserProfile = async (userId: string) => {
      if (!isMounted) return;

      try {
        const [{ data, error }, { data: deliveryPartnerData, error: deliveryPartnerError }] =
          await Promise.all([
            supabase
              .from('user_profiles')
              .select('id, name, avatar_url')
              .eq('user_id', userId)
              .maybeSingle(),
            supabase
              .from('delivery_partner_profiles')
              .select('account_mode')
              .eq('user_id', userId)
              .maybeSingle(),
          ]);

        if (!isMounted) return;

        if (error) {
          console.error('Error checking user profile:', error);
          setHasProfile(false);
          return;
        }

        if (deliveryPartnerError) {
          console.error('Error checking delivery account mode:', deliveryPartnerError);
        } else {
          setAppMode(
            deliveryPartnerData
              ? normalizeDeliveryAccountMode(
                (deliveryPartnerData as { account_mode?: string | null }).account_mode
              )
              : 'customer'
          );
        }

        setUserDisplayName(data?.name?.trim() ?? '');
        setUserAvatarUrl(data?.avatar_url ?? null);
        setHasProfile(!!data);
      } catch (error) {
        console.error('Unexpected error checking user profile:', error);
        if (isMounted) {
          setUserDisplayName('');
          setUserAvatarUrl(null);
          setHasProfile(false);
        }
      }
    };

    const syncSession = (session: any) => {
      if (!isMounted) return;

      const nextUser = session?.user ?? null;
      setUser(nextUser);
      const fallbackName =
        nextUser?.user_metadata?.full_name ||
        nextUser?.user_metadata?.name ||
        nextUser?.email?.split('@')?.[0] ||
        '';
      const fallbackAvatarUrl =
        typeof nextUser?.user_metadata?.avatar_url === 'string'
          ? nextUser.user_metadata.avatar_url
          : null;

      if (!nextUser) {
        setAppMode('customer');
        setUserDisplayName('');
        setUserAvatarUrl(null);
        setHasProfile(false);
        setLoading(false);
        return;
      }

      setUserDisplayName(fallbackName);
      setUserAvatarUrl(fallbackAvatarUrl);
      setHasProfile(null);
      setLoading(false);
      void loadUserProfile(nextUser.id);
    };

    const loadSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        syncSession(session);
      } catch (error) {
        console.error('Error loading auth session:', error);
        if (isMounted) {
          setUser(null);
          setUserDisplayName('');
          setUserAvatarUrl(null);
          setHasProfile(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      syncSession(session);

      if (event === 'SIGNED_IN' && session?.user) {
        void logAdminSignInEvent(session.user);
      }
    });

    return () => {
      isMounted = false;
      window.clearTimeout(loadingFallback);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(ANNOUNCEMENT_DISMISS_KEY, JSON.stringify(dismissedAnnouncementIds));
    } catch (error) {
      console.error('Error saving dismissed announcements:', error);
    }
  }, [dismissedAnnouncementIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(DELIVERY_APP_MODE_STORAGE_KEY, appMode);
    } catch (error) {
      console.error('Error saving app mode preference:', error);
    }
  }, [appMode]);

  useEffect(() => {
    setCurrentPage(appMode === 'delivery' ? 'home' : 'service-hub');
  }, [appMode]);

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      setAnnouncements([]);
      setAnnouncementsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const fetchAnnouncements = async () => {
      setAnnouncementsLoading(true);

      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          // We intentionally show only broad announcements until audience targeting is implemented.
          .eq('audience_type', 'all_users')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const now = Date.now();
        const activeAnnouncements = (data || []).filter((announcement) => {
          const startsAt = announcement.starts_at ? new Date(announcement.starts_at).getTime() : null;
          const expiresAt = announcement.expires_at ? new Date(announcement.expires_at).getTime() : null;

          return (startsAt === null || startsAt <= now) && (expiresAt === null || expiresAt > now);
        }) as Announcement[];

        if (isMounted) {
          setAnnouncements(sortAnnouncements(activeAnnouncements));
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);

        if (isMounted) {
          setAnnouncements([]);
        }
      } finally {
        if (isMounted) {
          setAnnouncementsLoading(false);
        }
      }
    };

    void fetchAnnouncements();

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;

    const syncAccountMode = async () => {
      try {
        const { data, error } = await supabase
          .from('delivery_partner_profiles')
          .select('account_mode')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!isMounted || error || !data) {
          return;
        }

        const nextMode = normalizeDeliveryAccountMode(
          (data as { account_mode?: string | null }).account_mode
        );

        setAppMode((currentMode) => (currentMode === nextMode ? currentMode : nextMode));
      } catch (error) {
        console.error('Error syncing account delivery mode:', error);
      }
    };

    void syncAccountMode();
    const interval = window.setInterval(() => {
      void syncAccountMode();
    }, DELIVERY_MODE_SYNC_INTERVAL);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void syncAccountMode();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const handleNavigate = (page: string) => {
    if (
      page === 'service-hub' ||
      page === 'home' ||
      page === 'car-rent' ||
      page === 'second-hand-market' ||
      page === 'taxi' ||
      page === 'menu' ||
      page === 'cart' ||
      page === 'checkout' ||
      page === 'orders' ||
      page === 'order-placed' ||
      page === 'announcements' ||
      page === 'profile' ||
      page === 'founder' ||
      page === 'careers' ||
      page === 'contact-us' ||
      page === 'terms-conditions' ||
      page === 'privacy-policy' ||
      page === 'refund-cancellation' ||
      page === 'shipping-policy' ||
      page === 'support'
    ) {
      setCurrentPage(page);
    }
  };

  const handleDismissAnnouncement = (announcementId: string) => {
    setDismissedAnnouncementIds((prev) =>
      prev.includes(announcementId) ? prev : [...prev, announcementId]
    );
  };

  const handleToggleAppMode = async () => {
    if (appModeBusy) {
      return;
    }

    const nextMode: AppMode = appMode === 'customer' ? 'delivery' : 'customer';

    setAppModeBusy(true);

    try {
      const { data: deliveryPartnerData, error } = await supabase
        .from('delivery_partner_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!deliveryPartnerData) {
        setAppMode(nextMode);
        return;
      }

      if (nextMode === 'customer') {
        const { data: activeTripData, error: activeTripError } = await supabase
          .from('orders')
          .select('id')
          .eq('delivery_partner_user_id', user.id)
          .in('delivery_assignment_status', DELIVERY_ACTIVE_TRIP_LOCK_STATUSES)
          .limit(1);

        if (activeTripError) {
          throw activeTripError;
        }

        if ((activeTripData?.length ?? 0) > 0) {
          window.alert(
            'Accepted delivery complete karne ke baad hi Delivery Off ya Home mode par ja sakte ho.'
          );
          return;
        }
      }

      const nextProfileState =
        nextMode === 'customer'
          ? { account_mode: 'customer', is_online: false }
          : { account_mode: 'delivery' };

      const { error: updateError } = await supabase
        .from('delivery_partner_profiles')
        .update({
          ...nextProfileState,
          last_seen_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      setAppMode(nextMode);
    } catch (error) {
      console.error('Error changing account mode:', error);
      window.alert(
        nextMode === 'delivery'
          ? 'Delivery mode ko account par lock nahi kiya ja saka. Please try again.'
          : 'Delivery mode ko off nahi kiya ja saka. Please try again.'
      );
    } finally {
      setAppModeBusy(false);
    }
  };

  const handleAnnouncementAction = (link?: string | null) => {
    if (!link) {
      setCurrentPage('announcements');
      return;
    }

    try {
      const resolvedUrl = new URL(link, window.location.origin);
      const isInternal = resolvedUrl.origin === window.location.origin;

      if (!isInternal) {
        window.open(resolvedUrl.toString(), '_blank', 'noopener,noreferrer');
        return;
      }

      const path = resolvedUrl.pathname.toLowerCase();
      const restaurantIdFromPath = path.startsWith('/restaurant/') ? path.split('/')[2] : null;
      const restaurantIdFromQuery =
        resolvedUrl.searchParams.get('restaurantId') || resolvedUrl.searchParams.get('id');

      if (path === '/' || path === '/home' || path === '/restaurants') {
        setCurrentPage('home');
        return;
      }

      if (path === '/orders') {
        setCurrentPage('orders');
        return;
      }

      if (path === '/cart') {
        setCurrentPage('cart');
        return;
      }

      if (path === '/checkout') {
        setCurrentPage('checkout');
        return;
      }

      if (path === '/announcements' || path === '/offers') {
        setCurrentPage('announcements');
        return;
      }

      if (path === '/profile' || path === '/me') {
        setCurrentPage('profile');
        return;
      }

      if (path === '/founder' || path === '/about-founder' || path === '/about-vajra') {
        setCurrentPage('founder');
        return;
      }

      if (path === '/careers' || path === '/apply' || path === '/job-application') {
        setCurrentPage('careers');
        return;
      }

      if (CONTACT_US_PATHS.includes(path as (typeof CONTACT_US_PATHS)[number])) {
        setCurrentPage('contact-us');
        return;
      }

      if (path === '/menu' && restaurantIdFromQuery) {
        setSelectedRestaurantId(restaurantIdFromQuery);
        setCurrentPage('menu');
        return;
      }

      if (restaurantIdFromPath) {
        setSelectedRestaurantId(restaurantIdFromPath);
        setCurrentPage('menu');
        return;
      }

      window.open(resolvedUrl.toString(), '_blank', 'noopener,noreferrer');
    } catch {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  const featuredAnnouncement =
    announcements.find((announcement) => !dismissedAnnouncementIds.includes(announcement.id)) || null;
  const hasUnreadAnnouncements = announcements.some(
    (announcement) => !dismissedAnnouncementIds.includes(announcement.id)
  );
  const isFounderPath = FOUNDER_PATHS.includes(
    window.location.pathname.toLowerCase() as (typeof FOUNDER_PATHS)[number]
  );
  const isCareersPath = CAREERS_PATHS.includes(
    window.location.pathname.toLowerCase() as (typeof CAREERS_PATHS)[number]
  );
  const isTermsPath = TERMS_PATHS.includes(
    window.location.pathname.toLowerCase() as (typeof TERMS_PATHS)[number]
  );
  const isPrivacyPath = PRIVACY_PATHS.includes(
    window.location.pathname.toLowerCase() as (typeof PRIVACY_PATHS)[number]
  );
  const isRefundPath = REFUND_PATHS.includes(
    window.location.pathname.toLowerCase() as (typeof REFUND_PATHS)[number]
  );
  const isShippingPath = SHIPPING_PATHS.includes(
    window.location.pathname.toLowerCase() as (typeof SHIPPING_PATHS)[number]
  );
  const isSupportPath = SUPPORT_PATHS.includes(
    window.location.pathname.toLowerCase() as (typeof SUPPORT_PATHS)[number]
  );
  const isContactPath = CONTACT_US_PATHS.includes(
    window.location.pathname.toLowerCase() as (typeof CONTACT_US_PATHS)[number]
  );
  const isFeelItPath = FEEL_IT_PATHS.includes(
    window.location.pathname.toLowerCase() as (typeof FEEL_IT_PATHS)[number]
  );
  const isTeamPath = TEAM_PATHS.includes(
    window.location.pathname.toLowerCase() as (typeof TEAM_PATHS)[number]
  );
  const isLoginPath = LOGIN_PATHS.includes(
    window.location.pathname.toLowerCase() as (typeof LOGIN_PATHS)[number]
  );
  const isSignupPath = SIGNUP_PATHS.includes(
    window.location.pathname.toLowerCase() as (typeof SIGNUP_PATHS)[number]
  );

  useEffect(() => {
    if (window.location.pathname === '/auth/callback') {
      document.title = 'Signing you in | The Vajra';
      return;
    }

    if (window.location.pathname === '/payment/callback') {
      document.title = 'Processing payment | The Vajra';
      return;
    }

    if (loading) {
      document.title = 'Loading The Vajra...';
      return;
    }

    if (user && hasProfile === null) {
      document.title = 'Checking your profile | The Vajra';
      return;
    }

    if (user && hasProfile === false) {
      document.title = 'Complete your profile | The Vajra';
    }
  }, [hasProfile, loading, user]);

  if (window.location.pathname === '/auth/callback') return <AuthCallback />;
  if (window.location.pathname === '/payment/callback') return <PaymentCallback />;
  if (isTermsPath) {
    return <TermsAndConditions />;
  }
  if (isPrivacyPath) {
    return <PrivacyPolicy />;
  }
  if (isRefundPath) {
    return <RefundCancellationPolicy />;
  }
  if (isShippingPath) {
    return <ShippingPolicy />;
  }
  if (isSupportPath) {
    return <SupportChatPage />;
  }
  if (isContactPath) {
    return <ContactUs />;
  }
  if (isFeelItPath) {
    return <FeelItPage />;
  }
  if (isTeamPath) {
    window.location.replace('/team-page.html');
    return null;
  }
  if (isLoginPath) {
    return <StandaloneAuthPage mode="signin" />;
  }
  if (isSignupPath) {
    return <StandaloneAuthPage mode="signup" />;
  }
  if (isCareersPath) {
    return <JobApplication />;
  }
  if (isFounderPath && !user) {
    return (
      <FounderPage
        publicView
        onNavigate={(page) => {
          if (page !== 'home' && page !== 'service-hub') return;
          window.history.pushState({}, '', '/');
          window.dispatchEvent(new CustomEvent(VAJRA_INTERNAL_PATH_CHANGE_EVENT));
        }}
      />
    );
  }
  if (loading) {
    return <BrandedLoader fullScreen message="Loading The Vajra..." />;
  }

  if (!user) return <Login />;

  if (hasProfile === null) {
    return (
      <CartProvider>
        <div className="min-h-screen bg-gray-900">
          <Header
            currentPage={currentPage}
            onNavigate={handleNavigate}
            showNavigation={false}
            userDisplayName={userDisplayName}
            userAvatarUrl={userAvatarUrl}
            userId={user?.id}
          />
          <BrandedLoader message="Checking your profile..." />
        </div>
      </CartProvider>
    );
  }

  if (hasProfile === false) {
    return (
      <CartProvider>
        <div className="min-h-screen bg-gray-900">
          <Header
            currentPage={currentPage}
            onNavigate={handleNavigate}
            showNavigation={false}
            userDisplayName={userDisplayName}
            userAvatarUrl={userAvatarUrl}
            userId={user?.id}
          />
          <Onboarding userId={user.id} onComplete={() => setHasProfile(true)} />
        </div>
      </CartProvider>
    );
  }

  const handleSelectRestaurant = (restaurantId: string) => {
    setSelectedRestaurantId(restaurantId);
    setCurrentPage('menu');
  };

  const handleCheckout = () => setCurrentPage('checkout');

  const handleOrderPlaced = (orderId: string) => {
    setPlacedOrderId(orderId);
    setCurrentPage('order-placed');
    setTimeout(() => setCurrentPage('orders'), 3000);
  };

  const renderPage = () => {
    if (appMode === 'delivery') {
      return (
        <DeliveryPartnerHub
          userId={user.id}
          userDisplayName={userDisplayName}
          userAvatarUrl={userAvatarUrl}
        />
      );
    }

    switch (currentPage) {
      case 'service-hub':
        return <PostLoginServiceHub onNavigate={handleNavigate as (page: 'home' | 'car-rent' | 'second-hand-market' | 'taxi') => void} />;
      case 'home':
        return (
          <RestaurantList
            userId={user.id}
            onSelectRestaurant={handleSelectRestaurant}
            greetingName={userDisplayName}
            featuredAnnouncement={featuredAnnouncement}
            announcementsLoading={announcementsLoading}
            onAnnouncementAction={handleAnnouncementAction}
            onOpenAnnouncements={() => setCurrentPage('announcements')}
            onDismissAnnouncement={handleDismissAnnouncement}
          />
        );
      case 'car-rent':
        return (
          <RestaurantList
            userId={user.id}
            onSelectRestaurant={handleSelectRestaurant}
            greetingName={userDisplayName}
            initialService="car-rent"
            featuredAnnouncement={featuredAnnouncement}
            announcementsLoading={announcementsLoading}
            onAnnouncementAction={handleAnnouncementAction}
            onOpenAnnouncements={() => setCurrentPage('announcements')}
            onDismissAnnouncement={handleDismissAnnouncement}
          />
        );
      case 'second-hand-market':
        return (
          <RestaurantList
            userId={user.id}
            onSelectRestaurant={handleSelectRestaurant}
            greetingName={userDisplayName}
            initialService="second-hand-market"
            featuredAnnouncement={featuredAnnouncement}
            announcementsLoading={announcementsLoading}
            onAnnouncementAction={handleAnnouncementAction}
            onOpenAnnouncements={() => setCurrentPage('announcements')}
            onDismissAnnouncement={handleDismissAnnouncement}
          />
        );
      case 'taxi':
        return (
          <RestaurantList
            userId={user.id}
            onSelectRestaurant={handleSelectRestaurant}
            greetingName={userDisplayName}
            initialService="taxi"
            featuredAnnouncement={featuredAnnouncement}
            announcementsLoading={announcementsLoading}
            onAnnouncementAction={handleAnnouncementAction}
            onOpenAnnouncements={() => setCurrentPage('announcements')}
            onDismissAnnouncement={handleDismissAnnouncement}
          />
        );
      case 'menu':
        return <RestaurantMenu restaurantId={selectedRestaurantId} onBack={() => setCurrentPage('home')} />;
      case 'cart':
        return <Cart onCheckout={handleCheckout} onBrowseRestaurants={() => setCurrentPage('home')} />;
      case 'checkout':
        return <Checkout onBack={() => setCurrentPage('cart')} onOrderPlaced={handleOrderPlaced} />;
      case 'announcements':
        return (
          <AnnouncementsScreen
            announcements={announcements}
            loading={announcementsLoading}
            onAnnouncementAction={handleAnnouncementAction}
          />
        );
      case 'orders':
        return <OrderTracking onNavigate={() => setCurrentPage('cart')} />;
      case 'profile':
        return (
          <Profile
            userId={user.id}
            onBack={() => setCurrentPage('home')}
            onProfileUpdated={(name, avatarUrl) => {
              setUserDisplayName(name);
              setUserAvatarUrl(avatarUrl);
            }}
          />
        );
      case 'founder':
        return <FounderPage onNavigate={handleNavigate} />;
      case 'careers':
        return <JobApplication />;
      case 'order-placed':
        return (
          <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
            <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-green-500/20 bg-gradient-to-br from-emerald-500/10 via-gray-900 to-gray-900 shadow-2xl shadow-black/30">
              <div className="border-b border-white/5 px-6 py-4 text-center sm:px-8">
                <span className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-green-300">
                  Order confirmed
                </span>
              </div>

              <div className="px-6 py-10 text-center sm:px-8">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-green-400/30 bg-green-500 shadow-lg shadow-green-500/20">
                  <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <h2 className="mb-3 text-3xl font-bold text-white sm:text-4xl">Order placed successfully</h2>
                <p className="mx-auto mb-6 max-w-xl text-sm leading-6 text-gray-300 sm:text-base">
                  Your restaurant has received the order. We will keep your status updated as it moves from preparation to delivery.
                </p>

                <div className="mx-auto mb-6 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4">
                    <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Order ID</p>
                    <p className="font-semibold text-white">{placedOrderId.slice(0, 8)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4">
                    <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Status</p>
                    <p className="font-semibold text-green-300">Pending confirmation</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4">
                    <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Next step</p>
                    <p className="font-semibold text-white">Track your order</p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <button
                    onClick={() => setCurrentPage('orders')}
                    className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                  >
                    Track order now
                  </button>
                  <p className="text-sm text-gray-400">Redirecting automatically in a moment...</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'contact-us':
        return <ContactUs />;
      case 'terms-conditions':
        return <TermsAndConditions />;
      case 'privacy-policy':
        return <PrivacyPolicy />;
      case 'refund-cancellation':
        return <RefundCancellationPolicy />;
      case 'shipping-policy':
        return <ShippingPolicy />;
      case 'payment-callback':
        return <PaymentCallback />;
      default:
        return <RestaurantList userId={user.id} onSelectRestaurant={handleSelectRestaurant} />;
    }
  };

  return (
    <CartProvider>
      <DeliveryVoiceCallProvider userId={user.id} userDisplayName={userDisplayName}>
        <div className="flex min-h-screen flex-col bg-gray-900">
          {currentPage !== 'service-hub' && appMode === 'customer' && (
            <SmartTabTitle
              currentPage={currentPage}
              loading={loading}
              isAuthenticated={!!user}
              hasProfile={hasProfile}
            />
          )}
          {currentPage !== 'service-hub' && (
            <Header
              currentPage={currentPage}
              onNavigate={handleNavigate}
              showNavigation={appMode === 'customer'}
              hasUnreadAnnouncements={hasUnreadAnnouncements}
              userDisplayName={userDisplayName}
              userAvatarUrl={userAvatarUrl}
              userId={user?.id}
              appMode={appMode}
              appModeBusy={appModeBusy}
              onToggleAppMode={handleToggleAppMode}
            />
          )}
          <main className="flex-1">{renderPage()}</main>
          {appMode === 'customer' && currentPage !== 'service-hub' && (
            <ContinueOrderPill currentPage={currentPage} onNavigate={handleNavigate} />
          )}
          {appMode === 'customer' && <Footer />}
        </div>
      </DeliveryVoiceCallProvider>
    </CartProvider>
  );
}

export default App;
