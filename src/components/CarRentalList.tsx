import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CarFront,
  Fuel,
  Gauge,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {
  formatInr,
  getRentalAvailabilityTone,
  getRentalSuitabilityTags,
  isCarRentalSchemaMissing,
  rentalConfidencePoints,
} from '../lib/carRental';
import { supabase, type RentalVehicle } from '../lib/supabase';

interface CarRentalListProps {
  onSelectVehicle: (vehicle: RentalVehicle) => void;
  onOpenBookings: () => void;
}

export default function CarRentalList({ onSelectVehicle, onOpenBookings }: CarRentalListProps) {
  const [vehicles, setVehicles] = useState<RentalVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaReady, setSchemaReady] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchVehicles = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const { data, error } = await supabase
          .from('rental_vehicles')
          .select('*')
          .order('is_available', { ascending: false })
          .order('price_per_hour', { ascending: true });

        if (error) {
          throw error;
        }

        if (!isMounted) {
          return;
        }

        setSchemaReady(true);
        setVehicles((data as RentalVehicle[]) ?? []);
      } catch (error) {
        console.error('Error fetching rental vehicles:', error);

        if (!isMounted) {
          return;
        }

        setVehicles([]);

        if (isCarRentalSchemaMissing(error)) {
          setSchemaReady(false);
          setErrorMessage(
            'Check your internet connection, or refresh this screen.'
          );
        } else {
          setSchemaReady(true);
          setErrorMessage('We could not load rental cars right now. Please try again in a moment.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchVehicles();

    return () => {
      isMounted = false;
    };
  }, []);

  const lowestAvailablePrice = useMemo(() => {
    const availableVehicles = vehicles.filter((vehicle) => vehicle.is_available);

    if (availableVehicles.length === 0) {
      return Number.POSITIVE_INFINITY;
    }

    return Math.min(...availableVehicles.map((vehicle) => vehicle.price_per_hour));
  }, [vehicles]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="shimmer-shell overflow-hidden rounded-[28px] border border-gray-800 bg-gray-900/80 p-6">
          <div className="mb-4 shimmer-block h-6 w-48 rounded-full" />
          <div className="mb-3 shimmer-block h-10 w-3/4 rounded-full" />
          <div className="shimmer-block h-4 w-full rounded-full" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="shimmer-shell overflow-hidden rounded-[28px] border border-gray-800 bg-gray-900/80"
            >
              <div className="shimmer-block h-56" />
              <div className="space-y-4 p-5">
                <div className="shimmer-block h-6 w-48 rounded-full" />
                <div className="shimmer-block h-4 w-full rounded-full" />
                <div className="shimmer-block h-4 w-5/6 rounded-full" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="shimmer-block h-14 rounded-2xl" />
                  <div className="shimmer-block h-14 rounded-2xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[28px] border border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-gray-900 to-gray-900 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-5 px-5 py-6 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
              Car Rentals
            </p>
            <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
              Pick a car, choose your hours, and book it from the same app.
            </h2>
            <p className="text-sm leading-7 text-gray-300 sm:text-base">
                You can select a car, add rental hours, choose start and end time, decide
              whether the car should be delivered or picked up, and accept the terms and conditions before booking.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {rentalConfidencePoints.map((point) => (
                <span
                  key={point}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-100"
                >
                  {point}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onOpenBookings}
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              My Rentals
            </button>
            <div className="rounded-full border border-sky-400/20 bg-sky-500/10 px-5 py-3 text-sm font-semibold text-sky-100">
              {vehicles.length} car{vehicles.length === 1 ? '' : 's'} ready to show
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-white/5 bg-white/5 px-5 py-4">
          <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Booking model</p>
          <p className="text-sm font-semibold text-white">Hourly rental with instant request form</p>
        </div>
        <div className="rounded-[24px] border border-white/5 bg-white/5 px-5 py-4">
          <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Pickup option</p>
          <p className="text-sm font-semibold text-white">Delivery or self pickup on each booking</p>
        </div>
        <div className="rounded-[24px] border border-white/5 bg-white/5 px-5 py-4">
          <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Terms step</p>
          <p className="text-sm font-semibold text-white">Booking stays blocked until terms are accepted</p>
        </div>
      </div>

      {!schemaReady && (
        <div className="rounded-[28px] border border-amber-500/25 bg-amber-500/10 px-5 py-5 text-sm text-amber-100 shadow-xl shadow-black/20">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
            Setup needed
          </p>
          <p className="leading-7">{errorMessage}</p>
        </div>
      )}

      {schemaReady && errorMessage && (
        <div className="rounded-[28px] border border-red-500/25 bg-red-500/10 px-5 py-5 text-sm text-red-100 shadow-xl shadow-black/20">
          {errorMessage}
        </div>
      )}

      {schemaReady && vehicles.length === 0 && !errorMessage && (
        <div className="rounded-[28px] border border-white/5 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/95 px-6 py-10 text-center shadow-xl shadow-black/20">
          <CarFront className="mx-auto mb-4 h-12 w-12 text-gray-500" />
          <h3 className="mb-2 text-2xl font-bold text-white">No rental cars added yet</h3>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-gray-400">
            The rental module is ready, but there are no vehicles Available right now.
          </p>
        </div>
      )}

      {schemaReady && vehicles.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((vehicle, index) => {
            const availabilityTone = getRentalAvailabilityTone(vehicle, lowestAvailablePrice);
            const suitabilityTags = getRentalSuitabilityTags(vehicle);

            return (
              <article
                key={vehicle.id}
                className="reveal-card overflow-hidden rounded-[28px] border border-white/5 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/95 shadow-xl shadow-black/20"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="relative h-56 overflow-hidden bg-gray-800">
                  {vehicle.image_url ? (
                    <img
                      src={vehicle.image_url}
                      alt={vehicle.name}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_60%),linear-gradient(135deg,rgba(15,23,42,1),rgba(17,24,39,0.92))]">
                      <CarFront className="h-16 w-16 text-sky-200/85" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />

                  <div className="absolute left-4 top-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                        vehicle.is_available
                          ? 'border-emerald-400/25 bg-emerald-500/20 text-emerald-100'
                          : 'border-red-400/25 bg-red-500/20 text-red-100'
                      }`}
                    >
                      {availabilityTone}
                    </span>
                  </div>

                  <div className="absolute right-4 top-4 rounded-full border border-black/10 bg-white/95 px-3 py-2 text-sm font-semibold text-gray-900 shadow-lg shadow-black/20">
                    {formatInr(vehicle.price_per_hour)}/hr
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="mb-1 text-xs uppercase tracking-[0.16em] text-sky-200">{vehicle.brand}</p>
                    <h3 className="text-2xl font-bold text-white">{vehicle.name}</h3>
                  </div>
                </div>

                <div className="space-y-5 p-5">
                  <p className="line-clamp-3 text-sm leading-6 text-gray-400">
                    {vehicle.description || 'Flexible campus rental vehicle with booking confirmation after review.'}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {suitabilityTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                      <div className="mb-2 flex items-center gap-2 text-gray-400">
                        <Users className="h-4 w-4" />
                        <span>Seats</span>
                      </div>
                      <p className="font-semibold text-white">{vehicle.seats}</p>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                      <div className="mb-2 flex items-center gap-2 text-gray-400">
                        <Gauge className="h-4 w-4" />
                        <span>Transmission</span>
                      </div>
                      <p className="font-semibold text-white">{vehicle.transmission}</p>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                      <div className="mb-2 flex items-center gap-2 text-gray-400">
                        <Fuel className="h-4 w-4" />
                        <span>Fuel</span>
                      </div>
                      <p className="font-semibold text-white">{vehicle.fuel_type}</p>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                      <div className="mb-2 flex items-center gap-2 text-gray-400">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Deposit</span>
                      </div>
                      <p className="font-semibold text-white">{formatInr(vehicle.deposit_amount)}</p>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-[24px] border border-white/5 bg-white/5 px-4 py-4 text-sm text-gray-300">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-sky-200" />
                      <div>
                        <p className="font-semibold text-white">Pickup point</p>
                        <p className="text-gray-400">
                          {vehicle.pickup_location || 'Main campus rental desk'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CalendarClock className="mt-0.5 h-4 w-4 text-sky-200" />
                      <div>
                        <p className="font-semibold text-white">Booking note</p>
                        <p className="text-gray-400">
                          {vehicle.availability_notes || 'Choose your hours and confirm the handoff mode.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectVehicle(vehicle)}
                    disabled={!vehicle.is_available}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-gray-700"
                  >
                    <BadgeCheck className="h-4 w-4" />
                    <span>{vehicle.is_available ? 'Book this car' : 'Currently unavailable'}</span>
                    {vehicle.is_available && <ArrowRight className="h-4 w-4" />}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
