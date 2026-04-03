import { ShoppingCart, Utensils } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  showNavigation?: boolean;
}

export default function Header({ currentPage, onNavigate, showNavigation = true }: HeaderProps) {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-4 py-3">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <Utensils className="w-8 h-8 text-orange-500" />
            <div className="flex flex-col items-start">
              <span className="text-xl font-bold text-white">vajraCognixia</span>
              <span className="text-xs text-gray-400">Campus Food Delivery</span>
            </div>
          </button>

          <nav className="flex items-center flex-wrap justify-end gap-3 sm:gap-6">
            {showNavigation && (
              <button
                onClick={() => onNavigate('home')}
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'home' ? 'text-orange-500' : 'text-gray-300 hover:text-white'
                }`}
              >
                Restaurants
              </button>
            )}
            {showNavigation && (
              <button
                onClick={() => onNavigate('orders')}
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'orders' ? 'text-orange-500' : 'text-gray-300 hover:text-white'
                }`}
              >
                Orders
              </button>
            )}
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.reload();
              }}
              className="rounded-full border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-400 transition-colors hover:bg-orange-500 hover:text-white"
            >
              Logout
            </button>
            {showNavigation && (
              <button
                onClick={() => onNavigate('cart')}
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
        </div>
      </div>
    </header>
  );
}
