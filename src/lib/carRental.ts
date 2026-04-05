import type { RentalBookingStatus, RentalHandoffType, RentalVehicle } from './supabase';

export const rentalHandoffLabels: Record<RentalHandoffType, string> = {
  delivery_to_user: 'Bring the car to me',
  self_pickup: 'I will pick it up',
};

export type RentalPickupMood = RentalHandoffType | 'flexible';

export const rentalPickupMoodLabels: Record<RentalPickupMood, string> = {
  delivery_to_user: 'Need delivery',
  self_pickup: 'Self pickup',
  flexible: 'Flexible handoff',
};

export type RentalTripIntent =
  | 'market_run'
  | 'station_pickup'
  | 'city_ride'
  | 'family_outing';

export const rentalTripIntentLabels: Record<RentalTripIntent, string> = {
  market_run: 'Market run',
  station_pickup: 'Station pickup',
  city_ride: 'City ride',
  family_outing: 'Family outing',
};

export type RentalCampusSpot =
  | 'main_gate'
  | 'bh_block'
  | 'academic_block'
  | 'mall_road_side';

export const rentalCampusSpotLabels: Record<RentalCampusSpot, string> = {
  main_gate: 'Main Gate',
  bh_block: 'BH Block',
  academic_block: 'Academic Block',
  mall_road_side: 'Mall Road Side',
};

export const rentalConfidencePoints = ['ID check', 'Clean handoff', 'Flexible pickup'] as const;

const FLEXIBLE_PICKUP_NOTE_PREFIX = 'Pickup mood: Flexible handoff';
const TRIP_INTENT_NOTE_PREFIX = 'Trip intent: ';
const PICKUP_SPOT_NOTE_PREFIX = 'Preferred campus spot: ';
const noteMetadataPrefixes = [
  FLEXIBLE_PICKUP_NOTE_PREFIX,
  TRIP_INTENT_NOTE_PREFIX,
  PICKUP_SPOT_NOTE_PREFIX,
];

export const rentalStatusLabels: Record<RentalBookingStatus, string> = {
  pending: 'Pending review',
  approved: 'Approved',
  active: 'Active now',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const rentalStatusClasses: Record<RentalBookingStatus, string> = {
  pending: 'border-amber-400/25 bg-amber-500/15 text-amber-200',
  approved: 'border-sky-400/25 bg-sky-500/15 text-sky-200',
  active: 'border-emerald-400/25 bg-emerald-500/15 text-emerald-200',
  completed: 'border-white/10 bg-white/5 text-gray-200',
  cancelled: 'border-red-400/25 bg-red-500/15 text-red-200',
};

export const formatInr = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export const formatDateTimeLocal = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
};

export const formatDateTimeDisplay = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export const addHoursToDateTimeLocal = (dateTimeValue: string, hours: number) => {
  const start = new Date(dateTimeValue);

  if (Number.isNaN(start.getTime()) || !Number.isFinite(hours) || hours <= 0) {
    return '';
  }

  const nextDate = new Date(start.getTime() + hours * 60 * 60 * 1000);
  return formatDateTimeLocal(nextDate);
};

export const getRoundedHoursBetween = (startValue: string, endValue: string) => {
  const start = new Date(startValue);
  const end = new Date(endValue);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  const difference = end.getTime() - start.getTime();

  if (difference <= 0) {
    return 0;
  }

  return Math.max(1, Math.ceil(difference / (60 * 60 * 1000)));
};

const getMetadataLineValue = (notes: string | null | undefined, prefix: string) => {
  if (!notes) {
    return '';
  }

  return (
    notes
      .split('\n')
      .find((line) => line.trim().startsWith(prefix))
      ?.trim()
      .slice(prefix.length) ?? ''
  );
};

const findLabelKey = <T extends string>(labels: Record<T, string>, label: string) =>
  (Object.entries(labels).find(([, value]) => value === label)?.[0] as T | undefined) ?? null;

export const getRentalPickupMood = (
  handoffType: RentalHandoffType,
  notes?: string | null
): RentalPickupMood => {
  if ((notes ?? '').includes(FLEXIBLE_PICKUP_NOTE_PREFIX)) {
    return 'flexible';
  }

  return handoffType;
};

export const getRentalTripIntent = (notes?: string | null) =>
  findLabelKey(rentalTripIntentLabels, getMetadataLineValue(notes, TRIP_INTENT_NOTE_PREFIX));

export const getRentalCampusSpot = (notes?: string | null) =>
  findLabelKey(rentalCampusSpotLabels, getMetadataLineValue(notes, PICKUP_SPOT_NOTE_PREFIX));

export const buildRentalNotes = (
  notes: string,
  pickupMood: RentalPickupMood,
  tripIntent?: RentalTripIntent | '',
  pickupSpot?: RentalCampusSpot | ''
) => {
  const trimmedNotes = notes.trim();
  const metadataLines: string[] = [];

  if (pickupMood === 'flexible') {
    metadataLines.push(FLEXIBLE_PICKUP_NOTE_PREFIX);
  }

  if (tripIntent) {
    metadataLines.push(`${TRIP_INTENT_NOTE_PREFIX}${rentalTripIntentLabels[tripIntent]}`);
  }

  if (pickupSpot) {
    metadataLines.push(`${PICKUP_SPOT_NOTE_PREFIX}${rentalCampusSpotLabels[pickupSpot]}`);
  }

  const finalLines = [...metadataLines, trimmedNotes].filter(Boolean);
  return finalLines.length > 0 ? finalLines.join('\n') : null;
};

export const cleanRentalNotes = (notes?: string | null) => {
  if (!notes) {
    return '';
  }

  return notes
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !noteMetadataPrefixes.some((prefix) => line.startsWith(prefix)))
    .join('\n')
    .trim();
};

export const getRentalAvailabilityTone = (
  vehicle: RentalVehicle,
  lowestAvailablePrice: number
) => {
  if (!vehicle.is_available) {
    return 'Booked for the moment';
  }

  if (vehicle.price_per_hour === lowestAvailablePrice) {
    return 'Best for now';
  }

  return 'Ready today';
};

export const getRentalSuitabilityTags = (vehicle: RentalVehicle) => {
  const searchableText = `${vehicle.name} ${vehicle.description}`.toLowerCase();
  const tags: string[] = [];

  if (
    vehicle.seats <= 4 ||
    searchableText.includes('compact') ||
    searchableText.includes('lite') ||
    searchableText.includes('city')
  ) {
    tags.push('Best for 2-3 people');
  } else {
    tags.push('Comfort for 4-5 people');
  }

  if (
    vehicle.seats >= 5 ||
    searchableText.includes('suv') ||
    searchableText.includes('luggage') ||
    searchableText.includes('weekend')
  ) {
    tags.push('Good for luggage');
  }

  if (
    searchableText.includes('compact') ||
    searchableText.includes('lite') ||
    searchableText.includes('city') ||
    vehicle.price_per_hour <= 180
  ) {
    tags.push('Easy city parking');
  }

  return Array.from(new Set(tags)).slice(0, 3);
};

export const getRentalBestTimeHint = (dateTimeValue: string) => {
  if (!dateTimeValue) {
    return '';
  }

  const date = new Date(dateTimeValue);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const hour = date.getHours();

  if (hour >= 6 && hour < 11) {
    return 'Morning pickups are usually smoother.';
  }

  if (hour >= 17 && hour < 22) {
    return 'Evening demand may be higher.';
  }

  if (hour >= 22 || hour < 6) {
    return 'Late slots usually need quicker confirmation from the team.';
  }

  return 'Midday slots are usually easy to coordinate.';
};

export const isCarRentalSchemaMissing = (error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
      ? String(error.message ?? '')
      : String(error ?? '');

  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes('rental_vehicles') ||
    normalizedMessage.includes('rental_bookings') ||
    normalizedMessage.includes('does not exist') ||
    normalizedMessage.includes('could not find the table')
  );
};
