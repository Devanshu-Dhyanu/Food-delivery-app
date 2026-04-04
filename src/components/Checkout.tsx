import { useState } from 'react';
import { ArrowLeft, User, Phone, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

interface CheckoutProps {
  onBack: () => void;
  onOrderPlaced: (orderId: string) => void;
}

export default function Checkout({ onBack, onOrderPlaced }: CheckoutProps) {
  const { cart, getTotalAmount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
  });

  const totalAmount = getTotalAmount() + 20;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error('You must be signed in to place an order.');

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            customer_name: formData.customerName,
            customer_phone: formData.customerPhone,
            delivery_address: formData.deliveryAddress,
            total_amount: totalAmount,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
        item_name: item.name,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      onOrderPlaced(order.id);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Cart</span>
      </button>

      <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">Delivery Details</h2>

          <div>
            <label className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
              <User className="w-4 h-4" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
              <Phone className="w-4 h-4" />
              <span>Phone Number</span>
            </label>
            <input
              type="tel"
              required
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
              <MapPin className="w-4 h-4" />
              <span>Delivery Address</span>
            </label>
            <textarea
              required
              value={formData.deliveryAddress}
              onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
              rows={3}
              placeholder="Enter your complete address (Room/Hostel/Block)"
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>

          <div className="space-y-2 mb-4">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-gray-400">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-700 pt-4 space-y-2">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span>₹{getTotalAmount().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Delivery Fee</span>
              <span>₹20.00</span>
            </div>
            <div className="flex justify-between text-xl font-bold">
              <span className="text-white">Total</span>
              <span className="text-orange-500">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}
