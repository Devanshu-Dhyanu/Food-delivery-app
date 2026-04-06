import { sanitizeAddress, sanitizeName, sanitizePhone } from './inputSanitization';
import { appendOrderDeliveryDetails } from './orderDeliveryDetails';
import type { PendingCheckoutPayload } from './pendingCheckout';
import { supabase } from './supabase';

interface PaymentMetadata {
  gatewayOrderId?: string;
  gatewayResponse?: unknown;
  paymentMethod?: string | null;
  transactionId?: string;
  orderPaymentStatus?: 'pending' | 'success' | 'failed';
  skipPaymentRecord?: boolean;
}

const shouldUseLegacyOrderFallback = (error: unknown) => {
  const maybeError = error as { code?: string; message?: string; details?: string };
  const details = `${maybeError?.message ?? ''} ${maybeError?.details ?? ''}`.toLowerCase();

  return (
    maybeError?.code === 'PGRST202' ||
    maybeError?.code === '42883' ||
    details.includes('create_order_with_items')
  );
};

const ensureRestaurantIsOpen = async (restaurantId: string) => {
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select('is_open')
    .eq('id', restaurantId)
    .maybeSingle();

  if (restaurantError) {
    throw restaurantError;
  }

  if (!restaurant) {
    throw new Error('Restaurant not found.');
  }

  if (!restaurant.is_open) {
    throw new Error('This restaurant is currently closed.');
  }
};

const createOrderWithLegacyInsert = async (
  userId: string,
  session: PendingCheckoutPayload,
  finalDeliveryAddress: string
) => {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([
      {
        user_id: userId,
        restaurant_id: session.cartRestaurantId,
        restaurant_name: session.cartRestaurantName,
        customer_name: sanitizeName(session.formData.customerName),
        customer_phone: sanitizePhone(session.formData.customerPhone),
        delivery_address: finalDeliveryAddress,
        subtotal_amount: session.subtotalAmount,
        delivery_fee: session.deliveryFee,
        total_amount: session.totalAmount,
        status: 'pending',
      },
    ])
    .select()
    .single();

  if (orderError) {
    throw orderError;
  }

  const { error: itemsError } = await supabase.from('order_items').insert(
    session.orderItems.map((item) => ({
      order_id: order.id,
      ...item,
    }))
  );

  if (itemsError) {
    throw itemsError;
  }

  return order.id as string;
};

const attachPaymentMetadata = async (
  userId: string,
  orderId: string,
  session: PendingCheckoutPayload,
  paymentMetadata: PaymentMetadata
) => {
  const paymentMethod =
    paymentMetadata.paymentMethod || session.selectedPaymentMethod || 'unknown';
  const paymentStatus =
    paymentMetadata.orderPaymentStatus ||
    (paymentMetadata.transactionId ? 'success' : 'pending');

  try {
    const orderUpdate: Record<string, unknown> = {
      payment_status: paymentStatus,
      payment_method: paymentMethod,
    };

    if (!paymentMetadata.skipPaymentRecord) {
      const { data: paymentTransaction, error: paymentTransactionError } = await supabase
        .from('payment_transactions')
        .insert([
          {
            user_id: userId,
            order_id: orderId,
            amount: session.totalAmount,
            payment_method: paymentMethod,
            status: paymentStatus,
            payment_gateway_id:
              paymentMetadata.transactionId || paymentMetadata.gatewayOrderId || null,
            gateway_response: paymentMetadata.gatewayResponse ?? {},
            currency: 'INR',
          },
        ])
        .select()
        .maybeSingle();

      if (paymentTransactionError) {
        throw paymentTransactionError;
      }

      if (paymentTransaction?.id) {
        orderUpdate.payment_id = paymentTransaction.id;
      }
    }

    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update(orderUpdate)
      .eq('id', orderId);

    if (orderUpdateError) {
      throw orderUpdateError;
    }
  } catch (error) {
    console.warn('Failed to attach payment metadata to the order.', error);
  }
};

export const placeOrderFromPendingCheckout = async (
  session: PendingCheckoutPayload,
  paymentMetadata: PaymentMetadata = {}
) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error('You must be signed in to place an order.');
  }

  if (!session.orderItems.length) {
    throw new Error('Your cart is empty.');
  }

  const sanitizedName = sanitizeName(session.formData.customerName);
  const sanitizedPhone = sanitizePhone(session.formData.customerPhone);
  const sanitizedAddress = sanitizeAddress(session.formData.deliveryAddress);
  const finalDeliveryAddress = appendOrderDeliveryDetails({
    address: sanitizedAddress,
    preference: session.deliveryPreference,
    scheduledDeliveryAt: session.scheduledDeliveryAt ?? null,
  });

  await ensureRestaurantIsOpen(session.cartRestaurantId);

  let newOrderId = '';

  try {
    const { data, error } = await supabase.rpc('create_order_with_items', {
      p_customer_name: sanitizedName,
      p_customer_phone: sanitizedPhone,
      p_delivery_address: finalDeliveryAddress,
      p_restaurant_id: session.cartRestaurantId,
      p_restaurant_name: session.cartRestaurantName,
      p_subtotal_amount: session.subtotalAmount,
      p_delivery_fee: session.deliveryFee,
      p_total_amount: session.totalAmount,
      p_items: session.orderItems,
    });

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('Failed to create order.');
    }

    newOrderId = data as string;
  } catch (error) {
    if (!shouldUseLegacyOrderFallback(error)) {
      throw error;
    }

    console.warn(
      'Transactional RPC unavailable, falling back to legacy checkout path.',
      error
    );

    newOrderId = await createOrderWithLegacyInsert(
      user.id,
      session,
      finalDeliveryAddress
    );
  }

  await attachPaymentMetadata(user.id, newOrderId, session, paymentMetadata);

  return {
    orderId: newOrderId,
  };
};
