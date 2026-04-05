import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface ContinueOrderPillProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function ContinueOrderPill({
  currentPage,
  onNavigate,
}: ContinueOrderPillProps) {
  const { cart, cartRestaurantName, getTotalAmount, getTotalItems } = useCart();
  const totalItems = getTotalItems();

  if (
    cart.length === 0 ||
    currentPage === 'cart' ||
    currentPage === 'checkout' ||
    currentPage === 'order-placed'
  ) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <button
        type="button"
        onClick={() => onNavigate('cart')}
        className="pointer-events-auto flex w-full max-w-xl items-center justify-between gap-4 rounded-full border border-orange-400/30 bg-gray-950/95 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-orange-400/45 hover:bg-gray-950"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-orange-500/20 bg-orange-500/15 text-orange-300">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-semibold text-white">
              Continue with {totalItems} item{totalItems === 1 ? '' : 's'}
            </p>
            <p className="truncate text-xs text-gray-400">
              {cartRestaurantName ? `${cartRestaurantName} • ` : ''}Rs. {getTotalAmount().toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white">
          <span>Open cart</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </button>
    </div>
  );
}
