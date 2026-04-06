import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  History,
  Plus,
  Wallet,
  X,
} from 'lucide-react';
import { openCashfreeCheckout } from '../lib/cashfreeCheckout';
import {
  clearPendingWalletTopup,
  savePendingWalletTopup,
} from '../lib/pendingWalletTopup';
import { supabase, type WalletTransaction } from '../lib/supabase';
import { getWalletOverview, getWalletTransactions } from '../lib/wallet';

interface VajraWalletPanelProps {
  userId: string;
}

const TOPUP_PRESETS = [100, 200, 500, 1000];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);

const formatTransactionDate = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

const getTransactionTitle = (transaction: WalletTransaction) => {
  switch (transaction.transaction_type) {
    case 'topup':
      return 'Money added';
    case 'debit':
      return 'Order paid';
    case 'refund':
      return 'Refund received';
    case 'credit':
      return 'Wallet credit';
    case 'adjustment':
      return 'Manual adjustment';
    default:
      return 'Wallet update';
  }
};

const getTransactionSubtitle = (transaction: WalletTransaction) => {
  if (transaction.note?.trim()) {
    return transaction.note;
  }

  if (transaction.order_id) {
    return `Order ${transaction.order_id.slice(0, 8)}`;
  }

  return transaction.status === 'pending' ? 'Pending confirmation' : 'Completed';
};

export default function VajraWalletPanel({ userId }: VajraWalletPanelProps) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaReady, setSchemaReady] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showPassbookModal, setShowPassbookModal] = useState(false);
  const [passbookTransactions, setPassbookTransactions] = useState<WalletTransaction[]>([]);
  const [passbookLoading, setPassbookLoading] = useState(false);
  const [passbookFilter, setPassbookFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [topupAmount, setTopupAmount] = useState('200');
  const [processingTopup, setProcessingTopup] = useState(false);

  const numericTopupAmount = useMemo(() => Number(topupAmount), [topupAmount]);
  const filteredPassbookTransactions = useMemo(
    () =>
      passbookTransactions.filter((transaction) => {
        if (passbookFilter === 'all') {
          return true;
        }

        return transaction.direction === passbookFilter;
      }),
    [passbookFilter, passbookTransactions]
  );

  const loadWallet = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const overview = await getWalletOverview(userId, 6);
      setSchemaReady(overview.schemaReady);
      setBalance(Number(overview.account?.balance ?? 0));
      setTransactions(overview.transactions);
    } catch (error) {
      console.error('Error loading wallet overview:', error);
      setBalance(0);
      setTransactions([]);
      setSchemaReady(true);
      setErrorMessage('We could not load your Vajra Wallet right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadWallet();
  }, [userId]);

  const loadPassbook = async () => {
    setPassbookLoading(true);

    try {
      const result = await getWalletTransactions(userId, 60);
      setSchemaReady(result.schemaReady);
      setPassbookTransactions(result.transactions);
    } catch (error) {
      console.error('Error loading wallet passbook:', error);
      setErrorMessage('We could not load your wallet passbook right now. Please try again.');
    } finally {
      setPassbookLoading(false);
    }
  };

  const closeTopupModal = () => {
    if (processingTopup) {
      return;
    }

    setShowTopupModal(false);
    setTopupAmount('200');
  };

  const handleTopup = async () => {
    if (!schemaReady) {
      setErrorMessage('Vajra Wallet setup is not ready yet. Please run the wallet SQL first.');
      return;
    }

    if (!Number.isFinite(numericTopupAmount) || numericTopupAmount <= 0) {
      setErrorMessage('Enter a valid amount to add to your Vajra Wallet.');
      return;
    }

    setProcessingTopup(true);
    setErrorMessage('');

    let gatewayOrderId = '';

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('You must be signed in to top up Vajra Wallet.');
      }

      gatewayOrderId = `WALLET-${Date.now()}`;

      savePendingWalletTopup(gatewayOrderId, numericTopupAmount);

      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: gatewayOrderId,
          amount: numericTopupAmount,
          customerId: user.id,
          customerEmail: user.email || 'customer@example.com',
          customerPhone: user.phone || '9000090000',
          customerName:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')?.[0] ||
            'Customer',
          returnUrl: `${window.location.origin}/payment/callback?order_id=${encodeURIComponent(gatewayOrderId)}`,
          notifyUrl: `${window.location.origin}/api/payment/webhook`,
          orderNote: 'Vajra Wallet top-up',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 404 && import.meta.env.DEV) {
          throw new Error("Local payment API not available. Run the app with 'vercel dev' for payment testing.");
        }

        throw new Error(
          errorData?.message || errorData?.error || 'Failed to create wallet top-up payment.'
        );
      }

      const data = await response.json();
      const paymentSessionId =
        typeof data.paymentSessionId === 'string' ? data.paymentSessionId : '';
      const environment = data.environment === 'production' ? 'production' : 'sandbox';
      const paymentUrl = typeof data.paymentUrl === 'string' ? data.paymentUrl : '';

      if (paymentSessionId) {
        await openCashfreeCheckout({
          paymentSessionId,
          environment,
        });
        return;
      }

      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }

      throw new Error('No payment session received for Vajra Wallet top-up.');
    } catch (error) {
      console.error('Error initiating wallet top-up:', error);
      if (gatewayOrderId) {
        clearPendingWalletTopup(gatewayOrderId);
      }

      setErrorMessage(
        error instanceof Error ? error.message : 'Wallet top-up could not be started.'
      );
      setProcessingTopup(false);
    }
  };

  const handleOpenPassbook = async () => {
    setShowPassbookModal(true);
    setPassbookFilter('all');
    await loadPassbook();
  };

  return (
    <>
      <div className="rounded-[28px] border border-emerald-500/15 bg-gradient-to-br from-emerald-500/12 via-gray-900 to-gray-900 p-6 shadow-xl shadow-black/20">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-full border border-emerald-400/20 bg-emerald-500/15 p-3 text-emerald-300">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Vajra Wallet</h3>
              <p className="mt-1 text-sm leading-6 text-gray-400">
                Add money once and use your in-app balance for faster checkouts.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleOpenPassbook}
              disabled={!schemaReady || loading}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:bg-gray-700"
            >
              <History className="h-4 w-4" />
              <span>View Passbook</span>
            </button>
            <button
              onClick={() => setShowTopupModal(true)}
              disabled={!schemaReady || loading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-gray-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add Money</span>
            </button>
          </div>
        </div>

        {!schemaReady && (
          <div className="mb-5 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Vajra Wallet tables are not ready yet. Run the wallet SQL first, then refresh this page.
          </div>
        )}

        {errorMessage && (
          <div className="mb-5 flex gap-3 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mb-6 grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="rounded-2xl border border-white/5 bg-white/5 px-5 py-5">
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-emerald-300">
              Available Balance
            </p>
            <p className="text-4xl font-bold text-white">
              {loading ? 'Loading...' : formatCurrency(balance)}
            </p>
            <p className="mt-3 text-sm text-gray-400">
              Use this balance directly at checkout with the new Vajra Wallet payment option.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/5 px-5 py-5">
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-gray-500">
              Wallet Status
            </p>
            <p className="text-lg font-semibold text-white">
              {schemaReady ? 'Ready to use' : 'Setup pending'}
            </p>
            <p className="mt-3 text-sm text-gray-400">
              Top-ups are processed through Cashfree, and wallet payments stay inside your app balance.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 px-5 py-5">
          <div className="mb-4 flex items-center gap-2">
            <History className="h-4 w-4 text-gray-400" />
            <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-300">
              Recent Activity
            </h4>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-2xl border border-white/5 bg-white/5"
                />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-gray-900/50 px-4 py-5 text-sm text-gray-400">
              No wallet transactions yet. Add money to your Vajra Wallet to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const isCredit = transaction.direction === 'credit';

                return (
                  <div
                    key={transaction.id}
                    className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-gray-900/55 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`rounded-full p-2 ${
                          isCredit
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-orange-500/15 text-orange-200'
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          {getTransactionTitle(transaction)}
                        </p>
                        <p className="mt-1 text-sm text-gray-400">
                          {getTransactionSubtitle(transaction)}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatTransactionDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <p
                        className={`text-lg font-semibold ${
                          isCredit ? 'text-emerald-300' : 'text-orange-200'
                        }`}
                      >
                        {isCredit ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs uppercase tracking-[0.16em] text-gray-500">
                        Balance {formatCurrency(transaction.balance_after)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showPassbookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-[28px] border border-white/10 bg-gray-900 p-6 shadow-2xl shadow-black/40">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Wallet passbook
                </p>
                <h4 className="text-2xl font-bold text-white">Full Vajra Wallet history</h4>
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Review top-ups, order payments, refunds, and balance movement in one place.
                </p>
              </div>

              <button
                onClick={() => setShowPassbookModal(false)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-5 grid gap-4 md:grid-cols-[1fr,auto] md:items-end">
              <div className="rounded-2xl border border-white/5 bg-white/5 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-gray-500">
                  Current Balance
                </p>
                <p className="mt-2 text-3xl font-bold text-white">{formatCurrency(balance)}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(['all', 'credit', 'debit'] as const).map((filter) => {
                  const isSelected = passbookFilter === filter;
                  const label =
                    filter === 'all'
                      ? 'All'
                      : filter === 'credit'
                        ? 'Credits'
                        : 'Debits';

                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setPassbookFilter(filter)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                        isSelected
                          ? 'border-emerald-500/35 bg-emerald-500/15 text-emerald-200'
                          : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="max-h-[65vh] overflow-y-auto pr-1">
              {passbookLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-16 animate-pulse rounded-2xl border border-white/5 bg-white/5"
                    />
                  ))}
                </div>
              ) : filteredPassbookTransactions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-gray-950/50 px-4 py-8 text-center text-sm text-gray-400">
                  No passbook entries found for this filter yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPassbookTransactions.map((transaction) => {
                    const isCredit = transaction.direction === 'credit';

                    return (
                      <div
                        key={transaction.id}
                        className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-gray-950/50 px-4 py-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`rounded-full p-2 ${
                              isCredit
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : 'bg-orange-500/15 text-orange-200'
                            }`}
                          >
                            {isCredit ? (
                              <ArrowDownLeft className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {getTransactionTitle(transaction)}
                            </p>
                            <p className="mt-1 text-sm text-gray-400">
                              {getTransactionSubtitle(transaction)}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                              <span>{formatTransactionDate(transaction.created_at)}</span>
                              {transaction.topup_order_id && (
                                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                                  Top-up {transaction.topup_order_id}
                                </span>
                              )}
                              {transaction.order_id && (
                                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                                  Order {transaction.order_id.slice(0, 8)}
                                </span>
                              )}
                              {transaction.gateway_payment_id && (
                                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                                  Gateway {transaction.gateway_payment_id}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-left md:text-right">
                          <p
                            className={`text-lg font-semibold ${
                              isCredit ? 'text-emerald-300' : 'text-orange-200'
                            }`}
                          >
                            {isCredit ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-gray-500">
                            Balance after {formatCurrency(transaction.balance_after)}
                          </p>
                          <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-300">
                            <span>{transaction.status === 'success' ? 'Recorded' : transaction.status}</span>
                            <ChevronRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showTopupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-gray-900 p-6 shadow-2xl shadow-black/40">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Add money
                </p>
                <h4 className="text-2xl font-bold text-white">Top up Vajra Wallet</h4>
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Choose an amount, complete the Cashfree payment, and it will be credited to your wallet automatically.
                </p>
              </div>

              <button
                onClick={closeTopupModal}
                disabled={processingTopup}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              {TOPUP_PRESETS.map((amount) => {
                const isSelected = numericTopupAmount === amount;

                return (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setTopupAmount(String(amount))}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
                      isSelected
                        ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {formatCurrency(amount)}
                  </button>
                );
              })}
            </div>

            <label className="mb-5 block">
              <span className="mb-2 block text-sm font-medium text-gray-300">Custom amount</span>
              <input
                type="number"
                min="1"
                step="1"
                value={topupAmount}
                onChange={(event) => setTopupAmount(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-gray-800 px-4 py-3 text-white outline-none transition-colors focus:border-emerald-500/40"
                placeholder="Enter amount"
              />
            </label>

            <div className="mb-5 rounded-2xl border border-white/5 bg-white/5 px-4 py-4">
              <p className="text-sm text-gray-400">Amount to add</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {Number.isFinite(numericTopupAmount) && numericTopupAmount > 0
                  ? formatCurrency(numericTopupAmount)
                  : 'Enter a valid amount'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeTopupModal}
                disabled={processingTopup}
                className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTopup}
                disabled={processingTopup}
                className="flex-1 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-gray-700"
              >
                {processingTopup ? 'Starting payment...' : 'Proceed to Add Money'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
