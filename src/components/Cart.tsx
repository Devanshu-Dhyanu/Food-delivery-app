import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartProps {
  onCheckout: () => void;
}

export default function Cart({ onCheckout }: CartProps) {
  const { cart, removeFromCart, updateQuantity, getTotalAmount, getTotalItems } = useCart();
  const totalAmount = getTotalAmount();
  const totalItems = getTotalItems();

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-400">Add some delicious items to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Your Cart</h1>

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
              <p className="text-lg font-bold text-orange-500">₹{item.price}</p>
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
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Delivery Fee</span>
            <span>₹20.00</span>
          </div>
          <div className="border-t border-gray-700 pt-3 flex justify-between text-xl font-bold">
            <span className="text-white">Total</span>
            <span className="text-orange-500">₹{(totalAmount + 20).toFixed(2)}</span>
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
