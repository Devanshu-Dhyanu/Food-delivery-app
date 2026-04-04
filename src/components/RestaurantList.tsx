import { useEffect, useState } from 'react';
import { Star, Clock } from 'lucide-react';
import { supabase, Restaurant } from '../lib/supabase';
import { useCart } from '../context/CartContext';

interface RestaurantListProps {
  onSelectRestaurant: (restaurantId: string) => void;
}

export default function RestaurantList({ onSelectRestaurant }: RestaurantListProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
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
      <h1 className="text-3xl font-bold text-white mb-8">Restaurants Near You</h1>

      {cartRestaurantId && cartRestaurantName && (
        <div className="mb-6 rounded-xl border border-orange-500/40 bg-orange-500/10 px-4 py-3 text-sm text-orange-100">
          Your cart is locked to <span className="font-semibold text-white">{cartRestaurantName}</span>. Remove those
          items before ordering from another restaurant.
        </div>
      )}

      {restaurants.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No restaurants available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => {
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
