const normalizeEnvValue = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/^['"]|['"]$/g, '');
};

export const getCashfreeServerConfig = () => {
  const clientId =
    normalizeEnvValue(process.env.CASHFREE_CLIENT_ID) ||
    normalizeEnvValue(process.env.VITE_CASHFREE_CLIENT_ID) ||
    normalizeEnvValue(process.env.VITE_CASHFREE_APP_ID);

  const clientSecret =
    normalizeEnvValue(process.env.CASHFREE_CLIENT_SECRET) ||
    normalizeEnvValue(process.env.VITE_CASHFREE_CLIENT_SECRET) ||
    normalizeEnvValue(process.env.VITE_CASHFREE_SECRET_KEY);

  const rawEnvironment =
    normalizeEnvValue(process.env.CASHFREE_ENVIRONMENT) ||
    normalizeEnvValue(process.env.VITE_CASHFREE_ENVIRONMENT) ||
    normalizeEnvValue(process.env.VITE_CASHFREE_ENV) ||
    'sandbox';

  const environment =
    rawEnvironment.toLowerCase() === 'production' ? 'production' : 'sandbox';

  return {
    clientId,
    clientSecret,
    environment,
    apiBaseUrl:
      environment === 'production'
        ? 'https://api.cashfree.com/pg'
        : 'https://sandbox.cashfree.com/pg',
  };
};

export const readJsonBody = async (req) => {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === 'object') {
    return req.body;
  }

  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
};

export const sendMethodNotAllowed = (res, allowedMethod) => {
  res.setHeader('Allow', allowedMethod);
  return res.status(405).json({ error: 'Method not allowed' });
};
