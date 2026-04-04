import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartProps {
  onCheckout: () => void;
  onBrowseRestaurants?: () => void;
}

export default function Cart({ onCheckout, onBrowseRestaurants }: CartProps) {
  const { cart, cartRestaurantName, removeFromCart, updateQuantity, getTotalAmount, getTotalItems } = useCart();
  const totalAmount = getTotalAmount();
  const totalItems = getTotalItems();

  if (cart.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-2xl rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 px-6 py-12 text-center shadow-2xl shadow-black/20 sm:px-10">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/10">
            <ShoppingBag className="h-12 w-12 text-orange-400" />
          </div>

          <h2 className="mb-3 text-3xl font-bold text-white">Your cart is feeling light</h2>
          <p className="mx-auto mb-6 max-w-md text-sm leading-6 text-gray-400 sm:text-base">
            Looks like you have not added anything yet. Explore restaurants and pick your next meal in just a few taps.
          </p>

          <div className="mb-8 flex flex-wrap items-center justify-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
            <span className="rounded-full border border-gray-700 bg-gray-800/80 px-4 py-2">Fresh picks</span>
            <span className="rounded-full border border-gray-700 bg-gray-800/80 px-4 py-2">Fast delivery</span>
            <span className="rounded-full border border-gray-700 bg-gray-800/80 px-4 py-2">Campus favorites</span>
          </div>

          {onBrowseRestaurants && (
            <button
              onClick={onBrowseRestaurants}
              className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
            >
              Browse Restaurants
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Your Cart</h1>

      {cartRestaurantName && (
        <div className="mb-6 rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-300">
          Ordering from <span className="font-semibold text-white">{cartRestaurantName}</span>. To switch restaurants,
          remove these items first.
        </div>
      )}

      <div className="space-y-4 mb-8">
        {cart.map((item) => (
          <div key={item.id} className="bg-gray-800 rounded-lg p-4 flex items-center space-x-4">
            {item.image_url && (
              <div className="w-20 h-20 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">{item.name}</h3>
              <p className="text-sm text-gray-400 mb-2 line-clamp-1">{item.description}</p>
              <p className="text-lg font-bold text-orange-500">Rs. {item.price}</p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4 text-white" />
              </button>

              <span className="text-white font-semibold w-8 text-center">{item.quantity}</span>

              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>

            <button
              onClick={() => removeFromCart(item.id)}
              className="p-2 text-red-500 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-gray-400">
            <span>Items ({totalItems})</span>
            <span>Rs. {totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Delivery Fee</span>
            <span>Rs. 20.00</span>
          </div>
          <div className="border-t border-gray-700 pt-3 flex justify-between text-xl font-bold">
            <span className="text-white">Total</span>
            <span className="text-orange-500">Rs. {(totalAmount + 20).toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={onCheckout}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
