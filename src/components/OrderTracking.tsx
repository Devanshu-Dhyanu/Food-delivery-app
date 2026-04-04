import { useEffect, useState } from 'react';
import { Clock, CheckCircle, Package, Truck, MapPin } from 'lucide-react';
import DeliveryFeedbackModal from './DeliveryFeedbackModal';
import { supabase, DeliveryFeedback, Order, OrderItem } from '../lib/supabase';

interface OrderWithItems extends Order {
  items: OrderItem[];
  feedback: DeliveryFeedback | null;
}

export default function OrderTracking() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFeedbackOrder, setActiveFeedbackOrder] = useState<OrderWithItems | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [dismissedOrderIds, setDismissedOrderIds] = useState<string[]>([]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        setOrders([]);
        return;
      }

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (ordersError) throw ordersError;

      const orderIds = (ordersData || []).map((order) => order.id);
      let feedbackByOrderId: Record<string, DeliveryFeedback> = {};

      if (orderIds.length > 0) {
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('delivery_feedback')
          .select('*')
          .in('order_id', orderIds);

        if (feedbackError) throw feedbackError;

        feedbackByOrderId = (feedbackData || []).reduce<Record<string, DeliveryFeedback>>((acc, feedback) => {
          acc[feedback.order_id] = feedback;
          return acc;
        }, {});
      }

      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

          return {
            ...order,
            items: items || [],
            feedback: feedbackByOrderId[order.id] || null,
          };
        })
      );

      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'confirmed':
        return 'text-blue-500';
      case 'preparing':
        return 'text-purple-500';
      case 'out_for_delivery':
        return 'text-orange-500';
      case 'delivered':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6" />;
      case 'confirmed':
        return <CheckCircle className="w-6 h-6" />;
      case 'preparing':
        return <Package className="w-6 h-6" />;
      case 'out_for_delivery':
        return <Truck className="w-6 h-6" />;
      case 'delivered':
        return <CheckCircle className="w-6 h-6" />;
      default:
        return <Clock className="w-6 h-6" />;
    }
  };

  const getStatusText = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const latestDeliveredOrder = orders.find((order) => order.status === 'delivered');

  useEffect(() => {
    if (!latestDeliveredOrder || activeFeedbackOrder) return;
    if (latestDeliveredOrder.feedback) return;
    if (dismissedOrderIds.includes(latestDeliveredOrder.id)) return;

    setActiveFeedbackOrder(latestDeliveredOrder);
  }, [activeFeedbackOrder, dismissedOrderIds, latestDeliveredOrder]);

  const handleDismissFeedback = () => {
    if (!activeFeedbackOrder) return;

    const orderId = activeFeedbackOrder.id;
    setDismissedOrderIds((prev) => (prev.includes(orderId) ? prev : [...prev, orderId]));
    setActiveFeedbackOrder(null);

    void (async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error('You must be signed in to dismiss feedback.');

        const { error } = await supabase.from('delivery_feedback').insert([
          {
            order_id: orderId,
            user_id: user.id,
            rating: null,
            feedback_text: null,
            skipped_at: new Date().toISOString(),
          },
        ]);

        if (error && error.code !== '23505') throw error;
      } catch (error) {
        console.error('Error saving dismissed feedback prompt:', error);
      } finally {
        void fetchOrders();
      }
    })();
  };

  const handleSubmitFeedback = async (rating: number, feedbackText: string) => {
    if (!activeFeedbackOrder) return;

    setSubmittingFeedback(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error('You must be signed in to submit feedback.');

      const { error } = await supabase.from('delivery_feedback').insert([
        {
          order_id: activeFeedbackOrder.id,
          user_id: user.id,
          rating,
          feedback_text: feedbackText || null,
          skipped_at: null,
        },
      ]);

      if (error && error.code !== '23505') throw error;

      setDismissedOrderIds((prev) =>
        prev.includes(activeFeedbackOrder.id) ? prev : [...prev, activeFeedbackOrder.id]
      );
      setActiveFeedbackOrder(null);
      void fetchOrders();
    } catch (error) {
      console.error('Error submitting delivery feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">Loading orders...</div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Your Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-24 h-24 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No orders yet</h2>
            <p className="text-gray-400">Your order history will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">
                      Order ID: {order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-gray-400">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className={`flex items-center space-x-2 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="font-semibold">{getStatusText(order.status)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4 mb-4">
                  <div className="flex items-start space-x-2 text-gray-400 mb-2">
                    <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-white">{order.customer_name}</p>
                      <p className="text-sm">{order.customer_phone}</p>
                      <p className="text-sm">{order.delivery_address}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Order Items</h3>
                  <div className="space-y-2 mb-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-gray-400 text-sm">
                        <span>
                          {item.item_name} x {item.quantity}
                        </span>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                    <span className="text-white font-semibold">Total Amount</span>
                    <span className="text-xl font-bold text-orange-500">
                      ₹{order.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <div className={`flex-1 h-2 rounded-full ${order.status !== 'pending' ? 'bg-green-500' : 'bg-gray-700'}`} />
                  <div className={`flex-1 h-2 rounded-full ${order.status !== 'pending' && order.status !== 'confirmed' ? 'bg-green-500' : 'bg-gray-700'}`} />
                  <div className={`flex-1 h-2 rounded-full ${order.status === 'out_for_delivery' || order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-700'}`} />
                  <div className={`flex-1 h-2 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-700'}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeFeedbackOrder && (
        <DeliveryFeedbackModal
          loading={submittingFeedback}
          orderId={activeFeedbackOrder.id}
          onClose={handleDismissFeedback}
          onSubmit={handleSubmitFeedback}
        />
      )}
    </>
  );
}
