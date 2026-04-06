export interface PendingWalletTopupPayload {
  amount: number;
  createdAt: string;
}

const PENDING_WALLET_TOPUP_PREFIX = 'pendingWalletTopup:';

const getPendingWalletTopupStorageKey = (gatewayOrderId: string) =>
  `${PENDING_WALLET_TOPUP_PREFIX}${gatewayOrderId}`;

const isPendingWalletTopupPayload = (
  value: unknown
): value is PendingWalletTopupPayload => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const payload = value as Partial<PendingWalletTopupPayload>;

  return (
    typeof payload.amount === 'number' &&
    Number.isFinite(payload.amount) &&
    payload.amount > 0 &&
    typeof payload.createdAt === 'string'
  );
};

export const savePendingWalletTopup = (
  gatewayOrderId: string,
  amount: number
) => {
  if (typeof window === 'undefined') {
    return;
  }

  const payload: PendingWalletTopupPayload = {
    amount,
    createdAt: new Date().toISOString(),
  };

  window.localStorage.setItem(
    getPendingWalletTopupStorageKey(gatewayOrderId),
    JSON.stringify(payload)
  );
};

export const getPendingWalletTopup = (
  gatewayOrderId: string
): PendingWalletTopupPayload | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedValue = window.localStorage.getItem(
    getPendingWalletTopupStorageKey(gatewayOrderId)
  );

  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);
    return isPendingWalletTopupPayload(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
};

export const clearPendingWalletTopup = (gatewayOrderId: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(getPendingWalletTopupStorageKey(gatewayOrderId));
};
