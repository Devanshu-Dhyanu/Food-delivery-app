import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  Bell,
  ChevronDown,
  CircleUserRound,
  MapPin,
  Menu,
  Package,
  ShoppingCart,
  Sparkles,
  Truck,
  Utensils,
  Wallet,
  X,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { getWalletOverview } from '../lib/wallet';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  showNavigation?: boolean;
  hasUnreadAnnouncements?: boolean;
  userDisplayName?: string;
  userAvatarUrl?: string | null;
  userId?: string;
  appMode?: 'customer' | 'delivery';
  onToggleAppMode?: () => void;
}

const ACTIVE_ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'out_for_delivery'];
const CURRENT_LOCATION_STORAGE_KEY = 'vajra-current-location-banner-v1';

const logoParticles = [
  { x: 38, y: -24, size: 6, delay: 0, duration: 760, color: '#fb923c', glow: '0 0 18px rgba(251, 146, 60, 0.55)' },
  { x: 30, y: 10, size: 5, delay: 40, duration: 700, color: '#fff7ed', glow: '0 0 16px rgba(255, 247, 237, 0.45)' },
  { x: 12, y: 34, size: 4, delay: 20, duration: 740, color: '#fdba74', glow: '0 0 14px rgba(253, 186, 116, 0.45)' },
  { x: -18, y: 30, size: 5, delay: 60, duration: 720, color: '#ffffff', glow: '0 0 16px rgba(255, 255, 255, 0.42)' },
  { x: -36, y: 18, size: 4, delay: 20, duration: 700, color: '#fb923c', glow: '0 0 14px rgba(251, 146, 60, 0.5)' },
  { x: -34, y: -18, size: 5, delay: 0, duration: 760, color: '#fff7ed', glow: '0 0 16px rgba(255, 247, 237, 0.45)' },
  { x: -12, y: -34, size: 4, delay: 30, duration: 680, color: '#fdba74', glow: '0 0 14px rgba(253, 186, 116, 0.45)' },
  { x: 16, y: -38, size: 6, delay: 10, duration: 760, color: '#fb923c', glow: '0 0 18px rgba(251, 146, 60, 0.55)' },
  { x: 0, y: -44, size: 3, delay: 70, duration: 640, color: '#ffffff', glow: '0 0 12px rgba(255, 255, 255, 0.4)' },
  { x: 42, y: 20, size: 3, delay: 50, duration: 650, color: '#ffffff', glow: '0 0 12px rgba(255, 255, 255, 0.4)' },
];

type CurrentLocationBanner = {
  title: string;
  subtitle: string;
  status: 'idle' | 'loading' | 'ready' | 'denied' | 'error' | 'unsupported';
};

type StoredLocationBanner = Pick<CurrentLocationBanner, 'title' | 'subtitle'> & {
  updatedAt: number;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
};

const loadStoredLocationBanner = (): StoredLocationBanner | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storedValue = window.localStorage.getItem(CURRENT_LOCATION_STORAGE_KEY);

    if (!storedValue) {
      return null;
    }

    const parsedValue = JSON.parse(storedValue) as Partial<StoredLocationBanner>;

    if (
      typeof parsedValue.title !== 'string' ||
      typeof parsedValue.subtitle !== 'string' ||
      typeof parsedValue.updatedAt !== 'number'
    ) {
      return null;
    }

    return {
      title: parsedValue.title,
      subtitle: parsedValue.subtitle,
      updatedAt: parsedValue.updatedAt,
      latitude: parsedValue.latitude,
      longitude: parsedValue.longitude,
      accuracy: parsedValue.accuracy,
    };
  } catch {
    return null;
  }
};

const saveLocationBanner = (
  value: Pick<CurrentLocationBanner, 'title' | 'subtitle'> & {
    latitude?: number;
    longitude?: number;
    accuracy?: number;
  }
) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    CURRENT_LOCATION_STORAGE_KEY,
    JSON.stringify({
      ...value,
      updatedAt: Date.now(),
    } satisfies StoredLocationBanner)
  );
};

const formatCoordinateFallback = (latitude: number, longitude: number) =>
  `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

const buildLocationBanner = (
  payload: Record<string, unknown> | null,
  latitude: number,
  longitude: number
): Pick<CurrentLocationBanner, 'title' | 'subtitle'> => {
  const locality =
    (typeof payload?.locality === 'string' && payload.locality) ||
    (typeof payload?.city === 'string' && payload.city) ||
    (typeof payload?.principalSubdivision === 'string' && payload.principalSubdivision) ||
    'Current location';
  const city =
    (typeof payload?.city === 'string' && payload.city) ||
    (typeof payload?.locality === 'string' && payload.locality) ||
    '';
  const subdivision = typeof payload?.principalSubdivision === 'string' ? payload.principalSubdivision : '';
  const country = typeof payload?.countryName === 'string' ? payload.countryName : '';

  const subtitle = [city, subdivision, country].filter(Boolean).join(', ') || formatCoordinateFallback(latitude, longitude);

  return {
    title: locality,
    subtitle,
  };
};

export default function Header({
  currentPage,
  onNavigate,
  showNavigation = true,
  hasUnreadAnnouncements = false,
  userDisplayName = '',
  userAvatarUrl = null,
  userId,
  appMode = 'customer',
  onToggleAppMode,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopQuickMenuOpen, setDesktopQuickMenuOpen] = useState(false);
  const [showLogoBurst, setShowLogoBurst] = useState(false);
  const [logoBurstKey, setLogoBurstKey] = useState(0);
  const [hasActiveOrder, setHasActiveOrder] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<CurrentLocationBanner>({
    title: 'Use current location',
    subtitle: 'Allow location access to detect where you are right now.',
    status: 'idle',
  });
  const { clearCart, getTotalItems } = useCart();
  const hasRequestedLocationRef = useRef(false);
  const desktopQuickMenuRef = useRef<HTMLDivElement | null>(null);
  const locationWatchIdRef = useRef<number | null>(null);
  const locationWatchTimeoutRef = useRef<number | null>(null);
  const locationRequestIdRef = useRef(0);
  const bestAccuracyRef = useRef<number | null>(null);
  const totalItems = getTotalItems();
  const isDeliveryMode = appMode === 'delivery';
  const firstName = userDisplayName.trim().split(/\s+/)[0] || 'Profile';
  const profileInitial = firstName.charAt(0).toUpperCase();
  const cleanUserAvatarUrl = userAvatarUrl?.trim() || '';
  const showUserAvatar = Boolean(cleanUserAvatarUrl && !avatarLoadFailed);
  const isQuickMenuPage =
    currentPage === 'profile' || currentPage === 'orders' || currentPage === 'founder';
  const logoSignal = hasActiveOrder ? 'active-order' : totalItems > 0 ? 'cart' : 'idle';
  const logoButtonTitle =
    isDeliveryMode
      ? 'Delivery partner mode'
      :
    logoSignal === 'active-order'
      ? 'You have an active order'
      : logoSignal === 'cart'
      ? `${totalItems} item${totalItems === 1 ? '' : 's'} in cart`
      : 'Go to home';
  const getNavButtonClasses = (isActive: boolean) =>
    `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
      isActive
        ? 'border-orange-500/30 bg-orange-500/15 text-orange-300 shadow-lg shadow-orange-500/10'
        : 'border-transparent text-gray-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
    }`;
  const handleNavigate = (page: string) => {
    setMobileMenuOpen(false);
    setDesktopQuickMenuOpen(false);
    onNavigate(page);
  };

  useEffect(() => {
    setDesktopQuickMenuOpen(false);
  }, [currentPage, showNavigation]);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [cleanUserAvatarUrl]);

  useEffect(() => {
    if (!desktopQuickMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (
        desktopQuickMenuRef.current &&
        !desktopQuickMenuRef.current.contains(event.target as Node)
      ) {
        setDesktopQuickMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDesktopQuickMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [desktopQuickMenuOpen]);
  useEffect(() => {
    if (!showLogoBurst) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowLogoBurst(false);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [logoBurstKey, showLogoBurst]);

  useEffect(() => {
    let isMounted = true;

    if (!showNavigation) {
      setHasActiveOrder(false);
      return () => {
        isMounted = false;
      };
    }

    const fetchActiveOrder = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
          if (isMounted) {
            setHasActiveOrder(false);
          }
          return;
        }

        const { data, error } = await supabase
          .from('orders')
          .select('id')
          .eq('user_id', user.id)
          .in('status', ACTIVE_ORDER_STATUSES)
          .limit(1);

        if (error) throw error;

        if (isMounted) {
          setHasActiveOrder((data?.length ?? 0) > 0);
        }
      } catch (error) {
        console.error('Error checking active order state:', error);

        if (isMounted) {
          setHasActiveOrder(false);
        }
      }
    };

    void fetchActiveOrder();
    const interval = window.setInterval(() => {
      void fetchActiveOrder();
    }, 20000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [currentPage, showNavigation]);

  useEffect(() => {
    let isMounted = true;

    if (!showNavigation || !userId) {
      setWalletBalance(null);
      return () => {
        isMounted = false;
      };
    }

    const loadWalletBalance = async () => {
      try {
        const overview = await getWalletOverview(userId, 1);

        if (!isMounted) {
          return;
        }

        if (!overview.schemaReady) {
          setWalletBalance(null);
          return;
        }

        setWalletBalance(Number(overview.account?.balance ?? 0));
      } catch (error) {
        console.error('Error loading wallet balance for header:', error);

        if (isMounted) {
          setWalletBalance(null);
        }
      }
    };

    void loadWalletBalance();
    const interval = window.setInterval(() => {
      void loadWalletBalance();
    }, 20000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [showNavigation, userId, currentPage]);

  const clearLocationWatch = () => {
    if (typeof window === 'undefined') {
      return;
    }

    if (locationWatchIdRef.current !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(locationWatchIdRef.current);
      locationWatchIdRef.current = null;
    }

    if (locationWatchTimeoutRef.current !== null) {
      window.clearTimeout(locationWatchTimeoutRef.current);
      locationWatchTimeoutRef.current = null;
    }
  };

  const requestCurrentLocation = () => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!('geolocation' in navigator)) {
      setCurrentLocation({
        title: 'Location unavailable',
        subtitle: 'Your device does not support browser location access.',
        status: 'unsupported',
      });
      return;
    }

    locationRequestIdRef.current += 1;
    bestAccuracyRef.current = null;
    clearLocationWatch();
    const requestId = locationRequestIdRef.current;
    const storedLocation = loadStoredLocationBanner();

    setCurrentLocation({
      title: 'Detecting your location...',
      subtitle:
        storedLocation?.title && storedLocation?.subtitle
          ? `Refreshing from ${storedLocation.title}`
          : 'Please allow location access to show your current area.',
      status: 'loading',
    });

    const handleResolvedPosition = async (position: GeolocationPosition) => {
      if (requestId !== locationRequestIdRef.current) {
        return;
      }

      const accuracy = position.coords.accuracy;
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      if (bestAccuracyRef.current !== null && accuracy >= bestAccuracyRef.current - 15) {
        return;
      }

      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(
            latitude
          )}&longitude=${encodeURIComponent(longitude)}&localityLanguage=en`
        );

        if (!response.ok) {
          throw new Error('Reverse geocoding failed');
        }

        const data = (await response.json()) as Record<string, unknown>;
        const nextLocation = buildLocationBanner(data, latitude, longitude);
        bestAccuracyRef.current = accuracy;
        saveLocationBanner({
          ...nextLocation,
          latitude,
          longitude,
          accuracy,
        });
        setCurrentLocation({
          ...nextLocation,
          status: 'ready',
        });

        if (accuracy <= 120) {
          clearLocationWatch();
        }
      } catch (error) {
        console.error('Error resolving current location label:', error);
        const fallbackLocation = {
          title: 'Current location detected',
          subtitle: formatCoordinateFallback(latitude, longitude),
        };
        bestAccuracyRef.current = accuracy;
        saveLocationBanner({
          ...fallbackLocation,
          latitude,
          longitude,
          accuracy,
        });
        setCurrentLocation({
          ...fallbackLocation,
          status: 'ready',
        });

        if (accuracy <= 120) {
          clearLocationWatch();
        }
      }
    };

    const handleLocationError = (error: GeolocationPositionError) => {
      if (requestId !== locationRequestIdRef.current) {
        return;
      }

      console.error('Error fetching current location:', error);
      setCurrentLocation((current) => {
        if (current.status === 'ready') {
          return current;
        }

        if (storedLocation?.title && storedLocation?.subtitle) {
          return {
            title: storedLocation.title,
            subtitle: storedLocation.subtitle,
            status: 'ready',
          };
        }

        if (error.code === error.PERMISSION_DENIED) {
          return {
            title: 'Location permission needed',
            subtitle: 'Allow location access in your browser to auto-detect your current area.',
            status: 'denied',
          };
        }

        return {
          title: 'Could not detect location',
          subtitle: 'Tap here to try again and fetch your current area.',
          status: 'error',
        };
      });
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void handleResolvedPosition(position);
      },
      handleLocationError,
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );

    locationWatchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        void handleResolvedPosition(position);
      },
      (error) => {
        if (bestAccuracyRef.current === null) {
          handleLocationError(error);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );

    locationWatchTimeoutRef.current = window.setTimeout(() => {
      if (requestId === locationRequestIdRef.current) {
        clearLocationWatch();
      }
    }, 20000);
  };

  useEffect(() => {
    if (!showNavigation || currentPage !== 'home') {
      hasRequestedLocationRef.current = false;
      clearLocationWatch();
      return;
    }

    if (hasRequestedLocationRef.current) {
      return;
    }

    hasRequestedLocationRef.current = true;
    requestCurrentLocation();
  }, [currentPage, showNavigation]);

  useEffect(() => {
    return () => {
      clearLocationWatch();
    };
  }, []);

  const handleLogoClick = () => {
    setShowLogoBurst(true);
    setLogoBurstKey((current) => current + 1);

    if (isDeliveryMode) {
      return;
    }

    if (currentPage !== 'home') {
      handleNavigate('home');
    }
  };

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    setDesktopQuickMenuOpen(false);
    clearCart();
    await supabase.auth.signOut();
    window.location.reload();
  };

  const renderProfileAvatar = (
    sizeClasses: string,
    fallbackTextClasses: string,
    activeClasses: string,
    inactiveClasses: string,
    imageClasses = 'h-full w-full object-cover'
  ) => (
    <span
      className={`flex items-center justify-center overflow-hidden rounded-full border ${sizeClasses} ${
        isQuickMenuPage || desktopQuickMenuOpen ? activeClasses : inactiveClasses
      }`}
    >
      {showUserAvatar ? (
        <img
          src={cleanUserAvatarUrl}
          alt={userDisplayName ? `${userDisplayName} profile` : 'Profile'}
          className={imageClasses}
          onError={() => setAvatarLoadFailed(true)}
        />
      ) : (
        <span className={fallbackTextClasses}>{profileInitial}</span>
      )}
    </span>
  );

  const quickMenuItems = [
    {
      page: 'profile',
      label: 'Profile',
      description: 'Manage your account, wallet, and personal details.',
      icon: CircleUserRound,
      badge: profileInitial,
    },
    {
      page: 'orders',
      label: 'Orders',
      description: 'Track active orders, issues, cancellations, and reorders.',
      icon: Package,
    },
    {
      page: 'founder',
      label: 'Founder',
      description: 'Read the story and vision behind The Vajra.',
      icon: Sparkles,
    },
  ] as const;

  return (
    <>
      <style>{`
        @keyframes vajra-logo-core {
          0% {
            opacity: 0;
            transform: scale(0.65);
          }
          22% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: scale(1.95);
          }
        }

        @keyframes vajra-logo-ring {
          0% {
            opacity: 0.45;
            transform: scale(0.85);
          }
          100% {
            opacity: 0;
            transform: scale(1.55);
          }
        }

        @keyframes vajra-logo-particle {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.35);
          }
          18% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--particle-x)), calc(-50% + var(--particle-y))) scale(0.15);
          }
        }

        @keyframes vajra-logo-cart-breathe {
          0%, 100% {
            opacity: 0.52;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.04);
          }
        }

        @keyframes vajra-logo-order-pulse {
          0%, 100% {
            opacity: 0.65;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.06);
          }
        }
      `}</style>

      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-4 py-3">
          <button
            onClick={handleLogoClick}
            className="group relative flex items-center space-x-3 rounded-full px-2 py-1.5 transition-opacity duration-300 hover:opacity-80"
            aria-label="Go to home"
            title={logoButtonTitle}
          >
            <div className="relative flex h-10 w-10 items-center justify-center sm:h-11 sm:w-11">
              {logoSignal !== 'idle' && (
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-[-4px] rounded-[20px] ${
                    logoSignal === 'active-order'
                      ? 'border border-emerald-400/45 shadow-[0_0_0_1px_rgba(52,211,153,0.08),0_0_22px_rgba(16,185,129,0.22)]'
                      : 'border border-orange-400/35 shadow-[0_0_0_1px_rgba(251,146,60,0.06),0_0_18px_rgba(251,146,60,0.16)]'
                  }`}
                  style={{
                    animation:
                      logoSignal === 'active-order'
                        ? 'vajra-logo-order-pulse 1.9s ease-in-out infinite'
                        : 'vajra-logo-cart-breathe 2.4s ease-in-out infinite',
                  }}
                />
              )}
              {showLogoBurst && (
                <div key={logoBurstKey} className="pointer-events-none absolute inset-0">
                  <span
                    className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle,rgba(251,146,60,0.4)_0%,rgba(251,146,60,0.16)_38%,rgba(255,255,255,0)_72%)] opacity-0"
                    style={{ animation: 'vajra-logo-core 700ms ease-out forwards' }}
                  />
                  <span
                    className="absolute inset-0 rounded-2xl border border-orange-300/40 opacity-0"
                    style={{ animation: 'vajra-logo-ring 780ms cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
                  />
                  {logoParticles.map((particle, index) => (
                    <span
                      key={`${logoBurstKey}-${index}`}
                      className="absolute left-1/2 top-1/2 rounded-full opacity-0"
                      style={
                        {
                          '--particle-x': `${particle.x}px`,
                          '--particle-y': `${particle.y}px`,
                          width: `${particle.size}px`,
                          height: `${particle.size}px`,
                          backgroundColor: particle.color,
                          boxShadow: particle.glow,
                          animation: `vajra-logo-particle ${particle.duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${particle.delay}ms forwards`,
                        } as CSSProperties
                      }
                    />
                  ))}
                </div>
              )}
              <img
                src="/the-vajra-mark.svg"
                alt="The Vajra"
                className="relative h-10 w-10 rounded-2xl border border-white/10 shadow-lg shadow-black/30 transition-transform duration-300 group-hover:scale-105 sm:h-11 sm:w-11"
              />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-lg font-bold tracking-tight text-white sm:text-xl">The Vajra</span>
              <span className="hidden text-xs text-gray-400 sm:block">
                {isDeliveryMode ? 'Delivery partner console' : 'Campus Food Delivery'}
              </span>
            </div>
          </button>

          <nav className="hidden md:flex items-center flex-wrap justify-end gap-3 sm:gap-6">
            {showNavigation && (
              <button
                onClick={() => handleNavigate('home')}
                className={getNavButtonClasses(currentPage === 'home')}
              >
                <Utensils className="h-4 w-4" />
                <span>Home</span>
              </button>
            )}
            {showNavigation && (
              <button
                onClick={() => handleNavigate('announcements')}
                className={`${getNavButtonClasses(currentPage === 'announcements')} relative`}
              >
                <Bell className="h-4 w-4" />
                <span>Offers</span>
                {hasUnreadAnnouncements && (
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-orange-400" />
                )}
              </button>
            )}
            {showNavigation && (
              <div className="relative" ref={desktopQuickMenuRef}>
                <button
                  type="button"
                  onClick={() => setDesktopQuickMenuOpen((current) => !current)}
                  className={getNavButtonClasses(isQuickMenuPage || desktopQuickMenuOpen)}
                  aria-expanded={desktopQuickMenuOpen}
                  aria-haspopup="menu"
                >
                  {renderProfileAvatar(
                    'h-5 w-5',
                    'text-[10px] font-bold',
                    'border-orange-400/35 bg-orange-500/20 text-orange-100',
                    'border-white/10 bg-white/5 text-gray-200'
                  )}
                  <span>Menu</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      desktopQuickMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {desktopQuickMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[320px] overflow-hidden rounded-[24px] border border-white/8 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 shadow-2xl shadow-black/35">
                    <div className="border-b border-white/5 px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
                        Quick Menu
                      </p>
                      <p className="mt-2 text-sm text-gray-400">
                        Keep orders, profile, and founder details in one cleaner dropdown.
                      </p>
                    </div>

                    <div className="p-2">
                      {quickMenuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.page;

                        return (
                          <button
                            key={item.page}
                            type="button"
                            onClick={() => handleNavigate(item.page)}
                            className={`flex w-full items-start gap-3 rounded-[20px] px-3 py-3 text-left transition-all ${
                              isActive
                                ? 'bg-orange-500/12 text-white'
                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <span
                              className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border ${
                                isActive
                                  ? 'border-orange-400/25 bg-orange-500/15 text-orange-200'
                                  : 'border-white/10 bg-white/5 text-gray-300'
                              }`}
                            >
                              {item.page === 'profile' && showUserAvatar ? (
                                <img
                                  src={cleanUserAvatarUrl}
                                  alt={userDisplayName ? `${userDisplayName} profile` : 'Profile'}
                                  className="h-full w-full rounded-2xl object-cover"
                                  onError={() => setAvatarLoadFailed(true)}
                                />
                              ) : (
                                <>
                                  {'badge' in item && item.badge ? (
                                    <span className="text-xs font-bold">{item.badge}</span>
                                  ) : (
                                    <Icon className="h-4 w-4" />
                                  )}
                                </>
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold">{item.label}</span>
                              <span className="mt-1 block text-xs leading-5 text-gray-400">
                                {item.description}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            {onToggleAppMode && (
              <button
                type="button"
                onClick={onToggleAppMode}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  isDeliveryMode
                    ? 'border-emerald-400/35 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/20'
                    : 'border-sky-400/25 bg-sky-500/10 text-sky-100 hover:bg-sky-500/15'
                }`}
              >
                <Truck className="h-4 w-4" />
                <span>{isDeliveryMode ? 'Delivery Off' : 'Delivery On'}</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="rounded-full border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-400 transition-colors hover:bg-orange-500 hover:text-white"
            >
              Logout
            </button>
            {showNavigation && (
              <button
                onClick={() => handleNavigate('cart')}
                className="relative p-2 text-gray-300 hover:text-white transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            )}
            {showNavigation && walletBalance !== null && (
              <button
                onClick={() => handleNavigate('profile')}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-500/15"
                title={`Vajra Wallet balance: Rs. ${walletBalance.toFixed(2)}`}
              >
                <Wallet className="h-4 w-4" />
                <span className="text-xs font-semibold">Rs. {walletBalance.toFixed(2)}</span>
              </button>
            )}
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            {showNavigation && (
              <button
                onClick={() => handleNavigate('cart')}
                className="relative rounded-full border border-white/10 bg-white/5 p-2.5 text-gray-300 transition-colors hover:text-white"
                aria-label="Open cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                    {totalItems}
                  </span>
                )}
              </button>
            )}
            {showNavigation && walletBalance !== null && (
              <button
                onClick={() => handleNavigate('profile')}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[11px] font-semibold text-emerald-100 transition-colors hover:bg-emerald-500/15"
                aria-label={`Open wallet. Balance Rs. ${walletBalance.toFixed(2)}`}
              >
                <Wallet className="h-4 w-4" />
                <span>Rs. {walletBalance.toFixed(0)}</span>
              </button>
            )}
            {onToggleAppMode && (
              <button
                type="button"
                onClick={onToggleAppMode}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[11px] font-semibold transition-colors ${
                  isDeliveryMode
                    ? 'border-emerald-400/35 bg-emerald-500/15 text-emerald-100'
                    : 'border-sky-400/25 bg-sky-500/10 text-sky-100'
                }`}
                aria-label={isDeliveryMode ? 'Turn delivery mode off' : 'Turn delivery mode on'}
              >
                <Truck className="h-4 w-4" />
                <span>{isDeliveryMode ? 'Off' : 'On'}</span>
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="rounded-full border border-white/10 bg-white/5 p-2.5 text-gray-200 transition-colors hover:text-white"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {showNavigation && currentPage === 'home' && (
          <div className="pb-3">
            <button
              type="button"
              onClick={requestCurrentLocation}
              className={`group w-full overflow-hidden rounded-[24px] border text-left shadow-xl transition-all hover:-translate-y-0.5 ${
                currentLocation.status === 'loading'
                  ? 'border-orange-400/30 bg-gradient-to-br from-orange-500/16 via-gray-900 to-gray-900 shadow-orange-950/10'
                  : currentLocation.status === 'denied' || currentLocation.status === 'error'
                    ? 'border-white/10 bg-gradient-to-br from-white/[0.06] via-gray-900 to-gray-900 shadow-black/20 hover:border-orange-500/20'
                    : 'border-orange-500/20 bg-gradient-to-br from-orange-500/12 via-gray-900 to-gray-900 shadow-black/20 hover:border-orange-500/35'
              }`}
            >
              <div className="rounded-[23px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.07),rgba(255,255,255,0.02)_32%,rgba(15,23,42,0.18)_100%)] px-4 py-3 text-white sm:px-5 sm:py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-orange-400/20 bg-orange-500/15 text-orange-200">
                        <MapPin className="h-4.5 w-4.5" />
                      </span>
                      <p className="truncate text-xl font-bold tracking-tight sm:text-2xl">
                        {currentLocation.title}
                      </p>
                    </div>
                    <p
                      className={`truncate pl-10 text-sm sm:text-base ${
                        currentLocation.status === 'loading'
                          ? 'text-orange-100/90'
                          : currentLocation.status === 'denied' || currentLocation.status === 'error'
                            ? 'text-gray-300'
                            : 'text-gray-300'
                      }`}
                    >
                      {currentLocation.status === 'loading'
                        ? 'Detecting your current location...'
                        : currentLocation.subtitle}
                    </p>
                  </div>

                  <ChevronDown
                    className={`mt-1 h-5 w-5 flex-shrink-0 text-orange-200/90 transition-transform ${
                      currentLocation.status === 'loading' ? 'animate-pulse' : 'group-hover:translate-y-0.5'
                    }`}
                  />
                </div>
              </div>
            </button>
          </div>
        )}

        {mobileMenuOpen && (
          <div className="border-t border-white/5 pb-4 pt-3 md:hidden">
            <div className="space-y-2 rounded-[24px] border border-white/5 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/95 p-3 shadow-xl shadow-black/20">
              {showNavigation && (
                <button
                  onClick={() => handleNavigate('home')}
                  className={`w-full justify-start ${getNavButtonClasses(currentPage === 'home')}`}
                >
                  <Utensils className="h-4 w-4" />
                  <span>Home</span>
                </button>
              )}
              {showNavigation && (
                <button
                  onClick={() => handleNavigate('announcements')}
                  className={`relative w-full justify-start ${getNavButtonClasses(currentPage === 'announcements')}`}
                >
                  <Bell className="h-4 w-4" />
                  <span>Offers</span>
                  {hasUnreadAnnouncements && (
                    <span className="absolute right-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-orange-400" />
                  )}
                </button>
              )}
              {showNavigation && (
                <button
                  onClick={() => handleNavigate('profile')}
                  className={`w-full justify-start ${getNavButtonClasses(currentPage === 'profile')}`}
                >
                  {showUserAvatar ? (
                    <img
                      src={cleanUserAvatarUrl}
                      alt={userDisplayName ? `${userDisplayName} profile` : 'Profile'}
                      className="h-4 w-4 rounded-full object-cover"
                      onError={() => setAvatarLoadFailed(true)}
                    />
                  ) : (
                    <CircleUserRound className="h-4 w-4" />
                  )}
                  <span>{firstName}</span>
                  {renderProfileAvatar(
                    'ml-auto h-6 w-6',
                    'text-[10px] font-bold',
                    'border-orange-400/35 bg-orange-500/20 text-orange-100',
                    'border-white/10 bg-white/5 text-gray-200'
                  )}
                </button>
              )}
              {showNavigation && (
                <button
                  onClick={() => handleNavigate('orders')}
                  className={`w-full justify-start ${getNavButtonClasses(currentPage === 'orders')}`}
                >
                  <Package className="h-4 w-4" />
                  <span>Orders</span>
                </button>
              )}
              {showNavigation && (
                <button
                  onClick={() => handleNavigate('founder')}
                  className={`w-full justify-start ${getNavButtonClasses(currentPage === 'founder')}`}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Founder</span>
                </button>
              )}
              {showNavigation && (
                <button
                  onClick={() => handleNavigate('cart')}
                  className={`w-full justify-start ${getNavButtonClasses(currentPage === 'cart')}`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Cart</span>
                  {totalItems > 0 && (
                    <span className="ml-auto rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                      {totalItems}
                    </span>
                  )}
                </button>
              )}
              <button
                onClick={handleLogout}
                className="w-full rounded-full border border-orange-500 px-4 py-3 text-left text-sm font-semibold text-orange-400 transition-colors hover:bg-orange-500 hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
    </>
  );
}
