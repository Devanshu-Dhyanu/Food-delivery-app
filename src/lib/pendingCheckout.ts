import type { DeliveryPreference } from './deliveryPreferences';

export interface CheckoutFormData {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
}

export interface OrderItemPayload {
  menu_item_id: string;
  quantity: number;
  price: number;
  item_name: string;
}

export interface PendingCheckoutPayload {
  cartRestaurantId: string;
  cartRestaurantName: string;
  subtotalAmount: number;
  deliveryFee: number;
  totalAmount: number;
  orderItems: OrderItemPayload[];
  formData: CheckoutFormData;
  deliveryPreference: DeliveryPreference | null;
  scheduledDeliveryAt?: string | null;
  selectedPaymentMethod: string;
}

export interface PendingCheckoutSession extends PendingCheckoutPayload {
  createdAt: string;
}

const PENDING_CHECKOUT_PREFIX = 'pendingCheckout:';
const COMPLETED_CHECKOUT_PREFIX = 'completedCheckout:';

const getPendingCheckoutStorageKey = (gatewayOrderId: string) =>
  `${PENDING_CHECKOUT_PREFIX}${gatewayOrderId}`;

const getCompletedCheckoutStorageKey = (gatewayOrderId: string) =>
  `${COMPLETED_CHECKOUT_PREFIX}${gatewayOrderId}`;

const isPendingCheckoutSession = (
  value: unknown
): value is PendingCheckoutSession => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as Partial<PendingCheckoutSession>;

  return (
    typeof session.cartRestaurantId === 'string' &&
    typeof session.cartRestaurantName === 'string' &&
    typeof session.subtotalAmount === 'number' &&
    typeof session.deliveryFee === 'number' &&
    typeof session.totalAmount === 'number' &&
    Array.isArray(session.orderItems) &&
    typeof session.formData?.customerName === 'string' &&
    typeof session.formData?.customerPhone === 'string' &&
    typeof session.formData?.deliveryAddress === 'string' &&
    (typeof session.scheduledDeliveryAt === 'undefined' ||
      typeof session.scheduledDeliveryAt === 'string' ||
      session.scheduledDeliveryAt === null) &&
    typeof session.selectedPaymentMethod === 'string' &&
    typeof session.createdAt === 'string'
  );
};

export const savePendingCheckout = (
  gatewayOrderId: string,
  payload: PendingCheckoutPayload
) => {
  if (typeof window === 'undefined') {
    return;
  }

  const session: PendingCheckoutSession = {
    ...payload,
    createdAt: new Date().toISOString(),
  };

  window.localStorage.setItem(
    getPendingCheckoutStorageKey(gatewayOrderId),
    JSON.stringify(session)
  );
};

export const getPendingCheckout = (
  gatewayOrderId: string
): PendingCheckoutSession | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedValue = window.localStorage.getItem(
    getPendingCheckoutStorageKey(gatewayOrderId)
  );

  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);
    return isPendingCheckoutSession(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
};

export const clearPendingCheckout = (gatewayOrderId: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(getPendingCheckoutStorageKey(gatewayOrderId));
};

export const markCheckoutCompleted = (
  gatewayOrderId: string,
  orderId: string
) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    getCompletedCheckoutStorageKey(gatewayOrderId),
    orderId
  );
};

export const getCompletedCheckoutOrderId = (gatewayOrderId: string) => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(getCompletedCheckoutStorageKey(gatewayOrderId));
};
