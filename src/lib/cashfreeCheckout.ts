type CashfreeMode = 'sandbox' | 'production';

type CashfreeCheckoutInstance = {
  checkout: (options: {
    paymentSessionId: string;
    redirectTarget?: '_self' | '_blank' | '_top' | '_modal' | HTMLElement;
  }) => Promise<{ error?: { message?: string } } | void> | void;
};

type CashfreeFactory = (options: { mode: CashfreeMode }) => CashfreeCheckoutInstance;

declare global {
  interface Window {
    Cashfree?: CashfreeFactory;
  }
}

const CASHFREE_SDK_URL = 'https://sdk.cashfree.com/js/v3/cashfree.js';

let sdkLoader: Promise<CashfreeFactory> | null = null;

const loadCashfreeSdk = (): Promise<CashfreeFactory> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Cashfree checkout is only available in the browser.'));
  }

  if (window.Cashfree) {
    return Promise.resolve(window.Cashfree);
  }

  if (sdkLoader) {
    return sdkLoader;
  }

  sdkLoader = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${CASHFREE_SDK_URL}"]`
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.Cashfree) {
          resolve(window.Cashfree);
        } else {
          reject(new Error('Cashfree SDK loaded, but Cashfree() is unavailable.'));
        }
      });

      existingScript.addEventListener('error', () => {
        reject(new Error('Failed to load Cashfree SDK.'));
      });

      return;
    }

    const script = document.createElement('script');
    script.src = CASHFREE_SDK_URL;
    script.async = true;
    script.onload = () => {
      if (window.Cashfree) {
        resolve(window.Cashfree);
      } else {
        reject(new Error('Cashfree SDK loaded, but Cashfree() is unavailable.'));
      }
    };
    script.onerror = () => {
      reject(new Error('Failed to load Cashfree SDK.'));
    };

    document.head.appendChild(script);
  });

  return sdkLoader;
};

export const openCashfreeCheckout = async ({
  paymentSessionId,
  environment,
}: {
  paymentSessionId: string;
  environment: CashfreeMode;
}) => {
  const Cashfree = await loadCashfreeSdk();
  const cashfree = Cashfree({ mode: environment });
  const result = await cashfree.checkout({
    paymentSessionId,
    redirectTarget: '_self',
  });

  if (result && typeof result === 'object' && 'error' in result && result.error?.message) {
    throw new Error(result.error.message);
  }
};
