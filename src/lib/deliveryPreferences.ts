export const DELIVERY_PREFERENCES = [
  'Call mat karna',
  'Text only',
  'Gate pe drop',
] as const;

export type DeliveryPreference = (typeof DELIVERY_PREFERENCES)[number];

const DELIVERY_PREFERENCE_PREFIX = '\n\n[Delivery preference: ';
const DELIVERY_PREFERENCE_SUFFIX = ']';

export const appendDeliveryPreference = (
  address: string,
  preference: DeliveryPreference | null
) => {
  const trimmedAddress = address.trim();

  if (!preference) {
    return trimmedAddress;
  }

  return `${trimmedAddress}${DELIVERY_PREFERENCE_PREFIX}${preference}${DELIVERY_PREFERENCE_SUFFIX}`;
};

export const parseDeliveryPreference = (value: string) => {
  const trimmedValue = value.trim();
  const prefixIndex = trimmedValue.lastIndexOf(DELIVERY_PREFERENCE_PREFIX);

  if (prefixIndex === -1 || !trimmedValue.endsWith(DELIVERY_PREFERENCE_SUFFIX)) {
    return {
      address: trimmedValue,
      preference: null as DeliveryPreference | null,
    };
  }

  const address = trimmedValue.slice(0, prefixIndex).trim();
  const preference = trimmedValue
    .slice(prefixIndex + DELIVERY_PREFERENCE_PREFIX.length, -DELIVERY_PREFERENCE_SUFFIX.length)
    .trim() as DeliveryPreference;

  if (!DELIVERY_PREFERENCES.includes(preference)) {
    return {
      address: trimmedValue,
      preference: null as DeliveryPreference | null,
    };
  }

  return {
    address,
    preference,
  };
};
