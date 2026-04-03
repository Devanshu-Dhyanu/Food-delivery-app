import { useEffect, useState } from 'react';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import RestaurantList from './components/RestaurantList';
import RestaurantMenu from './components/RestaurantMenu';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderTracking from './components/OrderTracking';
import Login from './components/Login';
import AuthCallback from './components/AuthCallback';
import Onboarding from './components/Onboarding';
import { supabase } from './lib/supabase';

type Page = 'home' | 'menu' | 'cart' | 'checkout' | 'orders' | 'order-placed';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [placedOrderId, setPlacedOrderId] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

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
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (!isMounted) return;

        if (error) {
          console.error('Error checking user profile:', error);
          setHasProfile(false);
          return;
        }

        setHasProfile(!!data);
      } catch (error) {
        console.error('Unexpected error checking user profile:', error);
        if (isMounted) {
          setHasProfile(false);
        }
      }
    };

    const syncSession = (session: any) => {
      if (!isMounted) return;

      const nextUser = session?.user ?? null;
      setUser(nextUser);

      if (!nextUser) {
        setHasProfile(false);
        setLoading(false);
        return;
      }

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
          <Header currentPage={currentPage} onNavigate={setCurrentPage} showNavigation={false} />
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
          <Header currentPage={currentPage} onNavigate={setCurrentPage} showNavigation={false} />
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
        return <RestaurantList onSelectRestaurant={handleSelectRestaurant} />;
      case 'menu':
        return <RestaurantMenu restaurantId={selectedRestaurantId} onBack={() => setCurrentPage('home')} />;
      case 'cart':
        return <Cart onCheckout={handleCheckout} />;
      case 'checkout':
        return <Checkout onBack={() => setCurrentPage('cart')} onOrderPlaced={handleOrderPlaced} />;
      case 'orders':
        return <OrderTracking />;
      case 'order-placed':
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Order Placed Successfully!</h2>
              <p className="text-gray-400 mb-4">Order ID: {placedOrderId.slice(0, 8)}</p>
              <p className="text-gray-400">Redirecting to order tracking...</p>
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
        <Header currentPage={currentPage} onNavigate={setCurrentPage} />
        {renderPage()}
      </div>
    </CartProvider>
  );
}

export default App;
