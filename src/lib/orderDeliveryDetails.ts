import {
  appendDeliveryPreference,
  parseDeliveryPreference,
  type DeliveryPreference,
} from './deliveryPreferences';

const SCHEDULED_DELIVERY_PREFIX = '\n\n[Scheduled delivery: ';
const SCHEDULED_DELIVERY_SUFFIX = ']';

export const formatScheduledDelivery = (value: string) => {
  const scheduledDate = new Date(value);

  if (Number.isNaN(scheduledDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(scheduledDate);
};

export const appendOrderDeliveryDetails = ({
  address,
  preference,
  scheduledDeliveryAt,
}: {
  address: string;
  preference: DeliveryPreference | null;
  scheduledDeliveryAt?: string | null;
}) => {
  let result = address.trim();

  if (scheduledDeliveryAt) {
    result = `${result}${SCHEDULED_DELIVERY_PREFIX}${scheduledDeliveryAt}${SCHEDULED_DELIVERY_SUFFIX}`;
  }

  return appendDeliveryPreference(result, preference);
};

export const parseScheduledDelivery = (value: string) => {
  const trimmedValue = value.trim();
  const prefixIndex = trimmedValue.lastIndexOf(SCHEDULED_DELIVERY_PREFIX);

  if (
    prefixIndex === -1 ||
    !trimmedValue.endsWith(SCHEDULED_DELIVERY_SUFFIX)
  ) {
    return {
      address: trimmedValue,
      scheduledDeliveryAt: null as string | null,
    };
  }

  const address = trimmedValue.slice(0, prefixIndex).trim();
  const scheduledDeliveryAt = trimmedValue
    .slice(
      prefixIndex + SCHEDULED_DELIVERY_PREFIX.length,
      -SCHEDULED_DELIVERY_SUFFIX.length
    )
    .trim();

  if (Number.isNaN(new Date(scheduledDeliveryAt).getTime())) {
    return {
      address: trimmedValue,
      scheduledDeliveryAt: null as string | null,
    };
  }

  return {
    address,
    scheduledDeliveryAt,
  };
};

export const parseOrderDeliveryDetails = (value: string) => {
  const deliveryPreference = parseDeliveryPreference(value);
  const scheduledDelivery = parseScheduledDelivery(deliveryPreference.address);

  return {
    address: scheduledDelivery.address,
    preference: deliveryPreference.preference,
    scheduledDeliveryAt: scheduledDelivery.scheduledDeliveryAt,
  };
};
