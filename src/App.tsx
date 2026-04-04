import { useEffect, useState } from 'react';
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
import { supabase, Announcement } from './lib/supabase';

type Page = 'home' | 'menu' | 'cart' | 'checkout' | 'orders' | 'order-placed' | 'announcements';

const ANNOUNCEMENT_DISMISS_KEY = 'vc_dismissed_announcements';

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
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [placedOrderId, setPlacedOrderId] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [userDisplayName, setUserDisplayName] = useState('');
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
    const loadingFallback = window.setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 2000);

    const loadUserProfile = async (userId: string) => {
      if (!isMounted) return;

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, name')
          .eq('user_id', userId)
          .maybeSingle();

        if (!isMounted) return;

        if (error) {
          console.error('Error checking user profile:', error);
          setHasProfile(false);
          return;
        }

        setUserDisplayName(data?.name?.trim() ?? '');
        setHasProfile(!!data);
      } catch (error) {
        console.error('Unexpected error checking user profile:', error);
        if (isMounted) {
          setUserDisplayName('');
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

      if (!nextUser) {
        setUserDisplayName('');
        setHasProfile(false);
        setLoading(false);
        return;
      }

      setUserDisplayName(fallbackName);
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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSession(session);
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

  const handleNavigate = (page: string) => {
    if (
      page === 'home' ||
      page === 'menu' ||
      page === 'cart' ||
      page === 'checkout' ||
      page === 'orders' ||
      page === 'order-placed' ||
      page === 'announcements'
    ) {
      setCurrentPage(page);
    }
  };

  const handleDismissAnnouncement = (announcementId: string) => {
    setDismissedAnnouncementIds((prev) =>
      prev.includes(announcementId) ? prev : [...prev, announcementId]
    );
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

  if (window.location.pathname === '/auth/callback') return <AuthCallback />;
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#1a1a1a' }}>Loading...</p>
      </div>
    );
  }

  if (!user) return <Login />;

  if (hasProfile === null) {
    return (
      <CartProvider>
        <div className="min-h-screen bg-gray-900">
          <Header currentPage={currentPage} onNavigate={handleNavigate} showNavigation={false} />
          <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
            <p className="text-gray-300">Checking your profile...</p>
          </div>
        </div>
      </CartProvider>
    );
  }

  if (hasProfile === false) {
    return (
      <CartProvider>
        <div className="min-h-screen bg-gray-900">
          <Header currentPage={currentPage} onNavigate={handleNavigate} showNavigation={false} />
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
    switch (currentPage) {
      case 'home':
        return (
          <RestaurantList
            onSelectRestaurant={handleSelectRestaurant}
            greetingName={userDisplayName}
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
        return <OrderTracking />;
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
      default:
        return <RestaurantList onSelectRestaurant={handleSelectRestaurant} />;
    }
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-900">
        <Header
          currentPage={currentPage}
          onNavigate={handleNavigate}
          hasUnreadAnnouncements={hasUnreadAnnouncements}
        />
        {renderPage()}
      </div>
    </CartProvider>
  );
}

export default App;
