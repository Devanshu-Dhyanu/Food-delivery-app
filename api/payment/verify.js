import { getCashfreeServerConfig, sendMethodNotAllowed } from '../_lib/cashfree.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendMethodNotAllowed(res, 'GET');
  }

  const orderId = req.query?.order_id || req.query?.orderId;

  if (!orderId || typeof orderId !== 'string') {
    return res.status(400).json({ error: 'order_id is required' });
  }

  const cashfreeConfig = getCashfreeServerConfig();
  if (!cashfreeConfig.clientId || !cashfreeConfig.clientSecret) {
    return res.status(500).json({
      error:
        'Cashfree server credentials are missing. Set CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET in Vercel.',
    });
  }

  try {
    const response = await fetch(
      `${cashfreeConfig.apiBaseUrl}/orders/${encodeURIComponent(orderId)}/payments`,
      {
        headers: {
          'x-api-version': '2023-08-01',
          'x-client-id': cashfreeConfig.clientId,
          'x-client-secret': cashfreeConfig.clientSecret,
        },
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.message ||
          data?.error ||
          data?.error_description ||
          'Failed to verify payment',
        details: data,
      });
    }

    const payments = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

    return res.status(200).json({ payments });
  } catch (error) {
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : 'Failed to verify payment',
    });
  }
}
