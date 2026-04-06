import {
  getCashfreeServerConfig,
  readJsonBody,
  sendMethodNotAllowed,
} from '../_lib/cashfree.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, 'POST');
  }

  const body = await readJsonBody(req);
  const {
    orderId,
    amount,
    customerId,
    customerEmail,
    customerPhone,
    customerName,
    returnUrl,
    notifyUrl,
    orderNote,
  } = body;

  if (!orderId || typeof orderId !== 'string') {
    return res.status(400).json({ error: 'orderId is required' });
  }

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: 'A valid amount is required' });
  }

  const cashfreeConfig = getCashfreeServerConfig();
  if (!cashfreeConfig.clientId || !cashfreeConfig.clientSecret) {
    return res.status(500).json({
      error:
        'Cashfree server credentials are missing. Set CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET in Vercel.',
    });
  }

  const paymentRequest = {
    order_id: orderId,
    order_amount: numericAmount,
    order_currency: 'INR',
    customer_details: {
      customer_id: customerId || `guest-${Date.now()}`,
      customer_email: customerEmail || 'customer@example.com',
      customer_phone: customerPhone || '9000090000',
      customer_name: customerName || 'Customer',
    },
    order_meta: {
      return_url: returnUrl,
    },
    order_note: orderNote || '',
  };

  if (notifyUrl) {
    paymentRequest.order_meta.notify_url = notifyUrl;
  }

  try {
    const response = await fetch(`${cashfreeConfig.apiBaseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': cashfreeConfig.clientId,
        'x-client-secret': cashfreeConfig.clientSecret,
      },
      body: JSON.stringify(paymentRequest),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.message ||
          data?.error ||
          data?.error_description ||
          'Failed to create payment order',
        details: data,
      });
    }

    const paymentSessionId =
      data?.payment_session_id || data?.data?.payment_session_id || null;
    const paymentUrl =
      data?.payment_link ||
      data?.checkout_url ||
      data?.data?.url ||
      (paymentSessionId
        ? `${cashfreeConfig.apiBaseUrl}/pay/${paymentSessionId}`
        : null);

    return res.status(200).json({
      orderId: data?.order_id || orderId,
      paymentSessionId,
      paymentUrl,
      environment: cashfreeConfig.environment,
    });
  } catch (error) {
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : 'Failed to initiate payment',
    });
  }
}
