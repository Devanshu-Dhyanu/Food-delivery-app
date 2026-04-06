// Cashfree Payment Gateway Integration
// Supports: UPI, Cards, Net Banking, Wallets, BNPL, EMI

interface CashfreeConfig {
  clientId: string;
  clientSecret: string;
  environment: 'production' | 'sandbox';
}

interface PaymentInitRequest {
  amount: number;
  orderId: string;
  userId: string;
  userEmail: string;
  userPhone: string;
  paymentMethod?: string;
  orderNote?: string;
}

interface PaymentResponse {
  status: 'success' | 'failure' | 'pending';
  transactionId: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  timestamp: string;
  gatewayResponse: any;
}

interface RefundRequest {
  transactionId: string;
  amount: number;
  reason: string;
}

class CashfreePaymentGateway {
  private clientId: string;
  private clientSecret: string;
  private apiUrl: string;

  constructor(config: CashfreeConfig) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.apiUrl =
      config.environment === 'production'
        ? 'https://api.cashfree.com/pg'
        : 'https://sandbox.cashfree.com/pg';
  }

  /**
   * Initialize payment - Get payment link or start payment session
   */
  async initiatePayment(request: PaymentInitRequest): Promise<{
    sessionId: string;
    paymentLink: string;
  }> {
    try {
      const payload = {
        order_id: request.orderId,
        order_amount: request.amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: request.userId,
          customer_email: request.userEmail,
          customer_phone: request.userPhone,
        },
        order_meta: {
          return_url: `${window.location.origin}/payment/callback`,
          notify_url: `${window.location.origin}/api/payment/webhook`,
        },
        order_note: request.orderNote || '',
      };

      const response = await fetch(`${this.apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': this.clientId,
          'x-client-secret': this.clientSecret,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Payment initiation failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        sessionId: data.order_id,
        paymentLink: data.payment_link || data.checkout_url,
      };
    } catch (error) {
      console.error('Cashfree payment initiation error:', error);
      throw error;
    }
  }

  /**
   * Verify payment after redirect
   */
  async verifyPayment(orderId: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(
        `${this.apiUrl}/orders/${orderId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': this.clientId,
            'x-client-secret': this.clientSecret,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Payment verification failed: ${response.statusText}`);
      }

      const data = await response.json();
      const paymentEntity = data.order_payments?.[0] || {};

      return {
        status: data.order_status === 'PAID' ? 'success' : 'failure',
        transactionId: paymentEntity.cf_payment_id || '',
        orderId: data.order_id,
        amount: data.order_amount,
        paymentMethod: paymentEntity.payment_method || 'unknown',
        timestamp: new Date().toISOString(),
        gatewayResponse: data,
      };
    } catch (error) {
      console.error('Cashfree payment verification error:', error);
      throw error;
    }
  }

  /**
   * Process refund
   */
  async processRefund(refundRequest: RefundRequest): Promise<{
    refundId: string;
    status: 'initiated' | 'success' | 'failure';
    amount: number;
  }> {
    try {
      const payload = {
        refund_amount: refundRequest.amount,
        refund_note: refundRequest.reason,
      };

      const response = await fetch(
        `${this.apiUrl}/payments/${refundRequest.transactionId}/refunds`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': this.clientId,
            'x-client-secret': this.clientSecret,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Refund processing failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        refundId: data.refund_id,
        status: data.refund_status === 'SUCCESS' ? 'success' : 'initiated',
        amount: data.refund_amount,
      };
    } catch (error) {
      console.error('Cashfree refund processing error:', error);
      throw error;
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(transactionId: string): Promise<{
    status: string;
    amount: number;
    method: string;
  }> {
    try {
      const response = await fetch(
        `${this.apiUrl}/payments/${transactionId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': this.clientId,
            'x-client-secret': this.clientSecret,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch payment status: ${response.statusText}`
        );
      }

      const data = await response.json();

      return {
        status: data.payment_status || 'unknown',
        amount: data.payment_amount,
        method: data.payment_method,
      };
    } catch (error) {
      console.error('Cashfree payment status fetch error:', error);
      throw error;
    }
  }

  /**
   * Get supported payment methods
   */
  getSupportedPaymentMethods(): {
    method: string;
    display: string;
    icon: string;
  }[] {
    return [
      { method: 'upi', display: 'UPI (Google Pay, PhonePe, BHIM)', icon: '💳' },
      { method: 'card', display: 'Debit/Credit Card', icon: '🏦' },
      { method: 'netbanking', display: 'Net Banking', icon: '🏧' },
      { method: 'wallet', display: 'Wallets (Paytm, Amazon Pay)', icon: '👛' },
      { method: 'bnpl', display: 'Buy Now Pay Later', icon: '📅' },
      { method: 'emi', display: 'EMI Options', icon: '📊' },
    ];
  }
}

// Export singleton instance (to be initialized with actual credentials)
let cashfreeInstance: CashfreePaymentGateway | null = null;

export function initializeCashfree(config: CashfreeConfig): CashfreePaymentGateway {
  cashfreeInstance = new CashfreePaymentGateway(config);
  return cashfreeInstance;
}

export function getCashfreeInstance(): CashfreePaymentGateway {
  if (!cashfreeInstance) {
    throw new Error('Cashfree not initialized. Call initializeCashfree first.');
  }
  return cashfreeInstance;
}

export type { PaymentInitRequest, PaymentResponse, RefundRequest };
export default CashfreePaymentGateway;
