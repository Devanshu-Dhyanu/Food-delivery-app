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
  theme?: 'dark' | 'light';
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

const getWalletChipClasses = (isSelected: boolean, isLightTheme: boolean) =>
  `rounded-full border px-4 py-2 text-sm font-medium transition-all ${
    isSelected
      ? isLightTheme
        ? 'border-emerald-300 bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-100/80'
        : 'border-emerald-500/35 bg-emerald-500/15 text-emerald-200'
      : isLightTheme
        ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
        : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10 hover:text-white'
  }`;

const getWalletInputClasses = (isLightTheme: boolean) =>
  `w-full rounded-2xl border px-4 py-3 outline-none transition-colors ${
    isLightTheme
      ? 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-400/70'
      : 'border-white/10 bg-gray-800 text-white focus:border-emerald-500/40'
  }`;

export default function VajraWalletPanel({ userId, theme = 'dark' }: VajraWalletPanelProps) {
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

  const isLightTheme = theme === 'light';
  const walletPanelClassName = `rounded-[28px] border p-6 shadow-xl ${
    isLightTheme
      ? 'border-emerald-200 bg-gradient-to-br from-white via-emerald-50/70 to-slate-100 shadow-emerald-100/70'
      : 'border-emerald-500/15 bg-gradient-to-br from-emerald-500/12 via-gray-900 to-gray-900 shadow-black/20'
  }`;
  const walletBadgeClassName = `rounded-full border p-3 ${
    isLightTheme
      ? 'border-emerald-200 bg-emerald-100 text-emerald-600'
      : 'border-emerald-400/20 bg-emerald-500/15 text-emerald-300'
  }`;
  const walletTitleClassName = isLightTheme ? 'text-xl font-bold text-slate-900' : 'text-xl font-bold text-white';
  const walletBodyTextClassName = isLightTheme ? 'text-slate-600' : 'text-gray-400';
  const walletMetaTextClassName = isLightTheme ? 'text-slate-500' : 'text-gray-500';
  const walletSecondaryButtonClassName = `inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-colors ${
    isLightTheme
      ? 'border-slate-200 bg-white text-slate-800 shadow-sm shadow-slate-100/80 hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400'
      : 'border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:bg-gray-700'
  } disabled:cursor-not-allowed`;
  const walletPrimaryButtonClassName = `inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition-colors ${
    isLightTheme
      ? 'bg-emerald-500 shadow-lg shadow-emerald-200/70 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-500'
      : 'bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700'
  } disabled:cursor-not-allowed`;
  const walletWarningCardClassName = `mb-5 rounded-2xl border px-4 py-3 text-sm ${
    isLightTheme
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : 'border-amber-500/25 bg-amber-500/10 text-amber-100'
  }`;
  const walletErrorCardClassName = `mb-5 flex gap-3 rounded-2xl border px-4 py-3 text-sm ${
    isLightTheme
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-red-500/25 bg-red-500/10 text-red-100'
  }`;
  const walletSmallCardClassName = `rounded-2xl border px-5 py-5 ${
    isLightTheme
      ? 'border-slate-200 bg-white/90 shadow-sm shadow-slate-100/80'
      : 'border-white/5 bg-white/5'
  }`;
  const walletActivityCardClassName = `rounded-2xl border px-5 py-5 ${
    isLightTheme
      ? 'border-slate-200 bg-white/90 shadow-sm shadow-slate-100/80'
      : 'border-white/5 bg-white/5'
  }`;
  const walletLoadingCardClassName = `h-16 animate-pulse rounded-2xl border ${
    isLightTheme ? 'border-slate-200 bg-slate-100' : 'border-white/5 bg-white/5'
  }`;
  const walletEmptyStateClassName = `rounded-2xl border border-dashed px-4 py-5 text-sm ${
    isLightTheme
      ? 'border-slate-200 bg-slate-50 text-slate-500'
      : 'border-white/10 bg-gray-900/50 text-gray-400'
  }`;
  const walletRowClassName = `flex flex-col gap-3 rounded-2xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${
    isLightTheme
      ? 'border-slate-200 bg-slate-50/90'
      : 'border-white/5 bg-gray-900/55'
  }`;
  const walletModalCardClassName = `w-full rounded-[28px] border p-6 shadow-2xl ${
    isLightTheme
      ? 'border-slate-200 bg-white shadow-slate-900/10'
      : 'border-white/10 bg-gray-900 shadow-black/40'
  }`;
  const walletIconButtonClassName = `rounded-full border p-2 transition-colors ${
    isLightTheme
      ? 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
  }`;
  const walletInputClassName = getWalletInputClasses(isLightTheme);
  const walletTagClassName = `rounded-full border px-2 py-0.5 ${
    isLightTheme
      ? 'border-slate-200 bg-white text-slate-500'
      : 'border-white/10 bg-white/5 text-gray-500'
  }`;
  const walletStatusTextClassName = isLightTheme ? 'text-emerald-600' : 'text-emerald-300';

  return (
    <>
      <div className={walletPanelClassName}>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className={walletBadgeClassName}>
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className={walletTitleClassName}>Vajra Wallet</h3>
              <p className={`mt-1 text-sm leading-6 ${walletBodyTextClassName}`}>
                Add money once and use your in-app balance for faster checkouts.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleOpenPassbook}
              disabled={!schemaReady || loading}
              className={walletSecondaryButtonClassName}
            >
              <History className="h-4 w-4" />
              <span>View Passbook</span>
            </button>
            <button
              onClick={() => setShowTopupModal(true)}
              disabled={!schemaReady || loading}
              className={walletPrimaryButtonClassName}
            >
              <Plus className="h-4 w-4" />
              <span>Add Money</span>
            </button>
          </div>
        </div>

        {!schemaReady && (
          <div className={walletWarningCardClassName}>
            Vajra Wallet tables are not ready yet. Run the wallet SQL first, then refresh this page.
          </div>
        )}

        {errorMessage && (
          <div className={walletErrorCardClassName}>
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mb-6 grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
          <div className={walletSmallCardClassName}>
            <p className={`mb-2 text-xs uppercase tracking-[0.18em] ${walletStatusTextClassName}`}>
              Available Balance
            </p>
            <p className={`text-4xl font-bold ${isLightTheme ? 'text-slate-900' : 'text-white'}`}>
              {loading ? 'Loading...' : formatCurrency(balance)}
            </p>
            <p className={`mt-3 text-sm ${walletBodyTextClassName}`}>
              Use this balance directly at checkout with the new Vajra Wallet payment option.
            </p>
          </div>

          <div className={walletSmallCardClassName}>
            <p className={`mb-2 text-xs uppercase tracking-[0.18em] ${walletMetaTextClassName}`}>
              Wallet Status
            </p>
            <p className={`text-lg font-semibold ${isLightTheme ? 'text-slate-900' : 'text-white'}`}>
              {schemaReady ? 'Ready to use' : 'Setup pending'}
            </p>
            <p className={`mt-3 text-sm ${walletBodyTextClassName}`}>
              Top-ups are processed through Cashfree, and wallet payments stay inside your app balance.
            </p>
          </div>
        </div>

        <div className={walletActivityCardClassName}>
          <div className="mb-4 flex items-center gap-2">
            <History className={`h-4 w-4 ${walletBodyTextClassName}`} />
            <h4 className={`text-sm font-semibold uppercase tracking-[0.16em] ${isLightTheme ? 'text-slate-700' : 'text-gray-300'}`}>
              Recent Activity
            </h4>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className={walletLoadingCardClassName} />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className={walletEmptyStateClassName}>
              No wallet transactions yet. Add money to your Vajra Wallet to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const isCredit = transaction.direction === 'credit';

                return (
                  <div key={transaction.id} className={walletRowClassName}>
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
                        <p className={`font-semibold ${isLightTheme ? 'text-slate-900' : 'text-white'}`}>
                          {getTransactionTitle(transaction)}
                        </p>
                        <p className={`mt-1 text-sm ${walletBodyTextClassName}`}>
                          {getTransactionSubtitle(transaction)}
                        </p>
                        <p className={`mt-1 text-xs ${walletMetaTextClassName}`}>
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
                      <p className={`text-xs uppercase tracking-[0.16em] ${walletMetaTextClassName}`}>
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
          <div className={`${walletModalCardClassName} max-w-4xl`}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.18em] ${walletStatusTextClassName}`}>
                  Wallet passbook
                </p>
                <h4 className={`text-2xl font-bold ${isLightTheme ? 'text-slate-900' : 'text-white'}`}>
                  Full Vajra Wallet history
                </h4>
                <p className={`mt-2 text-sm leading-6 ${walletBodyTextClassName}`}>
                  Review top-ups, order payments, refunds, and balance movement in one place.
                </p>
              </div>

              <button
                onClick={() => setShowPassbookModal(false)}
                className={walletIconButtonClassName}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-5 grid gap-4 md:grid-cols-[1fr,auto] md:items-end">
              <div className={walletSmallCardClassName}>
                <p className={`text-xs uppercase tracking-[0.16em] ${walletMetaTextClassName}`}>
                  Current Balance
                </p>
                <p className={`mt-2 text-3xl font-bold ${isLightTheme ? 'text-slate-900' : 'text-white'}`}>
                  {formatCurrency(balance)}
                </p>
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
                      className={getWalletChipClasses(isSelected, isLightTheme)}
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
                    <div key={index} className={walletLoadingCardClassName} />
                  ))}
                </div>
              ) : filteredPassbookTransactions.length === 0 ? (
                <div className={`${walletEmptyStateClassName} py-8 text-center`}>
                  No passbook entries found for this filter yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPassbookTransactions.map((transaction) => {
                    const isCredit = transaction.direction === 'credit';

                    return (
                      <div
                        key={transaction.id}
                        className={`flex flex-col gap-3 rounded-2xl border px-4 py-4 md:flex-row md:items-center md:justify-between ${
                          isLightTheme
                            ? 'border-slate-200 bg-slate-50/90'
                            : 'border-white/5 bg-gray-950/50'
                        }`}
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
                            <p className={`font-semibold ${isLightTheme ? 'text-slate-900' : 'text-white'}`}>
                              {getTransactionTitle(transaction)}
                            </p>
                            <p className={`mt-1 text-sm ${walletBodyTextClassName}`}>
                              {getTransactionSubtitle(transaction)}
                            </p>
                            <div className={`mt-2 flex flex-wrap gap-2 text-xs ${walletMetaTextClassName}`}>
                              <span>{formatTransactionDate(transaction.created_at)}</span>
                              {transaction.topup_order_id && (
                                <span className={walletTagClassName}>
                                  Top-up {transaction.topup_order_id}
                                </span>
                              )}
                              {transaction.order_id && (
                                <span className={walletTagClassName}>
                                  Order {transaction.order_id.slice(0, 8)}
                                </span>
                              )}
                              {transaction.gateway_payment_id && (
                                <span className={walletTagClassName}>
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
                          <p className={`mt-1 text-xs uppercase tracking-[0.16em] ${walletMetaTextClassName}`}>
                            Balance after {formatCurrency(transaction.balance_after)}
                          </p>
                          <span className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${walletStatusTextClassName}`}>
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
          <div className={`${walletModalCardClassName} max-w-md`}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.18em] ${walletStatusTextClassName}`}>
                  Add money
                </p>
                <h4 className={`text-2xl font-bold ${isLightTheme ? 'text-slate-900' : 'text-white'}`}>
                  Top up Vajra Wallet
                </h4>
                <p className={`mt-2 text-sm leading-6 ${walletBodyTextClassName}`}>
                  Choose an amount, complete the Cashfree payment, and it will be credited to your wallet automatically.
                </p>
              </div>

              <button
                onClick={closeTopupModal}
                disabled={processingTopup}
                className={`${walletIconButtonClassName} disabled:cursor-not-allowed disabled:opacity-50`}
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
                    className={getWalletChipClasses(isSelected, isLightTheme)}
                  >
                    {formatCurrency(amount)}
                  </button>
                );
              })}
            </div>

            <label className="mb-5 block">
              <span className={`mb-2 block text-sm font-medium ${isLightTheme ? 'text-slate-700' : 'text-gray-300'}`}>
                Custom amount
              </span>
              <input
                type="number"
                min="1"
                step="1"
                value={topupAmount}
                onChange={(event) => setTopupAmount(event.target.value)}
                className={walletInputClassName}
                placeholder="Enter amount"
              />
            </label>

            <div className={`${walletSmallCardClassName} mb-5 px-4 py-4`}>
              <p className={`text-sm ${walletBodyTextClassName}`}>Amount to add</p>
              <p className={`mt-2 text-3xl font-bold ${isLightTheme ? 'text-slate-900' : 'text-white'}`}>
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
                className={`flex-1 ${walletSecondaryButtonClassName} disabled:opacity-50`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTopup}
                disabled={processingTopup}
                className={`flex-1 ${walletPrimaryButtonClassName}`}
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
