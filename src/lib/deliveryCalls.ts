import type { DeliveryCallParticipantRole, DeliveryCallSessionStatus } from './supabase';

export const DELIVERY_CALL_POLL_INTERVAL = 2500;
export const DELIVERY_CALL_RING_TIMEOUT_MS = 45000;
export const DELIVERY_CALL_TOKEN_TTL_SECONDS = 60 * 60;

export const LIVE_DELIVERY_CALL_STATUSES: DeliveryCallSessionStatus[] = [
  'ringing',
  'accepted',
];

export const isLiveDeliveryCallStatus = (
  value: string | null | undefined
): value is DeliveryCallSessionStatus =>
  value === 'ringing' || value === 'accepted';

export const buildDeliveryCallChannelName = (orderId: string) => {
  const compactOrderId = orderId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 24);
  return `vajra_delivery_${compactOrderId}_${Date.now().toString(36)}`;
};

export const getDeliveryCallRoleLabel = (role: DeliveryCallParticipantRole) =>
  role === 'delivery_partner' ? 'Delivery partner' : 'Customer';

export const getDeliveryCallStatusLabel = (status: DeliveryCallSessionStatus) => {
  switch (status) {
    case 'ringing':
      return 'Ringing';
    case 'accepted':
      return 'Connected';
    case 'declined':
      return 'Declined';
    case 'cancelled':
      return 'Cancelled';
    case 'missed':
      return 'Missed';
    case 'failed':
      return 'Failed';
    case 'ended':
    default:
      return 'Ended';
  }
};

export const formatDeliveryCallTimer = (elapsedSeconds: number) => {
  const minutes = Math.floor(elapsedSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(elapsedSeconds % 60)
    .toString()
    .padStart(2, '0');

  return `${minutes}:${seconds}`;
};
