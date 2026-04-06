import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CalendarClock,
  CarFront,
  CheckCircle2,
  Clock3,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from 'lucide-react';
import { sanitizeName, sanitizePhone, sanitizeText } from '../lib/inputSanitization';
import {
  addHoursToDateTimeLocal,
  buildRentalNotes,
  rentalContactPreferenceLabels,
  formatDateTimeDisplay,
  formatInr,
  getRentalBestTimeHint,
  rentalCampusSpotLabels,
  rentalConfidencePoints,
  rentalTripIntentLabels,
  getRoundedHoursBetween,
  isCarRentalSchemaMissing,
  rentalPickupMoodLabels,
  type RentalCampusSpot,
  type RentalContactPreference,
  type RentalPickupMood,
  type RentalTripIntent,
} from '../lib/carRental';
import {
  supabase,
  type RentalHandoffType,
  type RentalVehicle,
  type UserProfile,
} from '../lib/supabase';

interface CarRentalBookingProps {
  userId: string;
  vehicle: RentalVehicle;
  fallbackName?: string;
  onBack: () => void;
  onViewBookings: () => void;
}

type BookingForm = {
  customerName: string;
  customerPhone: string;
  rentalHours: string;
  startDateTime: string;
  endDateTime: string;
  tripIntent: RentalTripIntent | '';
  pickupSpot: RentalCampusSpot | '';
  contactPreference: RentalContactPreference;
  pickupMood: RentalPickupMood;
  handoffType: RentalHandoffType;
  notes: string;
  termsAccepted: boolean;
};

const initialBookingForm: BookingForm = {
  customerName: '',
  customerPhone: '',
  rentalHours: '',
  startDateTime: '',
  endDateTime: '',
  tripIntent: '',
  pickupSpot: '',
  contactPreference: 'call',
  pickupMood: 'self_pickup',
  handoffType: 'self_pickup',
  notes: '',
  termsAccepted: false,
};

const terms = [
  'A valid college or government ID should be shown during handoff.',
  'Late returns may lead to extra hourly billing.',
  'Fuel, safety, and visible damage are checked at the time of pickup and return.',
];

const quickDurationOptions = [2, 4, 6, 12];
const costLadderDurations = [2, 4, 8, 12];

const pickupMoodOptions: Array<{
  value: RentalPickupMood;
  title: string;
  description: string;
  handoffType: RentalHandoffType;
}> = [
  {
    value: 'self_pickup',
    title: 'Self pickup',
    description: 'You collect the car from the rental desk or selected pickup point.',
    handoffType: 'self_pickup',
  },
  {
    value: 'delivery_to_user',
    title: 'Need delivery',
    description: 'The team brings the car to your side once the request is approved.',
    handoffType: 'delivery_to_user',
  },
  {
    value: 'flexible',
    title: 'Flexible handoff',
    description: 'You are open to either pickup or delivery depending on what works best.',
    handoffType: 'self_pickup',
  },
];

const tripIntentOptions: Array<{
  value: RentalTripIntent;
  title: string;
  description: string;
}> = [
  {
    value: 'market_run',
    title: 'Market run',
    description: 'Best for practical errands, quick shopping, and short city movement.',
  },
  {
    value: 'station_pickup',
    title: 'Station pickup',
    description: 'Good for pickup timing where luggage space and handoff clarity matter.',
  },
  {
    value: 'city_ride',
    title: 'City ride',
    description: 'A flexible option for local travel, meetings, and campus-outside plans.',
  },
  {
    value: 'family_outing',
    title: 'Family outing',
    description: 'A better fit for longer windows and comfort-focused bookings.',
  },
];

const campusSpotOptions: RentalCampusSpot[] = [
  'main_gate',
  'bh_block',
  'academic_block',
  'mall_road_side',
];

const contactPreferenceOptions: Array<{
  value: RentalContactPreference;
  title: string;
  description: string;
}> = [
  {
    value: 'call',
    title: 'Call',
    description: 'Best when you want a direct handoff confirmation.',
  },
  {
    value: 'whatsapp',
    title: 'WhatsApp',
    description: 'Useful for quick location sharing and smooth coordination.',
  },
  {
    value: 'text',
    title: 'Text',
    description: 'Low-noise option for simple updates and arrival pings.',
  },
];

export default function CarRentalBooking({
  userId,
  vehicle,
  fallbackName = '',
  onBack,
  onViewBookings,
}: CarRentalBookingProps) {
  const [form, setForm] = useState<BookingForm>({
    ...initialBookingForm,
    customerName: fallbackName.trim(),
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadProfileDefaults = async () => {
      setLoadingProfile(true);

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!isMounted) {
          return;
        }

        const profile = (data as UserProfile | null) ?? null;
        setForm((current) => ({
          ...current,
          customerName: current.customerName || profile?.name || fallbackName.trim(),
          customerPhone: current.customerPhone || profile?.phone || '',
        }));
      } catch (error) {
        console.error('Error pre-filling rental booking profile:', error);

        if (isMounted) {
          setForm((current) => ({
            ...current,
            customerName: current.customerName || fallbackName.trim(),
          }));
        }
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
        }
      }
    };

    void loadProfileDefaults();

    return () => {
      isMounted = false;
    };
  }, [fallbackName, userId]);

  const totalAmount = useMemo(() => {
    const hours = Number(form.rentalHours);

    if (!Number.isFinite(hours) || hours <= 0) {
      return 0;
    }

    return vehicle.price_per_hour * hours;
  }, [form.rentalHours, vehicle.price_per_hour]);

  const selectedPickupMood =
    pickupMoodOptions.find((option) => option.value === form.pickupMood) ?? pickupMoodOptions[0];
  const bestTimeHint = useMemo(
    () => getRentalBestTimeHint(form.startDateTime),
    [form.startDateTime]
  );

  const updateForm = (field: keyof BookingForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrorMessage('');
    setSuccessMessage('');
  };

  const applyRentalHours = (hours: number) => {
    const value = String(hours);

    setForm((current) => ({
      ...current,
      rentalHours: value,
      endDateTime:
        current.startDateTime && hours > 0
          ? syncEndFromHours(current.startDateTime, value)
          : current.endDateTime,
    }));
    setErrorMessage('');
    setSuccessMessage('');
  };

  const updatePickupMood = (pickupMood: RentalPickupMood) => {
    const nextMood =
      pickupMoodOptions.find((option) => option.value === pickupMood) ?? pickupMoodOptions[0];

    setForm((current) => ({
      ...current,
      pickupMood: nextMood.value,
      handoffType: nextMood.handoffType,
    }));
    setErrorMessage('');
    setSuccessMessage('');
  };

  const syncEndFromHours = (startDateTime: string, rentalHours: string) => {
    const hours = Number(rentalHours);

    if (!startDateTime || !Number.isFinite(hours) || hours <= 0) {
      return '';
    }

    return addHoursToDateTimeLocal(startDateTime, hours);
  };

  const handleStartDateChange = (value: string) => {
    setForm((current) => {
      const nextEndDateTime =
        current.rentalHours && Number(current.rentalHours) > 0
          ? syncEndFromHours(value, current.rentalHours)
          : current.endDateTime;
      const nextHours =
        !current.rentalHours && value && current.endDateTime
          ? String(getRoundedHoursBetween(value, current.endDateTime))
          : current.rentalHours;

      return {
        ...current,
        startDateTime: value,
        endDateTime: nextEndDateTime,
        rentalHours: nextHours === '0' ? '' : nextHours,
      };
    });
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleRentalHoursChange = (value: string) => {
    setForm((current) => ({
      ...current,
      rentalHours: value,
      endDateTime:
        current.startDateTime && Number(value) > 0
          ? syncEndFromHours(current.startDateTime, value)
          : current.endDateTime,
    }));
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleEndDateChange = (value: string) => {
    setForm((current) => {
      const calculatedHours =
        current.startDateTime && value ? getRoundedHoursBetween(current.startDateTime, value) : 0;

      return {
        ...current,
        endDateTime: value,
        rentalHours: calculatedHours > 0 ? String(calculatedHours) : current.rentalHours,
      };
    });
    setErrorMessage('');
    setSuccessMessage('');
  };

  const isSubmitDisabled =
    saving ||
    loadingProfile ||
    !form.customerName.trim() ||
    !form.customerPhone.trim() ||
    !form.rentalHours ||
    !form.startDateTime ||
    !form.endDateTime ||
    !form.termsAccepted;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const rentalHours = Number(form.rentalHours);

    if (!Number.isFinite(rentalHours) || rentalHours <= 0) {
      setErrorMessage('Please enter valid rental hours before submitting.');
      return;
    }

    if (!form.startDateTime || !form.endDateTime) {
      setErrorMessage('Please add both start and end date/time for the rental.');
      return;
    }

    const roundedHours = getRoundedHoursBetween(form.startDateTime, form.endDateTime);

    if (roundedHours <= 0) {
      setErrorMessage('End date/time should be after the start date/time.');
      return;
    }

    // Sanitize input
    try {
      var sanitizedName = sanitizeName(form.customerName);
      var sanitizedPhone = sanitizePhone(form.customerPhone);
      var sanitizedNotes = sanitizeText(form.notes, 'Notes', 0, 500);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Invalid input format');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.from('rental_bookings').insert([
        {
          user_id: userId,
          vehicle_id: vehicle.id,
          customer_name: sanitizedName,
          customer_phone: sanitizedPhone,
          start_datetime: new Date(form.startDateTime).toISOString(),
          end_datetime: new Date(form.endDateTime).toISOString(),
          rental_hours: roundedHours,
          handoff_type: form.handoffType,
          terms_accepted: form.termsAccepted,
          terms_accepted_at: form.termsAccepted ? new Date().toISOString() : null,
          notes: buildRentalNotes(
            sanitizedNotes,
            form.pickupMood,
            form.tripIntent,
            form.pickupSpot,
            form.contactPreference
          ),
          total_amount: vehicle.price_per_hour * roundedHours,
          status: 'pending',
        },
      ]);

      if (error) {
        throw error;
      }

      setForm((current) => ({
        ...current,
        rentalHours: String(roundedHours),
      }));
      setSuccessMessage('Rental request submitted. You can now track it in My Rentals.');
    } catch (error) {
      console.error('Error creating rental booking:', error);
      setErrorMessage(
        isCarRentalSchemaMissing(error)
          ? 'The car rental database tables are not live yet. Run the SQL file in Supabase first.'
          : 'We could not submit your booking right now. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (successMessage) {
    return (
      <div className="overflow-hidden rounded-[28px] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-gray-900 to-gray-900 shadow-xl shadow-black/20">
        <div className="px-6 py-8 sm:px-8">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/20 text-emerald-200">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
            Booking submitted
          </p>
          <h2 className="mb-3 text-3xl font-bold text-white">{vehicle.name} request is in review</h2>
          <p className="mb-6 max-w-3xl text-sm leading-7 text-gray-300 sm:text-base">
            {successMessage}
          </p>

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/5 bg-white/5 px-4 py-4">
              <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Rental window</p>
              <p className="text-sm font-semibold text-white">
                {formatDateTimeDisplay(form.startDateTime)} to {formatDateTimeDisplay(form.endDateTime)}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/5 bg-white/5 px-4 py-4">
              <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Pickup mood</p>
              <p className="text-sm font-semibold text-white">{rentalPickupMoodLabels[form.pickupMood]}</p>
            </div>
            <div className="rounded-[24px] border border-white/5 bg-white/5 px-4 py-4">
              <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Contact preference</p>
              <p className="text-sm font-semibold text-white">
                {rentalContactPreferenceLabels[form.contactPreference]}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onViewBookings}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
            >
              Go to My Rentals
            </button>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Book another car
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
      <form
        onSubmit={handleSubmit}
        className="rounded-[28px] border border-white/5 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/95 p-6 shadow-xl shadow-black/20"
      >
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to cars</span>
        </button>

        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
            Book {vehicle.name}
          </p>
          <h2 className="mb-3 text-3xl font-bold text-white">Rental booking form</h2>
          <p className="text-sm leading-7 text-gray-400">
            Fill the renter details, choose your hours, set the rental window, and confirm the
            delivery method before submitting the request.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 rounded-[24px] border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-300">Full name</span>
            <input
              type="text"
              value={form.customerName}
              onChange={(event) => updateForm('customerName', event.target.value)}
              placeholder="Your full name"
              className="w-full rounded-2xl border border-white/10 bg-gray-800 px-4 py-3 text-white outline-none transition-colors focus:border-sky-500/40"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-300">Phone number</span>
            <input
              type="tel"
              value={form.customerPhone}
              onChange={(event) => updateForm('customerPhone', event.target.value)}
              placeholder="Contact number"
              className="w-full rounded-2xl border border-white/10 bg-gray-800 px-4 py-3 text-white outline-none transition-colors focus:border-sky-500/40"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-300">Rent hours</span>
            <input
              type="number"
              min="1"
              step="1"
              value={form.rentalHours}
              onChange={(event) => handleRentalHoursChange(event.target.value)}
              placeholder="How many hours?"
              className="w-full rounded-2xl border border-white/10 bg-gray-800 px-4 py-3 text-white outline-none transition-colors focus:border-sky-500/40"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {quickDurationOptions.map((hours) => {
                const isSelected = Number(form.rentalHours) === hours;

                return (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => applyRentalHours(hours)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                      isSelected
                        ? 'border-sky-500/35 bg-sky-500/12 text-sky-100'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {hours}h
                  </button>
                );
              })}
            </div>
          </label>

          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 px-4 py-4">
            <p className="mb-1 text-xs uppercase tracking-[0.16em] text-sky-200">Estimated total</p>
            <p className="text-2xl font-bold text-white">{totalAmount > 0 ? formatInr(totalAmount) : '--'}</p>
            <p className="mt-1 text-sm text-sky-100/75">{formatInr(vehicle.price_per_hour)} per hour</p>
          </div>

          <div className="sm:col-span-2 rounded-[24px] border border-white/5 bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Instant Cost Ladder</p>
                <p className="text-sm text-gray-400">Compare a few common rental lengths at a glance.</p>
              </div>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-300">
                {formatInr(vehicle.price_per_hour)}/hr
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              {costLadderDurations.map((hours) => {
                const total = vehicle.price_per_hour * hours;
                const isSelected = Number(form.rentalHours) === hours;

                return (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => applyRentalHours(hours)}
                    className={`rounded-[22px] border px-4 py-4 text-left transition-all ${
                      isSelected
                        ? 'border-sky-500/35 bg-sky-500/12 shadow-lg shadow-sky-500/10'
                        : 'border-white/10 bg-gray-900/50 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">{hours} hours</p>
                    <p className="text-lg font-bold text-white">{formatInr(total)}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-300">Start date & time</span>
            <input
              type="datetime-local"
              value={form.startDateTime}
              onChange={(event) => handleStartDateChange(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-gray-800 px-4 py-3 text-white outline-none transition-colors focus:border-sky-500/40"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-300">End date & time</span>
            <input
              type="datetime-local"
              value={form.endDateTime}
              onChange={(event) => handleEndDateChange(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-gray-800 px-4 py-3 text-white outline-none transition-colors focus:border-sky-500/40"
            />
          </label>

          {bestTimeHint && (
            <div className="sm:col-span-2 rounded-[24px] border border-amber-400/20 bg-amber-500/10 px-4 py-4 text-sm text-amber-100">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
                Best time hint
              </p>
              <p>{bestTimeHint}</p>
            </div>
          )}

          <div className="sm:col-span-2 rounded-[24px] border border-white/5 bg-white/5 p-5">
            <div className="mb-4">
              <p className="mb-1 text-sm font-semibold text-white">Trip Intent Chips</p>
              <p className="text-sm leading-6 text-gray-400">
                Tell the team what this booking is mainly for so the request feels more specific and easier to review.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {tripIntentOptions.map((option) => {
                const isSelected = form.tripIntent === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateForm('tripIntent', option.value)}
                    className={`rounded-[24px] border px-4 py-4 text-left transition-all ${
                      isSelected
                        ? 'border-sky-500/35 bg-sky-500/12'
                        : 'border-white/10 bg-gray-900/50 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <p className="mb-1 font-semibold text-white">{option.title}</p>
                    <p className="text-sm leading-6 text-gray-400">{option.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-medium text-gray-300">Special note</span>
            <textarea
              value={form.notes}
              onChange={(event) => updateForm('notes', event.target.value)}
              rows={4}
              placeholder="Any pickup note, timing note, or special instruction"
              className="w-full rounded-2xl border border-white/10 bg-gray-800 px-4 py-3 text-white outline-none transition-colors focus:border-sky-500/40"
            />
          </label>
        </div>

        <div className="mt-6 rounded-[24px] border border-white/5 bg-white/5 p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-sm font-semibold text-white">Pickup Mood Toggle</p>
              <p className="text-sm leading-6 text-gray-400">
                Choose whether you want delivery, self pickup, or a flexible handoff before booking.
              </p>
            </div>
            <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-200">
              {rentalPickupMoodLabels[form.pickupMood]}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {pickupMoodOptions.map((option) => {
              const isSelected = form.pickupMood === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updatePickupMood(option.value)}
                  className={`rounded-[24px] border px-4 py-4 text-left transition-all ${
                    isSelected
                      ? 'border-sky-500/35 bg-sky-500/12'
                      : 'border-white/10 bg-gray-900/50 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <p className="mb-1 font-semibold text-white">{option.title}</p>
                  <p className="text-sm leading-6 text-gray-400">{option.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-white/5 bg-white/5 p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-sm font-semibold text-white">Campus Pickup Spots</p>
              <p className="text-sm leading-6 text-gray-400">
                Choose a preferred campus handoff spot so the team has a starting point during confirmation.
              </p>
            </div>
            {form.pickupSpot && (
              <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-200">
                {rentalCampusSpotLabels[form.pickupSpot]}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {campusSpotOptions.map((spot) => {
              const isSelected = form.pickupSpot === spot;

              return (
                <button
                  key={spot}
                  type="button"
                  onClick={() => updateForm('pickupSpot', isSelected ? '' : spot)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-sky-500/35 bg-sky-500/12 text-sky-100'
                      : 'border-white/10 bg-gray-900/50 text-gray-300 hover:border-white/20 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {rentalCampusSpotLabels[spot]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-white/5 bg-white/5 p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-sm font-semibold text-white">Pickup Contact Preference</p>
              <p className="text-sm leading-6 text-gray-400">
                Tell the rental team how you would prefer to be contacted at handoff time.
              </p>
            </div>
            <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-200">
              {rentalContactPreferenceLabels[form.contactPreference]}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {contactPreferenceOptions.map((option) => {
              const isSelected = form.contactPreference === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateForm('contactPreference', option.value)}
                  className={`rounded-[24px] border px-4 py-4 text-left transition-all ${
                    isSelected
                      ? 'border-sky-500/35 bg-sky-500/12'
                      : 'border-white/10 bg-gray-900/50 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <p className="mb-1 font-semibold text-white">{option.title}</p>
                  <p className="text-sm leading-6 text-gray-400">{option.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-white/5 bg-white/5 p-5">
          <p className="mb-3 text-sm font-semibold text-white">Terms and conditions</p>
          <div className="space-y-3 text-sm leading-6 text-gray-400">
            {terms.map((term) => (
              <p key={term}>{term}</p>
            ))}
          </div>

          <label className="mt-4 flex items-start gap-3 rounded-2xl border border-white/10 bg-gray-900/50 px-4 py-4">
            <input
              type="checkbox"
              checked={form.termsAccepted}
              onChange={(event) => updateForm('termsAccepted', event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-900 text-sky-500 focus:ring-sky-500"
            />
            <span className="text-sm leading-6 text-white">
              I have read and accept the rental terms and conditions.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-gray-700"
        >
          {saving ? 'Submitting rental request...' : 'Submit rental request'}
        </button>
      </form>

      <aside className="space-y-6">
        <div className="overflow-hidden rounded-[28px] border border-white/5 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/95 shadow-xl shadow-black/20">
          <div className="relative h-56 overflow-hidden bg-gray-800">
            {vehicle.image_url ? (
              <img src={vehicle.image_url} alt={vehicle.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_60%),linear-gradient(135deg,rgba(15,23,42,1),rgba(17,24,39,0.92))]">
                <CarFront className="h-16 w-16 text-sky-200/85" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="mb-1 text-xs uppercase tracking-[0.16em] text-sky-200">{vehicle.brand}</p>
              <h3 className="text-2xl font-bold text-white">{vehicle.name}</h3>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <p className="text-sm leading-6 text-gray-400">
              {vehicle.description || 'Flexible campus-ready rental vehicle with manual booking approval.'}
            </p>

            <div className="flex flex-wrap gap-2">
              {rentalConfidencePoints.map((point) => (
                <span
                  key={point}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-200"
                >
                  {point}
                </span>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4">
                <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Rate</p>
                <p className="font-semibold text-white">{formatInr(vehicle.price_per_hour)}/hour</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4">
                <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Security</p>
                <p className="font-semibold text-white">{formatInr(vehicle.deposit_amount)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/5 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/95 p-5 shadow-xl shadow-black/20">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-white">Live booking summary</h3>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-300">
              Updates instantly
            </span>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <CarFront className="mt-0.5 h-4 w-4 text-sky-200" />
              <div>
                <p className="text-gray-500">Car selected</p>
                <p className="font-semibold text-white">{vehicle.name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-4 w-4 text-sky-200" />
              <div>
                <p className="text-gray-500">Renter name</p>
                <p className="font-semibold text-white">{form.customerName || 'Not added yet'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 text-sky-200" />
              <div>
                <p className="text-gray-500">Phone number</p>
                <p className="font-semibold text-white">{form.customerPhone || 'Not added yet'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 h-4 w-4 text-sky-200" />
              <div>
                <p className="text-gray-500">Rental hours</p>
                <p className="font-semibold text-white">{form.rentalHours || '--'} hour(s)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CalendarClock className="mt-0.5 h-4 w-4 text-sky-200" />
              <div>
                <p className="text-gray-500">Rental window</p>
                <p className="font-semibold text-white">
                  {form.startDateTime ? formatDateTimeDisplay(form.startDateTime) : 'Start time pending'}
                </p>
                <p className="font-semibold text-white">
                  {form.endDateTime ? formatDateTimeDisplay(form.endDateTime) : 'End time pending'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-sky-200" />
              <div>
                <p className="text-gray-500">Pickup mood</p>
                <p className="font-semibold text-white">{rentalPickupMoodLabels[form.pickupMood]}</p>
                <p className="text-sm text-gray-400">{selectedPickupMood.description}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 text-sky-200" />
              <div>
                <p className="text-gray-500">Contact preference</p>
                <p className="font-semibold text-white">
                  {rentalContactPreferenceLabels[form.contactPreference]}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-sky-200" />
              <div>
                <p className="text-gray-500">Campus spot</p>
                <p className="font-semibold text-white">
                  {form.pickupSpot ? rentalCampusSpotLabels[form.pickupSpot] : 'Not selected yet'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CalendarClock className="mt-0.5 h-4 w-4 text-sky-200" />
              <div>
                <p className="text-gray-500">Trip intent</p>
                <p className="font-semibold text-white">
                  {form.tripIntent ? rentalTripIntentLabels[form.tripIntent] : 'Not selected yet'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-sky-200" />
              <div>
                <p className="text-gray-500">Estimated total</p>
                <p className="font-semibold text-white">{totalAmount > 0 ? formatInr(totalAmount) : '--'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-sky-200" />
              <div>
                <p className="text-gray-500">Terms acceptance</p>
                <p className="font-semibold text-white">{form.termsAccepted ? 'Accepted' : 'Pending'}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
