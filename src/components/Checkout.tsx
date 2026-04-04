import { useState } from 'react';
import { ArrowLeft, User, Phone, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

interface CheckoutProps {
  onBack: () => void;
  onOrderPlaced: (orderId: string) => void;
}

type OrderItemPayload = {
  menu_item_id: string;
  quantity: number;
  price: number;
  item_name: string;
};

export default function Checkout({ onBack, onOrderPlaced }: CheckoutProps) {
  const { cart, cartRestaurantId, cartRestaurantName, getTotalAmount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
  });

  const subtotalAmount = getTotalAmount();
  const deliveryFee = 20;
  const totalAmount = subtotalAmount + deliveryFee;

  const orderItemsPayload: OrderItemPayload[] = cart.map((item) => ({
    menu_item_id: item.id,
    quantity: item.quantity,
    price: item.price,
    item_name: item.name,
  }));

  const shouldUseLegacyOrderFallback = (error: unknown) => {
    const maybeError = error as { code?: string; message?: string; details?: string };
    const details = `${maybeError?.message ?? ''} ${maybeError?.details ?? ''}`.toLowerCase();

    return (
      maybeError?.code === 'PGRST202' ||
      maybeError?.code === '42883' ||
      details.includes('create_order_with_items')
    );
  };

  const createOrderWithLegacyInsert = async (userId: string) => {
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('is_open')
      .eq('id', cartRestaurantId)
      .maybeSingle();

    if (restaurantError) throw restaurantError;
    if (!restaurant) throw new Error('Restaurant not found.');
    if (!restaurant.is_open) throw new Error('This restaurant is currently closed.');

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: userId,
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

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(
        orderItemsPayload.map((item) => ({
          order_id: order.id,
          ...item,
        }))
      );

    if (itemsError) throw itemsError;

    return order.id as string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (cart.length === 0 || !cartRestaurantId || !cartRestaurantName) {
        throw new Error('Please add items from one restaurant before checkout.');
      }

      const hasMixedRestaurantItems = cart.some((item) => item.restaurant_id !== cartRestaurantId);
      if (hasMixedRestaurantItems) {
        throw new Error('Cart contains items from multiple restaurants.');
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error('You must be signed in to place an order.');

      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('is_open')
        .eq('id', cartRestaurantId)
        .maybeSingle();

      if (restaurantError) throw restaurantError;
      if (!restaurant) throw new Error('Restaurant not found.');
      if (!restaurant.is_open) throw new Error('This restaurant is currently closed.');

      let orderId = '';

      try {
        const { data, error } = await supabase.rpc('create_order_with_items', {
          p_customer_name: formData.customerName,
          p_customer_phone: formData.customerPhone,
          p_delivery_address: formData.deliveryAddress,
          p_restaurant_id: cartRestaurantId,
          p_restaurant_name: cartRestaurantName,
          p_subtotal_amount: subtotalAmount,
          p_delivery_fee: deliveryFee,
          p_total_amount: totalAmount,
          p_items: orderItemsPayload,
        });

        if (error) throw error;
        if (!data) throw new Error('Failed to create order.');

        orderId = data as string;
      } catch (error) {
        if (!shouldUseLegacyOrderFallback(error)) {
          throw error;
        }

        console.warn('Transactional RPC unavailable, falling back to legacy checkout path.', error);
        orderId = await createOrderWithLegacyInsert(user.id);
      }

      clearCart();
      onOrderPlaced(orderId);
    } catch (error) {
      console.error('Error placing order:', error);
      const message = error instanceof Error ? error.message : 'Failed to place order. Please try again.';
      alert(message);
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

      {cartRestaurantName && (
        <div className="mb-6 rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-300">
          Order will be placed for <span className="font-semibold text-white">{cartRestaurantName}</span>.
        </div>
      )}

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
                <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-700 pt-4 space-y-2">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span>Rs. {subtotalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Delivery Fee</span>
              <span>Rs. {deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold">
              <span className="text-white">Total</span>
              <span className="text-orange-500">Rs. {totalAmount.toFixed(2)}</span>
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
