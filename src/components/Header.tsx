import { useState } from 'react';
import { Bell, Menu, Package, ShoppingCart, Utensils, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  showNavigation?: boolean;
  hasUnreadAnnouncements?: boolean;
}

export default function Header({
  currentPage,
  onNavigate,
  showNavigation = true,
  hasUnreadAnnouncements = false,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();
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
  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-4 py-3">
          <button
            onClick={() => handleNavigate('home')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <Utensils className="w-8 h-8 text-orange-500" />
            <div className="flex flex-col items-start">
              <span className="text-xl font-bold text-white">vajraCognixia</span>
              <span className="text-xs text-gray-400">Campus Food Delivery</span>
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
  );
}
