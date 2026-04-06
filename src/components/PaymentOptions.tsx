import { useState } from 'react';
import { CreditCard, Smartphone, Banknote, Wallet, Calendar, Zap } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'upi' | 'card' | 'netbanking' | 'wallet' | 'bnpl' | 'emi';
}

interface PaymentOptionsProps {
  onSelectMethod: (method: string) => void;
  selectedMethod: string | null;
  amount: number;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'upi',
    name: 'UPI',
    description: 'Google Pay, PhonePe, BHIM, Paytm',
    icon: <Smartphone className="w-6 h-6" />,
    category: 'upi',
  },
  {
    id: 'card',
    name: 'Debit/Credit Card',
    description: 'Visa, Mastercard, RuPay, Amex',
    icon: <CreditCard className="w-6 h-6" />,
    category: 'card',
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    description: '50+ Banks - SBI, HDFC, ICICI, Axis',
    icon: <Banknote className="w-6 h-6" />,
    category: 'netbanking',
  },
  {
    id: 'wallet',
    name: 'Wallets',
    description: 'Paytm, Amazon Pay, Mobikwik',
    icon: <Wallet className="w-6 h-6" />,
    category: 'wallet',
  },
  {
    id: 'bnpl',
    name: 'Buy Now Pay Later',
    description: 'Simpl, LazyPay, ZestMoney',
    icon: <Calendar className="w-6 h-6" />,
    category: 'bnpl',
  },
  {
    id: 'emi',
    name: 'EMI',
    description: 'Credit/Debit Card EMI',
    icon: <Zap className="w-6 h-6" />,
    category: 'emi',
  },
];

export default function PaymentOptions({
  onSelectMethod,
  selectedMethod,
  amount,
}: PaymentOptionsProps) {
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Select Payment Method</h2>
        <p className="text-gray-400">
          Pay <span className="text-orange-300">₹{amount.toFixed(2)}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method.id}
            onClick={() => onSelectMethod(method.id)}
            onMouseEnter={() => setHoveredMethod(method.id)}
            onMouseLeave={() => setHoveredMethod(null)}
            className={`relative rounded-xl border-2 p-4 transition-all ${
              selectedMethod === method.id
                ? 'border-orange-300 bg-orange-300/10 shadow-lg shadow-orange-300/30'
                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]'
            } ${hoveredMethod === method.id ? 'scale-105' : 'scale-100'}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`rounded-lg p-2 ${
                  selectedMethod === method.id
                    ? 'bg-orange-300/20 text-orange-300'
                    : 'bg-white/10 text-gray-400'
                }`}
              >
                {method.icon}
              </div>
              <div className="flex-1 text-left">
                <h3
                  className={`font-semibold ${
                    selectedMethod === method.id ? 'text-orange-300' : 'text-white'
                  }`}
                >
                  {method.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{method.description}</p>
              </div>
            </div>

            {selectedMethod === method.id && (
              <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-orange-300 flex items-center justify-center">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-gray-400">
          ✓ 100% Secure &nbsp;|&nbsp; SSL Encrypted &nbsp;|&nbsp; PCI DSS Compliant
        </p>
      </div>
    </div>
  );
}
