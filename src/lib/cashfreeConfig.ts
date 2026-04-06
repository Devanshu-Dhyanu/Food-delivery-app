type CashfreeEnvironment = 'production' | 'sandbox';

const normalizeEnvValue = (value: unknown) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/^['"]|['"]$/g, '');
};

export interface CashfreeConfig {
  clientId: string;
  clientSecret: string;
  environment: CashfreeEnvironment;
  apiBaseUrl: string;
}

export const getCashfreeConfig = (): CashfreeConfig => {
  const clientId =
    normalizeEnvValue(import.meta.env.VITE_CASHFREE_CLIENT_ID) ||
    normalizeEnvValue(import.meta.env.VITE_CASHFREE_APP_ID);

  const clientSecret =
    normalizeEnvValue(import.meta.env.VITE_CASHFREE_CLIENT_SECRET) ||
    normalizeEnvValue(import.meta.env.VITE_CASHFREE_SECRET_KEY);

  const rawEnvironment =
    normalizeEnvValue(import.meta.env.VITE_CASHFREE_ENVIRONMENT) ||
    normalizeEnvValue(import.meta.env.VITE_CASHFREE_ENV) ||
    'sandbox';

  const environment: CashfreeEnvironment =
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
