import { useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowUpDown,
  CarFront,
  CarTaxiFront,
  Clock,
  Search,
  Sparkles,
  Star,
  Store,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { supabase, Restaurant, Announcement } from '../lib/supabase';
import { useCart } from '../context/CartContext';

interface RestaurantListProps {
  onSelectRestaurant: (restaurantId: string) => void;
  greetingName?: string;
  featuredAnnouncement?: Announcement | null;
  announcementsLoading?: boolean;
  onAnnouncementAction?: (link?: string | null) => void;
  onOpenAnnouncements?: () => void;
  onDismissAnnouncement?: (announcementId: string) => void;
}

const announcementPriorityClasses: Record<Announcement['priority'], string> = {
  high: 'border-orange-500/30 bg-orange-500/15 text-orange-200',
  normal: 'border-blue-500/30 bg-blue-500/15 text-blue-200',
  low: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-200',
};

const parseDeliveryTimeValue = (value: string) => {
  const matches = value.match(/\d+/g);

  if (!matches || matches.length === 0) {
    return Number.MAX_SAFE_INTEGER;
  }

  const numbers = matches.map(Number);
  return numbers.reduce((sum, current) => sum + current, 0) / numbers.length;
};

const campusServices = [
  {
    id: 'restaurants',
    label: 'Restaurants',
    availability: 'Live now',
    description: 'Order campus meals and track deliveries.',
    icon: UtensilsCrossed,
  },
  {
    id: 'car-rent',
    label: 'Car Rent',
    availability: 'Coming soon',
    description: 'Book short campus rides and flexible rentals.',
    icon: CarFront,
  },
  {
    id: 'taxi',
    label: 'Taxi',
    availability: 'Coming soon',
    description: 'Quick pickups and drop requests from one place.',
    icon: CarTaxiFront,
  },
  {
    id: 'second-hand-market',
    label: 'Second-hand Market',
    availability: 'Coming soon',
    description: 'Buy and sell useful campus items with ease.',
    icon: Store,
  },
] as const;

type CampusService = (typeof campusServices)[number]['id'];

export default function RestaurantList({
  onSelectRestaurant,
  greetingName,
  featuredAnnouncement,
  announcementsLoading = false,
  onAnnouncementAction,
  onOpenAnnouncements,
  onDismissAnnouncement,
}: RestaurantListProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'delivery' | 'newest' | 'open'>('rating');
  const [selectedService, setSelectedService] = useState<CampusService>('restaurants');
  const { cartRestaurantId, cartRestaurantName } = useCart();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('rating', { ascending: false });

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const firstName = greetingName?.trim().split(/\s+/)[0] || 'there';
  const currentHour = new Date().getHours();
  const greetingLabel =
    currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';
  const moodBanner =
    currentHour >= 5 && currentHour < 11
      ? {
          eyebrow: 'Morning picks',
          title: 'Start easy with fresh breakfast runs and quick campus coffee stops.',
          summary: 'Open kitchens are serving the fastest warm meals right now.',
          accent: 'border-amber-400/20 bg-amber-500/10 text-amber-200',
        }
      : currentHour >= 11 && currentHour < 16
      ? {
          eyebrow: 'Lunch rush',
          title: 'Midday cravings are live. Find fast meals before the hostel queue gets long.',
          summary: 'Top-rated and open restaurants are surfaced first for faster decisions.',
          accent: 'border-orange-400/20 bg-orange-500/10 text-orange-200',
        }
      : currentHour >= 16 && currentHour < 22
      ? {
          eyebrow: 'Evening cravings',
          title: 'This is the best window for comfort food, snacks, and late study fuel.',
          summary: 'Explore popular dinner spots and evening-ready kitchens near you.',
          accent: 'border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-200',
        }
      : {
          eyebrow: 'Late-night mode',
          title: 'Need something after hours? Check what is still serving right now.',
          summary: 'Closed restaurants stay visible below, while active options remain up top.',
          accent: 'border-cyan-400/20 bg-cyan-500/10 text-cyan-200',
        };
  const openRestaurantsCount = restaurants.filter((restaurant) => restaurant.is_open).length;
  const selectedServiceDetails =
    campusServices.find((service) => service.id === selectedService) ?? campusServices[0];
  const visibleRestaurants = [...restaurants]
    .filter((restaurant) => {
      if (!normalizedQuery) return true;

      const searchableText = [
        restaurant.name,
        restaurant.cuisine_type,
        restaurant.description,
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'delivery':
          return parseDeliveryTimeValue(a.delivery_time) - parseDeliveryTimeValue(b.delivery_time);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'open':
          if (a.is_open !== b.is_open) {
            return a.is_open ? -1 : 1;
          }
          return b.rating - a.rating;
        case 'rating':
        default:
          return b.rating - a.rating;
      }
    });
  const openRestaurants = visibleRestaurants.filter((restaurant) => restaurant.is_open);
  const closedRestaurants = visibleRestaurants.filter((restaurant) => !restaurant.is_open);

  const renderRestaurantCard = (restaurant: Restaurant, index: number) => {
    const isLocked = !!cartRestaurantId && cartRestaurantId !== restaurant.id;
    const statusLabel = isLocked ? 'Locked' : restaurant.is_open ? 'Open Now' : 'Closed';
    const statusClasses = isLocked
      ? 'border-white/10 bg-black/45 text-white/85'
      : restaurant.is_open
      ? 'border-emerald-400/25 bg-emerald-500/20 text-emerald-100'
      : 'border-red-400/25 bg-red-500/20 text-red-100';

    return (
      <button
        key={restaurant.id}
        onClick={() => onSelectRestaurant(restaurant.id)}
        disabled={isLocked}
        className={`reveal-card group overflow-hidden rounded-[24px] border text-left transition-all duration-300 ${
          isLocked
            ? 'cursor-not-allowed border-white/5 bg-gray-900/70 opacity-80'
            : 'border-white/5 bg-gray-900 hover:-translate-y-1 hover:border-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/10'
        }`}
        style={{ animationDelay: `${index * 70}ms` }}
      >
        <div className="relative h-64 overflow-hidden bg-gray-700">
          {restaurant.image_url ? (
            <img
              src={restaurant.image_url}
              alt={restaurant.name}
              className={`h-full w-full object-cover transition duration-500 ${
                isLocked ? 'scale-100 blur-[1px] saturate-50' : 'group-hover:scale-105'
              }`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-gray-600 text-sm font-semibold tracking-wide">FOOD</span>
            </div>
          )}

          <div className={`absolute inset-0 bg-gradient-to-t ${isLocked ? 'from-black via-black/75 to-black/25' : 'from-black via-black/55 to-black/10'}`} />

          <div className="absolute left-4 top-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/95 px-3 py-2 text-sm font-semibold text-gray-900 shadow-lg shadow-black/20">
              <Star className="h-4 w-4 fill-current text-yellow-500" />
              <span>{restaurant.rating.toFixed(1)}</span>
            </div>
          </div>

          <div className="absolute right-4 top-4">
            <span className={`inline-flex items-center rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] shadow-lg shadow-black/20 ${statusClasses}`}>
              {statusLabel}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="mb-2 text-2xl font-bold text-white drop-shadow-md">{restaurant.name}</h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-white/85">
                  <span className="rounded-full bg-black/35 px-3 py-1.5 backdrop-blur-sm">{restaurant.cuisine_type}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-3 py-1.5 backdrop-blur-sm">
                    <Clock className="h-3.5 w-3.5" />
                    {restaurant.delivery_time}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5">
          <p className="mb-4 line-clamp-2 text-sm leading-6 text-gray-400">
            {restaurant.description}
          </p>

          <div className="flex items-center justify-between gap-4">
            <div className="text-xs uppercase tracking-[0.18em] text-gray-500">
              {isLocked ? 'Finish current cart first' : restaurant.is_open ? 'Ready to explore' : 'Currently unavailable'}
            </div>
            <div className={`text-sm font-semibold transition-colors ${
              isLocked ? 'text-gray-500' : 'text-orange-400 group-hover:text-orange-300'
            }`}>
              View Menu
            </div>
          </div>
        </div>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="shimmer-block h-10 w-72 rounded-full" />
        </div>

        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="shimmer-shell overflow-hidden rounded-[24px] border border-gray-800 bg-gray-900/80">
              <div className="shimmer-block h-64" />
              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="shimmer-block h-6 w-36 rounded-full" />
                  <div className="shimmer-block h-8 w-20 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="shimmer-block h-4 w-full rounded-full" />
                  <div className="shimmer-block h-4 w-4/5 rounded-full" />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="shimmer-block h-8 w-16 rounded-full" />
                  <div className="shimmer-block h-4 w-20 rounded-full" />
                  <div className="shimmer-block h-4 w-16 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 overflow-hidden rounded-[28px] border border-white/5 bg-gradient-to-br from-white/5 via-gray-900 to-gray-900 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-5 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">
              {greetingLabel}, {firstName}
            </p>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Ready for your next campus meal?
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
            <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4">
              <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Open now</p>
              <p className="text-lg font-semibold text-white">{openRestaurantsCount}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4">
              <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Visible spots</p>
              <p className="text-lg font-semibold text-white">{visibleRestaurants.length}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4">
              <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Quick note</p>
              <p className="text-sm font-semibold text-orange-300">
                {cartRestaurantName ? `Locked to ${cartRestaurantName}` : 'Fresh picks waiting'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 overflow-hidden rounded-[28px] border border-white/5 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/95 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">
                Service Switch
              </p>
              <h2 className="text-2xl font-bold text-white">Choose what you want to use on The Vajra</h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-gray-400">
              Restaurants are already live. You can also preview upcoming services here without affecting your current food ordering flow.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {campusServices.map((service) => {
              const Icon = service.icon;
              const isSelected = selectedService === service.id;
              const isLive = service.availability === 'Live now';

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setSelectedService(service.id)}
                  className={`rounded-[24px] border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-orange-500/35 bg-orange-500/12 shadow-lg shadow-orange-500/10'
                      : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${
                        isSelected
                          ? 'border-orange-400/30 bg-orange-500/15 text-orange-200'
                          : 'border-white/10 bg-white/5 text-gray-300'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                        isLive
                          ? 'border-emerald-400/25 bg-emerald-500/15 text-emerald-200'
                          : 'border-blue-400/20 bg-blue-500/10 text-blue-200'
                      }`}
                    >
                      {service.availability}
                    </span>
                  </div>

                  <h3 className="mb-2 text-lg font-semibold text-white">{service.label}</h3>
                  <p className="text-sm leading-6 text-gray-400">{service.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selectedService !== 'restaurants' && (
        <div className="overflow-hidden rounded-[28px] border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-gray-900 to-gray-900 shadow-xl shadow-black/20">
          <div className="px-5 py-6 sm:px-6">
            <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
                  {selectedServiceDetails.availability}
                </p>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">{selectedServiceDetails.label}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedService('restaurants')}
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Back to Restaurants
              </button>
            </div>

            <p className="max-w-3xl text-sm leading-7 text-gray-300 sm:text-base">
              {selectedServiceDetails.label} is being prepared for The Vajra. You can keep this option visible for users right now while restaurants continue running live below whenever you switch back.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4">
                <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Current state</p>
                <p className="text-sm font-semibold text-white">{selectedServiceDetails.availability}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4">
                <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Visible to users</p>
                <p className="text-sm font-semibold text-white">Yes, as a selectable service</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4">
                <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Live right now</p>
                <p className="text-sm font-semibold text-orange-300">Restaurants</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedService === 'restaurants' && (
        <>

      <div className="mb-6 overflow-hidden rounded-[28px] border border-white/5 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/95 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className={`mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${moodBanner.accent}`}>
              <Clock className="h-4 w-4" />
              {moodBanner.eyebrow}
            </p>
            <h2 className="mb-2 text-xl font-bold text-white sm:text-2xl">{moodBanner.title}</h2>
            <p className="text-sm leading-6 text-gray-400">{moodBanner.summary}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
            <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4">
              <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Open section</p>
              <p className="text-lg font-semibold text-white">{openRestaurants.length} restaurants</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4">
              <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Closed section</p>
              <p className="text-lg font-semibold text-white">{closedRestaurants.length} restaurants</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">Restaurants Near You</h1>
          <p className="text-sm text-gray-400">
            {visibleRestaurants.length} result{visibleRestaurants.length === 1 ? '' : 's'} showing
            {normalizedQuery ? ` for "${searchQuery.trim()}"` : ''}.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr),220px] lg:w-[560px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by restaurant or cuisine"
              className="w-full rounded-full border border-white/10 bg-gray-900/90 py-3 pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-orange-500/40 focus:bg-gray-900"
            />
          </label>

          <label className="relative block">
            <ArrowUpDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rating' | 'delivery' | 'newest' | 'open')}
              className="w-full appearance-none rounded-full border border-white/10 bg-gray-900/90 py-3 pl-11 pr-4 text-sm text-white outline-none transition-colors focus:border-orange-500/40 focus:bg-gray-900"
            >
              <option value="rating">Sort: Rating</option>
              <option value="delivery">Sort: Delivery Time</option>
              <option value="newest">Sort: Newest</option>
              <option value="open">Sort: Open First</option>
            </select>
          </label>
        </div>
      </div>

      {announcementsLoading && (
        <div className="shimmer-shell mb-6 overflow-hidden rounded-[28px] border border-gray-800 bg-gray-900/80 p-5">
          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="shimmer-block h-32 w-full rounded-2xl lg:w-52" />
            <div className="flex-1 space-y-3">
              <div className="shimmer-block h-6 w-28 rounded-full" />
              <div className="shimmer-block h-8 w-3/4 rounded-full" />
              <div className="shimmer-block h-4 w-full rounded-full" />
              <div className="shimmer-block h-4 w-5/6 rounded-full" />
              <div className="shimmer-block h-10 w-44 rounded-full" />
            </div>
          </div>
        </div>
      )}

      {featuredAnnouncement && (
        <div className="relative mb-6 overflow-hidden rounded-[28px] border border-white/5 bg-gradient-to-br from-orange-500/12 via-gray-900 to-gray-900 shadow-xl shadow-black/20">
          {featuredAnnouncement.image_url && (
            <div className="absolute inset-y-0 right-0 hidden w-72 overflow-hidden lg:block">
              <img
                src={featuredAnnouncement.image_url}
                alt={featuredAnnouncement.title}
                className="h-full w-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black via-black/30 to-transparent" />
            </div>
          )}

          <div className="relative p-5 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${announcementPriorityClasses[featuredAnnouncement.priority]}`}>
                <Sparkles className="h-4 w-4" />
                {featuredAnnouncement.priority} priority offer
              </div>
              {onDismissAnnouncement && (
                <button
                  onClick={() => onDismissAnnouncement(featuredAnnouncement.id)}
                  className="rounded-full border border-white/10 bg-white/5 p-2 text-gray-400 transition-colors hover:text-white"
                  aria-label="Dismiss announcement"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="max-w-2xl">
              <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">{featuredAnnouncement.title}</h2>
              <p className="mb-5 text-sm leading-6 text-gray-300 sm:text-base">{featuredAnnouncement.message}</p>

              <div className="flex flex-wrap items-center gap-3">
                {(featuredAnnouncement.cta_text || featuredAnnouncement.cta_link) && onAnnouncementAction && (
                  <button
                    onClick={() => onAnnouncementAction(featuredAnnouncement.cta_link)}
                    className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                  >
                    <span>{featuredAnnouncement.cta_text || 'Open offer'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                {onOpenAnnouncements && (
                  <button
                    onClick={onOpenAnnouncements}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    View all announcements
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {cartRestaurantId && cartRestaurantName && (
        <div className="mb-6 rounded-xl border border-orange-500/40 bg-orange-500/10 px-4 py-3 text-sm text-orange-100">
          Your cart is locked to <span className="font-semibold text-white">{cartRestaurantName}</span>. Remove those
          items before ordering from another restaurant.
        </div>
      )}

      {visibleRestaurants.length === 0 ? (
        <div className="text-center py-12">
          <p className="mb-2 text-lg font-semibold text-white">No matching restaurants found</p>
          <p className="text-gray-400">
            Try a different restaurant name, cuisine, or switch the sort option.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {openRestaurants.length > 0 && (
            <section>
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Open right now</h2>
                  <p className="text-sm text-gray-400">Fastest way to order from currently serving restaurants.</p>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  {openRestaurants.length} open
                </p>
              </div>
              <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
                {openRestaurants.map((restaurant, index) => renderRestaurantCard(restaurant, index))}
              </div>
            </section>
          )}

          {closedRestaurants.length > 0 && (
            <section>
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Closed for now</h2>
                  <p className="text-sm text-gray-400">Still visible so you can browse favorites and check back later.</p>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  {closedRestaurants.length} closed
                </p>
              </div>
              <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
                {closedRestaurants.map((restaurant, index) =>
                  renderRestaurantCard(restaurant, openRestaurants.length + index)
                )}
              </div>
            </section>
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
}
