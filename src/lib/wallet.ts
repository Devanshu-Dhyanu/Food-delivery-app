import { sanitizeAddress, sanitizeName, sanitizePhone } from './inputSanitization';
import { appendOrderDeliveryDetails } from './orderDeliveryDetails';
import type { PendingCheckoutPayload } from './pendingCheckout';
import { supabase, type WalletAccount, type WalletTransaction } from './supabase';

type WalletOverview = {
  account: WalletAccount | null;
  transactions: WalletTransaction[];
  schemaReady: boolean;
};

type WalletPaidOrderResult = {
  orderId: string;
  paymentTransactionId: string;
  walletTransactionId: string;
  balanceAfter: number;
};

type WalletTopupCreditResult = {
  paymentTransactionId: string;
  walletTransactionId: string;
  balanceAfter: number;
};

const getErrorText = (error: unknown) => {
  const maybeError = error as { code?: string; message?: string; details?: string; hint?: string };
  return `${maybeError?.code ?? ''} ${maybeError?.message ?? ''} ${maybeError?.details ?? ''} ${maybeError?.hint ?? ''}`.toLowerCase();
};

export const isWalletSchemaMissing = (error: unknown) => {
  const details = getErrorText(error);

  return (
    details.includes('wallet_accounts') ||
    details.includes('wallet_transactions') ||
    details.includes('create_wallet_paid_order') ||
    details.includes('credit_wallet_topup') ||
    details.includes('42p01') ||
    details.includes('42883') ||
    details.includes('pgrst202')
  );
};

export const getWalletOverview = async (
  userId: string,
  limit: number = 5
): Promise<WalletOverview> => {
  try {
    const [{ data: account, error: accountError }, { data: transactions, error: transactionsError }] =
      await Promise.all([
        supabase
          .from('wallet_accounts')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit),
      ]);

    if (accountError) {
      throw accountError;
    }

    if (transactionsError) {
      throw transactionsError;
    }

    return {
      account: (account as WalletAccount | null) ?? null,
      transactions: (transactions as WalletTransaction[] | null) ?? [],
      schemaReady: true,
    };
  } catch (error) {
    if (isWalletSchemaMissing(error)) {
      return {
        account: null,
        transactions: [],
        schemaReady: false,
      };
    }

    throw error;
  }
};

export const getWalletTransactions = async (
  userId: string,
  limit: number = 50
): Promise<{ transactions: WalletTransaction[]; schemaReady: boolean }> => {
  try {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return {
      transactions: (data as WalletTransaction[] | null) ?? [],
      schemaReady: true,
    };
  } catch (error) {
    if (isWalletSchemaMissing(error)) {
      return {
        transactions: [],
        schemaReady: false,
      };
    }

    throw error;
  }
};

export const createWalletPaidOrder = async (
  session: PendingCheckoutPayload
): Promise<WalletPaidOrderResult> => {
  const sanitizedName = sanitizeName(session.formData.customerName);
  const sanitizedPhone = sanitizePhone(session.formData.customerPhone);
  const sanitizedAddress = sanitizeAddress(session.formData.deliveryAddress);
  const finalDeliveryAddress = appendOrderDeliveryDetails({
    address: sanitizedAddress,
    preference: session.deliveryPreference,
    scheduledDeliveryAt: session.scheduledDeliveryAt ?? null,
  });

  const { data, error } = await supabase.rpc('create_wallet_paid_order', {
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
    if (isWalletSchemaMissing(error)) {
      throw new Error('Vajra Wallet setup is not ready yet. Please run the wallet SQL first.');
    }

    const details = getErrorText(error);
    if (details.includes('insufficient wallet balance')) {
      throw new Error('Insufficient Vajra Wallet balance for this order.');
    }

    throw error;
  }

  const result = (data || {}) as Record<string, unknown>;

  return {
    orderId: String(result.order_id || ''),
    paymentTransactionId: String(result.payment_transaction_id || ''),
    walletTransactionId: String(result.wallet_transaction_id || ''),
    balanceAfter: Number(result.balance_after || 0),
  };
};

export const creditWalletTopup = async ({
  gatewayOrderId,
  gatewayPaymentId,
  amount,
  gatewayResponse,
}: {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  amount: number;
  gatewayResponse?: unknown;
}): Promise<WalletTopupCreditResult> => {
  const { data, error } = await supabase.rpc('credit_wallet_topup', {
    p_gateway_order_id: gatewayOrderId,
    p_gateway_payment_id: gatewayPaymentId,
    p_amount: amount,
    p_gateway_response: gatewayResponse ?? {},
  });

  if (error) {
    if (isWalletSchemaMissing(error)) {
      throw new Error('Vajra Wallet setup is not ready yet. Please run the wallet SQL first.');
    }

    throw error;
  }

  const result = (data || {}) as Record<string, unknown>;

  return {
    paymentTransactionId: String(result.payment_transaction_id || ''),
    walletTransactionId: String(result.wallet_transaction_id || ''),
    balanceAfter: Number(result.balance_after || 0),
  };
};
