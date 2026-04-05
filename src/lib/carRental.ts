import type { RentalBookingStatus, RentalHandoffType } from './supabase';

export const rentalHandoffLabels: Record<RentalHandoffType, string> = {
  delivery_to_user: 'Bring the car to me',
  self_pickup: 'I will pick it up',
};

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
