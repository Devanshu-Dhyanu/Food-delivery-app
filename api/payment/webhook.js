import { readJsonBody, sendMethodNotAllowed } from '../_lib/cashfree.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, 'POST');
  }

  const payload = await readJsonBody(req);
  return res.status(200).json({
    received: true,
    event: payload?.type || payload?.event || null,
  });
}
