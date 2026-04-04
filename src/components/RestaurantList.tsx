import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpDown, Clock, Search, Sparkles, Star, X } from 'lucide-react';
import { supabase, Restaurant, Announcement } from '../lib/supabase';
import { useCart } from '../context/CartContext';

interface RestaurantListProps {
  onSelectRestaurant: (restaurantId: string) => void;
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

export default function RestaurantList({
  onSelectRestaurant,
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="mb-8">
          <div className="h-10 w-72 rounded-full bg-gray-800" />
        </div>

        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-[24px] border border-gray-800 bg-gray-900/80">
              <div className="h-64 bg-gray-800" />
              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="h-6 w-36 rounded-full bg-gray-800" />
                  <div className="h-8 w-20 rounded-full bg-gray-800" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full rounded-full bg-gray-800" />
                  <div className="h-4 w-4/5 rounded-full bg-gray-800" />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="h-8 w-16 rounded-full bg-gray-800" />
                  <div className="h-4 w-20 rounded-full bg-gray-800" />
                  <div className="h-4 w-16 rounded-full bg-gray-800" />
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
        <div className="mb-6 overflow-hidden rounded-[28px] border border-gray-800 bg-gray-900/80 p-5 animate-pulse">
          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="h-32 w-full rounded-2xl bg-gray-800 lg:w-52" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-28 rounded-full bg-gray-800" />
              <div className="h-8 w-3/4 rounded-full bg-gray-800" />
              <div className="h-4 w-full rounded-full bg-gray-800" />
              <div className="h-4 w-5/6 rounded-full bg-gray-800" />
              <div className="h-10 w-44 rounded-full bg-gray-800" />
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
        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
          {visibleRestaurants.map((restaurant) => {
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
                className={`group overflow-hidden rounded-[24px] border text-left transition-all duration-300 ${
                  isLocked
                    ? 'cursor-not-allowed border-white/5 bg-gray-900/70 opacity-80'
                    : 'border-white/5 bg-gray-900 hover:-translate-y-1 hover:border-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/10'
                }`}
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
          })}
        </div>
      )}
    </div>
  );
}
