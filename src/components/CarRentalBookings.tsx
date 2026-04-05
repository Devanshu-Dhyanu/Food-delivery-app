import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarClock, CarFront, Clock3, MapPin, ReceiptText } from 'lucide-react';
import {
  cleanRentalNotes,
  formatDateTimeDisplay,
  formatInr,
  getRentalPickupMood,
  isCarRentalSchemaMissing,
  rentalPickupMoodLabels,
  rentalStatusClasses,
  rentalStatusLabels,
} from '../lib/carRental';
import { supabase, type RentalBooking, type RentalVehicle } from '../lib/supabase';

interface CarRentalBookingsProps {
  userId: string;
  onBack: () => void;
}

type RentalBookingWithVehicle = RentalBooking & {
  rental_vehicles: Pick<RentalVehicle, 'id' | 'name' | 'brand' | 'image_url' | 'pickup_location'> | null;
};

export default function CarRentalBookings({ userId, onBack }: CarRentalBookingsProps) {
  const [bookings, setBookings] = useState<RentalBookingWithVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaReady, setSchemaReady] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchBookings = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const { data, error } = await supabase
          .from('rental_bookings')
          .select(
            `
              *,
              rental_vehicles (
                id,
                name,
                brand,
                image_url,
                pickup_location
              )
            `
          )
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (!isMounted) {
          return;
        }

        setSchemaReady(true);
        setBookings((data as RentalBookingWithVehicle[]) ?? []);
      } catch (error) {
        console.error('Error fetching rental bookings:', error);

        if (!isMounted) {
          return;
        }

        setBookings([]);

        if (isCarRentalSchemaMissing(error)) {
          setSchemaReady(false);
          setErrorMessage(
            'Car rental bookings are not live yet. Run the SQL file in Supabase, then refresh this screen.'
          );
        } else {
          setSchemaReady(true);
          setErrorMessage('We could not load your rental bookings right now. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchBookings();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const activeBookingCount = useMemo(
    () => bookings.filter((booking) => booking.status === 'pending' || booking.status === 'approved' || booking.status === 'active').length,
    [bookings]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="shimmer-shell overflow-hidden rounded-[28px] border border-gray-800 bg-gray-900/80 p-6">
          <div className="mb-4 shimmer-block h-6 w-40 rounded-full" />
          <div className="mb-3 shimmer-block h-10 w-3/4 rounded-full" />
          <div className="shimmer-block h-4 w-full rounded-full" />
        </div>

        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="shimmer-shell overflow-hidden rounded-[28px] border border-gray-800 bg-gray-900/80 p-6"
          >
            <div className="mb-4 shimmer-block h-8 w-48 rounded-full" />
            <div className="grid gap-4 md:grid-cols-3">
              <div className="shimmer-block h-16 rounded-2xl" />
              <div className="shimmer-block h-16 rounded-2xl" />
              <div className="shimmer-block h-16 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[28px] border border-white/5 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/95 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-5 px-5 py-6 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <button
              type="button"
              onClick={onBack}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to cars</span>
            </button>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
              My Rentals
            </p>
            <h2 className="mb-3 text-3xl font-bold text-white">Track every car request from one place</h2>
            <p className="max-w-3xl text-sm leading-7 text-gray-400">
              Users can review pending, approved, active, completed, and cancelled rental bookings
              here without touching the restaurant order flow.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/5 bg-white/5 px-5 py-4">
              <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Total bookings</p>
              <p className="text-lg font-semibold text-white">{bookings.length}</p>
            </div>
            <div className="rounded-[24px] border border-white/5 bg-white/5 px-5 py-4">
              <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Active pipeline</p>
              <p className="text-lg font-semibold text-white">{activeBookingCount}</p>
            </div>
          </div>
        </div>
      </div>

      {!schemaReady && (
        <div className="rounded-[28px] border border-amber-500/25 bg-amber-500/10 px-5 py-5 text-sm text-amber-100 shadow-xl shadow-black/20">
          {errorMessage}
        </div>
      )}

      {schemaReady && errorMessage && (
        <div className="rounded-[28px] border border-red-500/25 bg-red-500/10 px-5 py-5 text-sm text-red-100 shadow-xl shadow-black/20">
          {errorMessage}
        </div>
      )}

      {schemaReady && bookings.length === 0 && !errorMessage && (
        <div className="rounded-[28px] border border-white/5 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/95 px-6 py-10 text-center shadow-xl shadow-black/20">
          <ReceiptText className="mx-auto mb-4 h-12 w-12 text-gray-500" />
          <h3 className="mb-2 text-2xl font-bold text-white">No rental bookings yet</h3>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-gray-400">
            Once a user submits a car rental request, it will show here with status, timing, and
            handoff details.
          </p>
        </div>
      )}

      {schemaReady && bookings.length > 0 && (
        <div className="space-y-5">
          {bookings.map((booking, index) => {
            const pickupMood = getRentalPickupMood(booking.handoff_type, booking.notes);
            const cleanedNotes = cleanRentalNotes(booking.notes);

            return (
              <article
                key={booking.id}
                className="reveal-card overflow-hidden rounded-[28px] border border-white/5 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/95 shadow-xl shadow-black/20"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex flex-col gap-5 px-5 py-5 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-sky-500/20 bg-sky-500/10 text-sky-200">
                      {booking.rental_vehicles?.image_url ? (
                        <img
                          src={booking.rental_vehicles.image_url}
                          alt={booking.rental_vehicles.name}
                          className="h-full w-full rounded-[20px] object-cover"
                        />
                      ) : (
                        <CarFront className="h-7 w-7" />
                      )}
                    </div>

                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-bold text-white">
                          {booking.rental_vehicles?.name || 'Rental vehicle'}
                        </h3>
                        <span
                          className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${rentalStatusClasses[booking.status]}`}
                        >
                          {rentalStatusLabels[booking.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {booking.rental_vehicles?.brand || 'Car booking'} for {booking.customer_name}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/5 bg-white/5 px-4 py-4">
                    <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Total billed</p>
                    <p className="text-lg font-semibold text-white">{formatInr(booking.total_amount)}</p>
                  </div>
                </div>

                <div className="grid gap-4 border-t border-white/5 px-5 py-5 sm:px-6 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[24px] border border-white/5 bg-white/5 px-4 py-4">
                    <div className="mb-2 flex items-center gap-2 text-gray-400">
                      <CalendarClock className="h-4 w-4 text-sky-200" />
                      <span className="text-sm">Rental window</span>
                    </div>
                    <p className="font-semibold text-white">{formatDateTimeDisplay(booking.start_datetime)}</p>
                    <p className="font-semibold text-white">{formatDateTimeDisplay(booking.end_datetime)}</p>
                  </div>

                  <div className="rounded-[24px] border border-white/5 bg-white/5 px-4 py-4">
                    <div className="mb-2 flex items-center gap-2 text-gray-400">
                      <Clock3 className="h-4 w-4 text-sky-200" />
                      <span className="text-sm">Booked hours</span>
                    </div>
                    <p className="font-semibold text-white">{booking.rental_hours} hour(s)</p>
                    <p className="text-sm text-gray-400">Created {formatDateTimeDisplay(booking.created_at)}</p>
                  </div>

                  <div className="rounded-[24px] border border-white/5 bg-white/5 px-4 py-4">
                    <div className="mb-2 flex items-center gap-2 text-gray-400">
                      <MapPin className="h-4 w-4 text-sky-200" />
                      <span className="text-sm">Pickup mood</span>
                    </div>
                    <p className="font-semibold text-white">{rentalPickupMoodLabels[pickupMood]}</p>
                    <p className="text-sm text-gray-400">
                      {booking.rental_vehicles?.pickup_location || 'Campus rental desk'}
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-white/5 bg-white/5 px-4 py-4">
                    <div className="mb-2 flex items-center gap-2 text-gray-400">
                      <ReceiptText className="h-4 w-4 text-sky-200" />
                      <span className="text-sm">Notes</span>
                    </div>
                    <p className="font-semibold text-white">{cleanedNotes || 'No extra notes added'}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
