import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle,
  Clock,
  MapPin,
  Package,
  PhoneCall,
  RotateCcw,
  Truck,
  XCircle,
} from 'lucide-react';
import BrandedLoader from './BrandedLoader';
import OrderCancellationRequestModal from './OrderCancellationRequestModal';
import DeliveryFeedbackModal from './DeliveryFeedbackModal';
import OrderIssueReportModal from './OrderIssueReportModal';
import { useCart } from '../context/CartContext';
import { useDeliveryVoiceCall } from '../context/DeliveryVoiceCallContext';
import { sanitizeText } from '../lib/inputSanitization';
import {
  supabase,
  CartItem,
  OrderCancellationRequest,
  DeliveryFeedback,
  MenuItem,
  Order,
  OrderItem,
  OrderIssueReport,
  type OrderIssueType,
} from '../lib/supabase';
import {
  formatScheduledDelivery,
  parseOrderDeliveryDetails,
} from '../lib/orderDeliveryDetails';

interface OrderWithItems extends Order {
  items: OrderItem[];
  feedback: DeliveryFeedback | null;
  issueReport: OrderIssueReport | null;
  cancellationRequest: OrderCancellationRequest | null;
}

interface OrderTrackingProps {
  onNavigate?: (page: 'cart') => void;
}

const getIssueTypeLabel = (issueType: OrderIssueType) => {
  switch (issueType) {
    case 'missing_item':
      return 'Missing item';
    case 'wrong_order':
      return 'Wrong order';
    case 'late_delivery':
      return 'Late delivery';
    case 'other':
    default:
      return 'Other issue';
  }
};

const getIssueStatusLabel = (status: OrderIssueReport['status']) => {
  switch (status) {
    case 'open':
      return 'Open';
    case 'reviewing':
      return 'Under review';
    case 'resolved':
      return 'Resolved';
    case 'refund_approved':
      return 'Refund approved';
    case 'refund_rejected':
      return 'Refund rejected';
    default:
      return 'Open';
  }
};

const getIssueStatusClasses = (status: OrderIssueReport['status']) => {
  switch (status) {
    case 'reviewing':
      return 'border-yellow-500/25 bg-yellow-500/10 text-yellow-200';
    case 'resolved':
      return 'border-blue-500/25 bg-blue-500/10 text-blue-200';
    case 'refund_approved':
      return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200';
    case 'refund_rejected':
      return 'border-red-500/25 bg-red-500/10 text-red-200';
    case 'open':
    default:
      return 'border-orange-500/25 bg-orange-500/10 text-orange-200';
  }
};

const isIssueReportingSchemaMissing = (error: unknown) => {
  const maybeError = error as { code?: string; message?: string; details?: string };
  const details = `${maybeError?.code ?? ''} ${maybeError?.message ?? ''} ${maybeError?.details ?? ''}`.toLowerCase();

  return (
    details.includes('order_issue_reports') ||
    details.includes('42p01') ||
    details.includes('pgrst')
  );
};

const getCancellationStatusLabel = (status: OrderCancellationRequest['status']) => {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'open':
    default:
      return 'Pending review';
  }
};

const getCancellationStatusClasses = (status: OrderCancellationRequest['status']) => {
  switch (status) {
    case 'approved':
      return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200';
    case 'rejected':
      return 'border-red-500/25 bg-red-500/10 text-red-200';
    case 'open':
    default:
      return 'border-yellow-500/25 bg-yellow-500/10 text-yellow-200';
  }
};

const isCancellationSchemaMissing = (error: unknown) => {
  const maybeError = error as { code?: string; message?: string; details?: string };
  const details = `${maybeError?.code ?? ''} ${maybeError?.message ?? ''} ${maybeError?.details ?? ''}`.toLowerCase();

  return (
    details.includes('order_cancellation_requests') ||
    details.includes('42p01') ||
    details.includes('pgrst')
  );
};

const getDeliveryPartnerStatusLabel = (status: Order['delivery_assignment_status']) => {
  switch (status) {
    case 'assigned':
      return 'Delivery partner assigned';
    case 'picked_up':
      return 'Your order is with the delivery partner';
    case 'delivered':
      return 'Handled by delivery partner';
    case 'unassigned':
    default:
      return 'Waiting for delivery partner';
  }
};

const getDeliveryPartnerStatusClasses = (status: Order['delivery_assignment_status']) => {
  switch (status) {
    case 'assigned':
      return 'border-sky-500/25 bg-sky-500/10 text-sky-100';
    case 'picked_up':
      return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100';
    case 'delivered':
      return 'border-green-500/25 bg-green-500/10 text-green-100';
    case 'unassigned':
    default:
      return 'border-white/10 bg-white/5 text-gray-200';
  }
};

export default function OrderTracking({ onNavigate }: OrderTrackingProps) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFeedbackOrder, setActiveFeedbackOrder] = useState<OrderWithItems | null>(null);
  const [activeCancellationOrder, setActiveCancellationOrder] = useState<OrderWithItems | null>(null);
  const [activeIssueOrder, setActiveIssueOrder] = useState<OrderWithItems | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [submittingCancellationRequest, setSubmittingCancellationRequest] = useState(false);
  const [submittingIssueReport, setSubmittingIssueReport] = useState(false);
  const [dismissedOrderIds, setDismissedOrderIds] = useState<string[]>([]);
  const [feedbackEnabled, setFeedbackEnabled] = useState(true);
  const [cancellationEnabled, setCancellationEnabled] = useState(true);
  const [issueReportingEnabled, setIssueReportingEnabled] = useState(true);
  const [reorderingOrderId, setReorderingOrderId] = useState<string | null>(null);
  const [reorderMessage, setReorderMessage] = useState<{
    tone: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const { cart, cartRestaurantName, replaceCart } = useCart();
  const { startCustomerCall } = useDeliveryVoiceCall();

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
      let cancellationRequestsByOrderId: Record<string, OrderCancellationRequest> = {};
      let issueReportsByOrderId: Record<string, OrderIssueReport> = {};

      if (feedbackEnabled && orderIds.length > 0) {
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('delivery_feedback')
          .select('*')
          .in('order_id', orderIds);

        if (feedbackError) {
          console.warn('Delivery feedback is unavailable. Orders will still be shown.', feedbackError);
          setFeedbackEnabled(false);
        } else {
          feedbackByOrderId = (feedbackData || []).reduce<Record<string, DeliveryFeedback>>((acc, feedback) => {
            acc[feedback.order_id] = feedback;
            return acc;
          }, {});
        }
      }

      if (cancellationEnabled && orderIds.length > 0) {
        const { data: cancellationRequestData, error: cancellationRequestError } = await supabase
          .from('order_cancellation_requests')
          .select('*')
          .in('order_id', orderIds);

        if (cancellationRequestError) {
          if (isCancellationSchemaMissing(cancellationRequestError)) {
            console.warn(
              'Order cancellation requests are unavailable. Orders will still be shown.',
              cancellationRequestError
            );
            setCancellationEnabled(false);
          } else {
            throw cancellationRequestError;
          }
        } else {
          cancellationRequestsByOrderId = (cancellationRequestData || []).reduce<
            Record<string, OrderCancellationRequest>
          >((acc, cancellationRequest) => {
            acc[cancellationRequest.order_id] = cancellationRequest;
            return acc;
          }, {});
        }
      }

      if (issueReportingEnabled && orderIds.length > 0) {
        const { data: issueReportData, error: issueReportError } = await supabase
          .from('order_issue_reports')
          .select('*')
          .in('order_id', orderIds);

        if (issueReportError) {
          if (isIssueReportingSchemaMissing(issueReportError)) {
            console.warn(
              'Order issue reports are unavailable. Orders will still be shown.',
              issueReportError
            );
            setIssueReportingEnabled(false);
          } else {
            throw issueReportError;
          }
        } else {
          issueReportsByOrderId = (issueReportData || []).reduce<Record<string, OrderIssueReport>>(
            (acc, issueReport) => {
              acc[issueReport.order_id] = issueReport;
              return acc;
            },
            {}
          );
        }
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
            cancellationRequest: cancellationRequestsByOrderId[order.id] || null,
            issueReport: issueReportsByOrderId[order.id] || null,
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
      case 'cancelled':
        return 'text-red-400';
      case 'rejected':
        return 'text-red-500';
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
      case 'cancelled':
        return <XCircle className="w-6 h-6" />;
      case 'rejected':
        return <XCircle className="w-6 h-6" />;
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

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'pending':
        return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300';
      case 'confirmed':
        return 'border-blue-500/30 bg-blue-500/10 text-blue-300';
      case 'preparing':
        return 'border-purple-500/30 bg-purple-500/10 text-purple-300';
      case 'out_for_delivery':
        return 'border-orange-500/30 bg-orange-500/10 text-orange-300';
      case 'delivered':
        return 'border-green-500/30 bg-green-500/10 text-green-300';
      case 'cancelled':
        return 'border-red-500/30 bg-red-500/10 text-red-200';
      case 'rejected':
        return 'border-red-500/30 bg-red-500/10 text-red-300';
      default:
        return 'border-gray-700 bg-gray-800 text-gray-300';
    }
  };

  const getTimelineProgress = (status: string) => {
    switch (status) {
      case 'pending':
        return 1;
      case 'confirmed':
        return 2;
      case 'preparing':
        return 3;
      case 'cancelled':
        return 2;
      case 'out_for_delivery':
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const latestDeliveredOrder = orders.find(
    (order) => order.status === 'delivered' && !order.issueReport
  );

  useEffect(() => {
    if (!feedbackEnabled) return;
    if (!latestDeliveredOrder || activeFeedbackOrder || activeCancellationOrder || activeIssueOrder) return;
    if (latestDeliveredOrder.feedback) return;
    if (dismissedOrderIds.includes(latestDeliveredOrder.id)) return;

    setActiveFeedbackOrder(latestDeliveredOrder);
  }, [
    activeFeedbackOrder,
    activeCancellationOrder,
    activeIssueOrder,
    dismissedOrderIds,
    feedbackEnabled,
    latestDeliveredOrder,
  ]);

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

  const handleSubmitCancellationRequest = async ({ reason }: { reason: string }) => {
    if (!activeCancellationOrder) return;

    setSubmittingCancellationRequest(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error('You must be signed in to request cancellation.');

      const sanitizedReason = sanitizeText(
        reason,
        'Cancellation reason',
        10,
        500
      );

      const { error } = await supabase.from('order_cancellation_requests').insert([
        {
          order_id: activeCancellationOrder.id,
          user_id: user.id,
          reason: sanitizedReason,
          status: 'open',
        },
      ]);

      if (error && error.code !== '23505') throw error;

      setActiveCancellationOrder(null);
      void fetchOrders();
    } catch (error) {
      console.error('Error submitting order cancellation request:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to submit your cancellation request. Please try again.'
      );
    } finally {
      setSubmittingCancellationRequest(false);
    }
  };

  const handleSubmitIssueReport = async ({
    issueType,
    description,
    refundRequested,
  }: {
    issueType: OrderIssueType;
    description: string;
    refundRequested: boolean;
  }) => {
    if (!activeIssueOrder) return;

    setSubmittingIssueReport(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error('You must be signed in to report an issue.');

      const sanitizedDescription = sanitizeText(
        description,
        'Issue description',
        10,
        1000
      );

      const { error } = await supabase.from('order_issue_reports').insert([
        {
          order_id: activeIssueOrder.id,
          user_id: user.id,
          issue_type: issueType,
          description: sanitizedDescription,
          refund_requested: refundRequested,
          status: 'open',
        },
      ]);

      if (error && error.code !== '23505') throw error;

      setActiveIssueOrder(null);
      void fetchOrders();
    } catch (error) {
      console.error('Error submitting order issue report:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to submit your issue report. Please try again.'
      );
    } finally {
      setSubmittingIssueReport(false);
    }
  };

  const handleReorder = async (order: OrderWithItems) => {
    if (!order.restaurant_id) {
      setReorderMessage({
        tone: 'error',
        text: 'This order cannot be reordered because the restaurant details are unavailable.',
      });
      return;
    }

    if (order.items.length === 0) {
      setReorderMessage({
        tone: 'error',
        text: 'This order has no items to reorder yet.',
      });
      return;
    }

    if (cart.length > 0) {
      const shouldReplaceCart = window.confirm(
        cartRestaurantName
          ? `Your cart already has items from ${cartRestaurantName}. Replace them with this reorder?`
          : 'Your cart already has items. Replace them with this reorder?'
      );

      if (!shouldReplaceCart) {
        return;
      }
    }

    setReorderingOrderId(order.id);
    setReorderMessage(null);

    try {
      const uniqueMenuItemIds = Array.from(
        new Set(order.items.map((item) => item.menu_item_id).filter(Boolean))
      );

      const [{ data: restaurantData, error: restaurantError }, { data: menuItemsData, error: menuItemsError }] =
        await Promise.all([
          supabase
            .from('restaurants')
            .select('id, name, is_open')
            .eq('id', order.restaurant_id)
            .maybeSingle(),
          supabase.from('menu_items').select('*').in('id', uniqueMenuItemIds),
        ]);

      if (restaurantError) throw restaurantError;
      if (menuItemsError) throw menuItemsError;
      if (!restaurantData) {
        throw new Error('This restaurant is no longer available for reorder.');
      }

      if (!restaurantData.is_open) {
        throw new Error(`${restaurantData.name} is currently closed. Please try again when it opens.`);
      }

      const menuItemsById = (menuItemsData || []).reduce<Record<string, MenuItem>>((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});

      const reorderedItems = order.items.reduce<CartItem[]>((acc, orderItem) => {
        const menuItem = menuItemsById[orderItem.menu_item_id];

        if (!menuItem || !menuItem.is_available) {
          return acc;
        }

        const existingItem = acc.find((item) => item.id === menuItem.id);

        if (existingItem) {
          existingItem.quantity += orderItem.quantity;
          return acc;
        }

        acc.push({
          ...menuItem,
          quantity: orderItem.quantity,
          restaurant_name: restaurantData.name,
        });

        return acc;
      }, []);

      if (reorderedItems.length === 0) {
        throw new Error('None of the items from this order are currently available to reorder.');
      }

      replaceCart(reorderedItems);

      const skippedItemCount = order.items.length - reorderedItems.length;
      const message =
        skippedItemCount > 0
          ? `${reorderedItems.length} item${reorderedItems.length === 1 ? '' : 's'} added to cart. ${skippedItemCount} unavailable item${skippedItemCount === 1 ? ' was' : 's were'} skipped.`
          : 'This order has been added back to your cart.';

      setReorderMessage({
        tone: skippedItemCount > 0 ? 'info' : 'success',
        text: message,
      });
      onNavigate?.('cart');
    } catch (error) {
      console.error('Error reordering items:', error);
      setReorderMessage({
        tone: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'We could not reorder this order right now. Please try again.',
      });
    } finally {
      setReorderingOrderId(null);
    }
  };

  if (loading) {
    return <BrandedLoader message="Loading your orders..." />;
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Your Orders</h1>

        {reorderMessage && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
              reorderMessage.tone === 'success'
                ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100'
                : reorderMessage.tone === 'info'
                  ? 'border-blue-500/25 bg-blue-500/10 text-blue-100'
                  : 'border-red-500/25 bg-red-500/10 text-red-100'
            }`}
          >
            {reorderMessage.text}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-24 h-24 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No orders yet</h2>
            <p className="text-gray-400">Your order history will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isRejected = order.status === 'rejected';
              const isCancelled = order.status === 'cancelled';
              const isDelivered = order.status === 'delivered';
              const canReorder =
                !!order.restaurant_id &&
                order.items.length > 0 &&
                (isDelivered || isCancelled || isRejected);
              const canRequestCancellation =
                cancellationEnabled &&
                !order.cancellationRequest &&
                (order.status === 'pending' || order.status === 'confirmed');
              const canReportIssue =
                isDelivered && issueReportingEnabled && !order.issueReport;
              const timelineProgress = getTimelineProgress(order.status);
              const statusText = getStatusText(order.status);
              const deliveryDetails = parseOrderDeliveryDetails(order.delivery_address);

              return (
                <div key={order.id} className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/95 p-6 shadow-lg shadow-black/20">
                  <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="mb-1 text-xs uppercase tracking-[0.18em] text-gray-500">
                        Order ID: {order.id.slice(0, 8)}
                      </p>
                      {order.restaurant_name && (
                        <p className="mb-1 text-lg font-semibold text-white">
                          Restaurant: {order.restaurant_name}
                        </p>
                      )}
                      <p className="text-sm text-gray-400">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-3">
                      {canReorder && (
                        <button
                          type="button"
                          onClick={() => void handleReorder(order)}
                          disabled={reorderingOrderId === order.id}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span>
                            {reorderingOrderId === order.id ? 'Reordering...' : 'Reorder'}
                          </span>
                        </button>
                      )}

                      <div className={`inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-sm font-semibold ${getStatusBadgeClasses(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span>{statusText}</span>
                      </div>
                    </div>
                  </div>

                  {isRejected && (
                    <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                      This order was rejected by the restaurant.
                    </div>
                  )}

                  {isCancelled && (
                    <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                      This order has been cancelled.
                    </div>
                  )}

                  {order.cancellationRequest && (
                    <div className="mb-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="mb-2 flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-yellow-300" />
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-yellow-200">
                              Cancellation Request Submitted
                            </p>
                          </div>
                          <p className="max-w-2xl text-sm leading-6 text-yellow-100/90">
                            {order.cancellationRequest.reason}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-gray-200">
                              Submitted {new Date(order.cancellationRequest.created_at).toLocaleString()}
                            </span>
                          </div>
                          {order.cancellationRequest.admin_notes && (
                            <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-200">
                              <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">
                                Admin note
                              </p>
                              <p>{order.cancellationRequest.admin_notes}</p>
                            </div>
                          )}
                        </div>

                        <span
                          className={`inline-flex self-start rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getCancellationStatusClasses(order.cancellationRequest.status)}`}
                        >
                          {getCancellationStatusLabel(order.cancellationRequest.status)}
                        </span>
                      </div>
                    </div>
                  )}

                  {canRequestCancellation && (
                    <div className="mb-5 rounded-2xl border border-dashed border-yellow-500/30 bg-gray-950/40 p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="mb-1 text-sm font-semibold text-white">
                            Need to cancel this order?
                          </p>
                          <p className="text-sm leading-6 text-gray-400">
                            You can request cancellation while the order is still pending or confirmed.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveCancellationOrder(order)}
                          className="inline-flex items-center justify-center rounded-full border border-yellow-500/35 bg-yellow-500/10 px-5 py-3 text-sm font-semibold text-yellow-100 transition-colors hover:bg-yellow-500/20"
                        >
                          Request cancellation
                        </button>
                      </div>
                    </div>
                  )}

                  {order.issueReport && (
                    <div className="mb-5 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-300" />
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-200">
                              Issue Report Submitted
                            </p>
                          </div>
                          <p className="text-base font-semibold text-white">
                            {getIssueTypeLabel(order.issueReport.issue_type)}
                          </p>
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-orange-100/85">
                            {order.issueReport.description}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-gray-200">
                              Submitted {new Date(order.issueReport.created_at).toLocaleString()}
                            </span>
                            {order.issueReport.refund_requested && (
                              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-200">
                                Refund review requested
                              </span>
                            )}
                          </div>
                          {order.issueReport.admin_notes && (
                            <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-200">
                              <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">
                                Admin note
                              </p>
                              <p>{order.issueReport.admin_notes}</p>
                            </div>
                          )}
                        </div>

                        <span
                          className={`inline-flex self-start rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getIssueStatusClasses(order.issueReport.status)}`}
                        >
                          {getIssueStatusLabel(order.issueReport.status)}
                        </span>
                      </div>
                    </div>
                  )}

                  {canReportIssue && (
                    <div className="mb-5 rounded-2xl border border-dashed border-orange-500/30 bg-gray-950/40 p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="mb-1 text-sm font-semibold text-white">
                            Missing item, wrong order, or late delivery?
                          </p>
                          <p className="text-sm leading-6 text-gray-400">
                            Raise an issue after delivery and request refund review if needed.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveIssueOrder(order)}
                          className="inline-flex items-center justify-center rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                        >
                          Report issue / Refund request
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-[1.1fr,0.9fr]">
                    <div className="rounded-2xl border border-gray-800 bg-gray-950/30 p-4">
                      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                        <MapPin className="h-4 w-4" />
                        Delivery Details
                      </div>
                      <div className="space-y-1 text-sm text-gray-400">
                        <p className="font-medium text-white">{order.customer_name}</p>
                        <p>{order.customer_phone}</p>
                        <p>{deliveryDetails.address}</p>
                        {deliveryDetails.preference && (
                          <div className="pt-2">
                            <span className="inline-flex rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-200">
                              {deliveryDetails.preference}
                            </span>
                          </div>
                        )}
                        {deliveryDetails.scheduledDeliveryAt && (
                          <div className="pt-2">
                            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200">
                              <CalendarClock className="h-3.5 w-3.5" />
                              Requested for {formatScheduledDelivery(deliveryDetails.scheduledDeliveryAt)}
                            </span>
                          </div>
                        )}
                      </div>

                      {order.delivery_partner_name && order.delivery_partner_phone && (
                        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getDeliveryPartnerStatusClasses(order.delivery_assignment_status)}`}
                            >
                              {getDeliveryPartnerStatusLabel(order.delivery_assignment_status)}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-white">{order.delivery_partner_name}</p>
                          <p className="mt-1 text-sm text-gray-300">{order.delivery_partner_phone}</p>
                          <div className="mt-3 flex flex-wrap gap-3">
                            {order.delivery_partner_user_id &&
                              ['assigned', 'picked_up'].includes(order.delivery_assignment_status) && (
                                <button
                                  type="button"
                                  onClick={() => void startCustomerCall(order)}
                                  className="inline-flex items-center gap-2 rounded-full border border-sky-500/25 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-100 transition-colors hover:bg-sky-500/20"
                                >
                                  <PhoneCall className="h-4 w-4" />
                                  In-app voice call
                                </button>
                              )}

                            <a
                              href={`tel:${order.delivery_partner_phone}`}
                              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition-colors hover:bg-emerald-500/20"
                            >
                              <PhoneCall className="h-4 w-4" />
                              Call delivery partner
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-gray-800 bg-gray-950/30 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Order Summary</h3>
                        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-300">
                          {order.items.length} item{order.items.length === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between gap-4 text-sm text-gray-400">
                            <span>
                              {item.item_name} x {item.quantity}
                            </span>
                            <span className="whitespace-nowrap">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 space-y-2 border-t border-gray-800 pt-4">
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>Subtotal</span>
                          <span>Rs. {(order.subtotal_amount ?? Math.max(order.total_amount - 20, 0)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>Delivery Fee</span>
                          <span>Rs. {(order.delivery_fee ?? 20).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="font-semibold text-white">Total Amount</span>
                          <span className="text-xl font-bold text-orange-500">
                            Rs. {order.total_amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Order Timeline</p>
                      <p className={`text-xs font-medium ${getStatusColor(order.status)}`}>{statusText}</p>
                    </div>

                    <div className="flex space-x-2">
                      {isRejected || isCancelled ? (
                        <>
                          <div className={`flex-1 h-2 rounded-full ${isCancelled ? 'bg-red-500' : 'bg-red-500'}`} />
                          <div className={`flex-1 h-2 rounded-full ${isCancelled ? 'bg-red-500/80' : 'bg-red-500/60'}`} />
                          <div className="flex-1 h-2 rounded-full bg-gray-700" />
                          <div className="flex-1 h-2 rounded-full bg-gray-700" />
                        </>
                      ) : (
                        <>
                          {['Placed', 'Confirmed', 'Preparing', 'On the way'].map((_, index) => (
                            <div
                              key={index}
                              className={`h-2 flex-1 rounded-full ${
                                timelineProgress > index ? 'bg-green-500' : 'bg-gray-700'
                              }`}
                            />
                          ))}
                        </>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-4 gap-2 text-[11px] uppercase tracking-[0.16em] text-gray-500">
                      {isRejected || isCancelled ? (
                        <>
                          <span className="text-red-300">Placed</span>
                          <span className="text-red-300">
                            {isCancelled ? 'Confirmed' : 'Reviewed'}
                          </span>
                          <span>{isCancelled ? 'Cancelled' : 'Stopped'}</span>
                          <span>Closed</span>
                        </>
                      ) : (
                        <>
                          <span className={timelineProgress > 0 ? 'text-green-300' : undefined}>Placed</span>
                          <span className={timelineProgress > 1 ? 'text-green-300' : undefined}>Confirmed</span>
                          <span className={timelineProgress > 2 ? 'text-green-300' : undefined}>Preparing</span>
                          <span className={timelineProgress > 3 ? 'text-green-300' : undefined}>On the way</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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

      {activeCancellationOrder && (
        <OrderCancellationRequestModal
          loading={submittingCancellationRequest}
          orderId={activeCancellationOrder.id}
          onClose={() => setActiveCancellationOrder(null)}
          onSubmit={handleSubmitCancellationRequest}
        />
      )}

      {activeIssueOrder && (
        <OrderIssueReportModal
          loading={submittingIssueReport}
          orderId={activeIssueOrder.id}
          onClose={() => setActiveIssueOrder(null)}
          onSubmit={handleSubmitIssueReport}
        />
      )}
    </>
  );
}
