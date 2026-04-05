import { useEffect, useState, type CSSProperties } from 'react';
import { Bell, Menu, Package, ShoppingCart, Utensils, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  showNavigation?: boolean;
  hasUnreadAnnouncements?: boolean;
}

const ACTIVE_ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'out_for_delivery'];

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

export default function Header({
  currentPage,
  onNavigate,
  showNavigation = true,
  hasUnreadAnnouncements = false,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoBurst, setShowLogoBurst] = useState(false);
  const [logoBurstKey, setLogoBurstKey] = useState(0);
  const [hasActiveOrder, setHasActiveOrder] = useState(false);
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();
  const logoSignal = hasActiveOrder ? 'active-order' : totalItems > 0 ? 'cart' : 'idle';
  const logoButtonTitle =
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
    onNavigate(page);
  };
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

  const handleLogoClick = () => {
    setShowLogoBurst(true);
    setLogoBurstKey((current) => current + 1);

    if (currentPage !== 'home') {
      handleNavigate('home');
    }
  };

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await supabase.auth.signOut();
    window.location.reload();
  };

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
              <span className="hidden text-xs text-gray-400 sm:block">Campus Food Delivery</span>
            </div>
          </button>

          <nav className="hidden md:flex items-center flex-wrap justify-end gap-3 sm:gap-6">
            {showNavigation && (
              <button
                onClick={() => handleNavigate('home')}
                className={getNavButtonClasses(currentPage === 'home')}
              >
                <Utensils className="h-4 w-4" />
                <span>Restaurants</span>
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
              <button
                onClick={() => handleNavigate('orders')}
                className={getNavButtonClasses(currentPage === 'orders')}
              >
                <Package className="h-4 w-4" />
                <span>Orders</span>
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

        {mobileMenuOpen && (
          <div className="border-t border-white/5 pb-4 pt-3 md:hidden">
            <div className="space-y-2 rounded-[24px] border border-white/5 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/95 p-3 shadow-xl shadow-black/20">
              {showNavigation && (
                <button
                  onClick={() => handleNavigate('home')}
                  className={`w-full justify-start ${getNavButtonClasses(currentPage === 'home')}`}
                >
                  <Utensils className="h-4 w-4" />
                  <span>Restaurants</span>
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
                  onClick={() => handleNavigate('orders')}
                  className={`w-full justify-start ${getNavButtonClasses(currentPage === 'orders')}`}
                >
                  <Package className="h-4 w-4" />
                  <span>Orders</span>
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
