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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">Loading restaurants...</div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => {
            const isLocked = !!cartRestaurantId && cartRestaurantId !== restaurant.id;

            return (
              <button
                key={restaurant.id}
                onClick={() => onSelectRestaurant(restaurant.id)}
                disabled={isLocked}
                className={`rounded-xl overflow-hidden text-left transition-all ${
                  isLocked
                    ? 'cursor-not-allowed bg-gray-800/60 opacity-60'
                    : 'bg-gray-800 hover:ring-2 hover:ring-orange-500 transform hover:scale-[1.02]'
                }`}
              >
                <div className="h-48 bg-gray-700 overflow-hidden">
                  {restaurant.image_url ? (
                    <img
                      src={restaurant.image_url}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-semibold tracking-wide">FOOD</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{restaurant.name}</h3>
                    <div className="flex items-center gap-2">
                      {isLocked && (
                        <span className="text-xs bg-gray-700 text-gray-200 px-2 py-1 rounded">
                          Locked
                        </span>
                      )}
                      {!restaurant.is_open && (
                        <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                          Closed
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                    {restaurant.description}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-white font-medium">{restaurant.rating}</span>
                    </div>

                    <div className="flex items-center space-x-1 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{restaurant.delivery_time}</span>
                    </div>

                    <span className="text-gray-400">{restaurant.cuisine_type}</span>
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
