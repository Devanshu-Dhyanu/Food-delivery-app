import { useState } from 'react';
import { ArrowLeft, User, Phone, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { sanitizeName, sanitizePhone, sanitizeAddress } from '../lib/inputSanitization';
import {
  appendDeliveryPreference,
  DELIVERY_PREFERENCES,
  type DeliveryPreference,
} from '../lib/deliveryPreferences';
import PaymentOptions from './PaymentOptions';
import PaymentConfirmation from './PaymentConfirmation';

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
  const [deliveryPreference, setDeliveryPreference] = useState<DeliveryPreference | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
  });

  // Payment state
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'payment' | 'confirmation'>('form');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failure'>('pending');
  const [transactionId, setTransactionId] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');

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

  const createOrderWithLegacyInsert = async (userId: string, sanitizedData: { name: string; phone: string; address: string }) => {
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
          customer_name: sanitizedData.name,
          customer_phone: sanitizedData.phone,
          delivery_address: sanitizedData.address,
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
    
    // Form validation
    if (cart.length === 0 || !cartRestaurantId || !cartRestaurantName) {
      alert('Please add items from one restaurant before checkout.');
      return;
    }

    if (!formData.customerName.trim() || !formData.customerPhone.trim() || !formData.deliveryAddress.trim()) {
      alert('Please fill in all delivery details.');
      return;
    }

    // Move to payment step
    setCheckoutStep('payment');
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  const handlePaymentSuccess = async (transId: string) => {
    setTransactionId(transId);
    setPaymentStatus('success');
    
    // Now create the order after payment success
    setLoading(true);
    try {
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

      const sanitizedName = sanitizeName(formData.customerName);
      const sanitizedPhone = sanitizePhone(formData.customerPhone);
      const sanitizedAddress = sanitizeAddress(formData.deliveryAddress);
      
      const finalDeliveryAddress = appendDeliveryPreference(
        sanitizedAddress,
        deliveryPreference
      );

      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('is_open')
        .eq('id', cartRestaurantId)
        .maybeSingle();

      if (restaurantError) throw restaurantError;
      if (!restaurant) throw new Error('Restaurant not found.');
      if (!restaurant.is_open) throw new Error('This restaurant is currently closed.');

      let newOrderId = '';

      try {
        const { data, error } = await supabase.rpc('create_order_with_items', {
          p_customer_name: sanitizedName,
          p_customer_phone: sanitizedPhone,
          p_delivery_address: finalDeliveryAddress,
          p_restaurant_id: cartRestaurantId,
          p_restaurant_name: cartRestaurantName,
          p_subtotal_amount: subtotalAmount,
          p_delivery_fee: deliveryFee,
          p_total_amount: totalAmount,
          p_items: orderItemsPayload,
        });

        if (error) throw error;
        if (!data) throw new Error('Failed to create order.');

        newOrderId = data as string;
      } catch (error) {
        if (!shouldUseLegacyOrderFallback(error)) {
          throw error;
        }

        console.warn('Transactional RPC unavailable, falling back to legacy checkout path.', error);
        newOrderId = await createOrderWithLegacyInsert(user.id, { name: sanitizedName, phone: sanitizedPhone, address: finalDeliveryAddress });
      }

      setOrderId(newOrderId);
      setCheckoutStep('confirmation');
      clearCart();
    } catch (error) {
      console.error('Error placing order:', error);
      const message = error instanceof Error ? error.message : 'Failed to place order. Please try again.';
      alert(message);
      setPaymentStatus('failure');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentFailure = (error?: string) => {
    setPaymentStatus('failure');
    console.error('Payment failed:', error);
  };

  // Show payment confirmation
  if (checkoutStep === 'confirmation') {
    return (
      <PaymentConfirmation
        status={paymentStatus === 'success' ? 'success' : 'failure'}
        orderId={orderId}
        amount={totalAmount}
        transactionId={transactionId}
        paymentMethod={selectedPaymentMethod || 'Unknown'}
        onContinueShopping={() => onOrderPlaced(orderId)}
      />
    );
  }

  // Show payment options
  if (checkoutStep === 'payment') {
    return (
      <div className="min-h-screen bg-gray-900 px-4 py-12">
        <div className="mb-6 max-w-2xl mx-auto">
          <button
            onClick={() => setCheckoutStep('form')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Delivery Details</span>
          </button>
        </div>

        <div className="max-w-2xl mx-auto">
          <PaymentOptions
            onSelectMethod={handlePaymentMethodSelect}
            selectedMethod={selectedPaymentMethod}
            amount={totalAmount}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentFailure={handlePaymentFailure}
            formData={formData}
          />

          <button
            onClick={() => setCheckoutStep('form')}
            className="mt-6 w-full border border-gray-600 text-gray-300 font-semibold py-3 rounded-lg hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

        <div className="max-w-2xl mx-auto">
          <PaymentOptions
            onSelectMethod={handlePaymentMethodSelect}
            selectedMethod={selectedPaymentMethod}
            amount={totalAmount}
          />

          <div className="mt-8 flex gap-4">
            <button
              onClick={() => setCheckoutStep('form')}
              className="flex-1 border border-gray-600 text-gray-300 font-semibold py-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!selectedPaymentMethod) {
                  alert('Please select a payment method');
                  return;
                }
                // Simulate payment success for now
                handlePaymentSuccess(`TXN-${Date.now()}`);
              }}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

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

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-300">Silent Delivery Chips</p>
              <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Optional</p>
            </div>
            <p className="mb-3 text-sm leading-6 text-gray-400">
              Pick one quick handoff preference for the delivery partner.
            </p>
            <div className="flex flex-wrap gap-2">
              {DELIVERY_PREFERENCES.map((preference) => {
                const isSelected = deliveryPreference === preference;

                return (
                  <button
                    key={preference}
                    type="button"
                    onClick={() =>
                      setDeliveryPreference((current) =>
                        current === preference ? null : preference
                      )
                    }
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                      isSelected
                        ? 'border-orange-500/40 bg-orange-500/15 text-orange-200 shadow-lg shadow-orange-500/10'
                        : 'border-white/10 bg-gray-700/60 text-gray-300 hover:border-white/20 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {preference}
                  </button>
                );
              })}
            </div>
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
            {deliveryPreference && (
              <div className="flex flex-col gap-2 rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3">
                <span className="text-xs uppercase tracking-[0.16em] text-orange-300">
                  Delivery preference
                </span>
                <span className="text-sm font-medium text-orange-100">{deliveryPreference}</span>
              </div>
            )}
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
          {loading ? 'Proceeding...' : 'Continue to Payment'}
        </button>
      </form>
    </div>
  );
}
