import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Plus, Star, Clock, Leaf } from 'lucide-react';
import { supabase, Restaurant, MenuItem } from '../lib/supabase';
import { useCart } from '../context/CartContext';

interface RestaurantMenuProps {
  restaurantId: string;
  onBack: () => void;
}

export default function RestaurantMenu({ restaurantId, onBack }: RestaurantMenuProps) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, canAddFromRestaurant, cartRestaurantId, cartRestaurantName } = useCart();
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState('');
  const categorySectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    fetchRestaurantAndMenu();
  }, [restaurantId]);

  const fetchRestaurantAndMenu = async () => {
    try {
      const [restaurantRes, menuRes] = await Promise.all([
        supabase.from('restaurants').select('*').eq('id', restaurantId).maybeSingle(),
        supabase.from('menu_items').select('*').eq('restaurant_id', restaurantId).order('category'),
      ]);

      if (restaurantRes.error) throw restaurantRes.error;
      if (menuRes.error) throw menuRes.error;

      setRestaurant(restaurantRes.data);
      setMenuItems(menuRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    if (!restaurant || !restaurant.is_open || !canAddFromRestaurant(restaurant.id)) {
      return;
    }

    addToCart(item, restaurant.name);
    setAddedItems((prev) => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }, 1000);
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);
  const categories = Object.keys(groupedItems);
  const categoryKey = categories.join('||');

  useEffect(() => {
    if (categories.length === 0) {
      setActiveCategory('');
      return;
    }

    setActiveCategory((current) => (current && categories.includes(current) ? current : categories[0]));
  }, [categoryKey]);

  useEffect(() => {
    if (categories.length === 0) {
      return;
    }

    const updateActiveCategory = () => {
      const visibleSections = categories
        .map((category) => {
          const section = categorySectionRefs.current[category];

          if (!section) {
            return null;
          }

          return {
            category,
            top: section.getBoundingClientRect().top,
          };
        })
        .filter((section): section is { category: string; top: number } => section !== null);

      if (visibleSections.length === 0) {
        return;
      }

      const anchorLine = 180;
      const reachedSections = visibleSections.filter((section) => section.top <= anchorLine);
      const nextActiveCategory =
        reachedSections.length > 0
          ? reachedSections[reachedSections.length - 1].category
          : visibleSections[0].category;

      setActiveCategory((current) => (current === nextActiveCategory ? current : nextActiveCategory));
    };

    updateActiveCategory();
    window.addEventListener('scroll', updateActiveCategory, { passive: true });
    window.addEventListener('resize', updateActiveCategory);

    return () => {
      window.removeEventListener('scroll', updateActiveCategory);
      window.removeEventListener('resize', updateActiveCategory);
    };
  }, [categoryKey]);

  const handleCategoryJump = (category: string) => {
    setActiveCategory(category);
    categorySectionRefs.current[category]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="shimmer-block mb-6 h-6 w-40 rounded-full" />

        <div className="shimmer-shell mb-8 overflow-hidden rounded-xl border border-gray-800 bg-gray-900/80">
          <div className="shimmer-block h-64" />
          <div className="space-y-4 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="shimmer-block h-10 w-52 rounded-full" />
              <div className="shimmer-block h-7 w-28 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="shimmer-block h-4 w-full rounded-full" />
              <div className="shimmer-block h-4 w-3/4 rounded-full" />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="shimmer-block h-5 w-16 rounded-full" />
              <div className="shimmer-block h-5 w-24 rounded-full" />
              <div className="shimmer-block h-5 w-20 rounded-full" />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {Array.from({ length: 2 }).map((_, sectionIndex) => (
            <div key={sectionIndex}>
              <div className="shimmer-block mb-4 h-8 w-40 rounded-full" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((__, cardIndex) => (
                  <div key={cardIndex} className="shimmer-shell rounded-lg border border-gray-800 bg-gray-900/80 p-4">
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="shimmer-block h-6 w-36 rounded-full" />
                        <div className="space-y-2">
                          <div className="shimmer-block h-4 w-full rounded-full" />
                          <div className="shimmer-block h-4 w-4/5 rounded-full" />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="shimmer-block h-6 w-20 rounded-full" />
                          <div className="shimmer-block h-10 w-24 rounded-lg" />
                        </div>
                      </div>
                      <div className="shimmer-block h-24 w-24 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">Restaurant not found</div>
      </div>
    );
  }

  const isLockedToAnotherRestaurant = !!cartRestaurantId && cartRestaurantId !== restaurant.id;
  const isRestaurantClosed = !restaurant.is_open;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Restaurants</span>
      </button>

      <div className="bg-gray-800 rounded-xl overflow-hidden mb-8">
        <div className="h-64 bg-gray-700 overflow-hidden">
          {restaurant.image_url ? (
            <img
              src={restaurant.image_url}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-600 text-lg font-semibold tracking-[0.2em]">FOOD</span>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-3xl font-bold text-white">{restaurant.name}</h1>
            {!restaurant.is_open && (
              <span className="bg-red-600 text-white px-3 py-1 rounded text-sm">
                Currently Closed
              </span>
            )}
          </div>

          <p className="text-gray-400 mb-4">{restaurant.description}</p>

          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-1">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="text-white font-medium">{restaurant.rating}</span>
            </div>

            <div className="flex items-center space-x-1 text-gray-400">
              <Clock className="w-5 h-5" />
              <span>{restaurant.delivery_time}</span>
            </div>

            <span className="text-gray-400">{restaurant.cuisine_type}</span>
          </div>
        </div>
      </div>

      {isLockedToAnotherRestaurant && cartRestaurantName && (
        <div className="mb-8 rounded-xl border border-orange-500/40 bg-orange-500/10 px-4 py-3 text-sm text-orange-100">
          Your cart already has items from <span className="font-semibold text-white">{cartRestaurantName}</span>.
          Remove them first to order from {restaurant.name}.
        </div>
      )}

      {Object.keys(groupedItems).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No menu items available</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="sticky top-[76px] z-30 -mx-1 overflow-hidden rounded-[24px] border border-white/5 bg-gray-900/92 px-3 py-3 shadow-xl shadow-black/20 backdrop-blur">
            <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((category) => {
                const isActive = activeCategory === category;
                const itemCount = groupedItems[category]?.length ?? 0;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryJump(category)}
                    className={`flex-shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? 'border-orange-500/35 bg-orange-500/15 text-orange-200 shadow-lg shadow-orange-500/10'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{category}</span>
                    <span className={`ml-2 text-xs ${isActive ? 'text-orange-300' : 'text-gray-500'}`}>
                      {itemCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {Object.entries(groupedItems).map(([category, items]) => (
            <div
              key={category}
              ref={(node) => {
                categorySectionRefs.current[category] = node;
              }}
              className="scroll-mt-40"
            >
              <h2 className="text-2xl font-bold text-white mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-800 rounded-lg p-4 flex space-x-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                            <span>{item.name}</span>
                            {item.is_vegetarian && (
                              <Leaf className="w-4 h-4 text-green-500" />
                            )}
                          </h3>
                        </div>
                      </div>

                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-orange-500">
                          Rs. {item.price}
                        </span>

                        <div className="relative">
                          {addedItems.has(item.id) && (
                            <div className="float-up-fade pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 rounded-full border border-green-400/30 bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-200">
                              Added to cart
                            </div>
                          )}

                          <button
                            onClick={() => handleAddToCart(item)}
                            disabled={!item.is_available || isLockedToAnotherRestaurant || isRestaurantClosed}
                            className={`relative flex items-center space-x-2 overflow-hidden rounded-xl px-4 py-2 font-medium transition-all ${
                              !item.is_available
                                ? 'cursor-not-allowed bg-gray-700 text-gray-500'
                                : isRestaurantClosed
                                ? 'cursor-not-allowed bg-gray-700 text-gray-400'
                                : isLockedToAnotherRestaurant
                                ? 'cursor-not-allowed bg-gray-700 text-gray-400'
                                : addedItems.has(item.id)
                                ? 'soft-pop bg-green-600 text-white shadow-lg shadow-green-500/20'
                                : 'bg-orange-500 text-white hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20'
                            }`}
                          >
                            {addedItems.has(item.id) && (
                              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0" />
                            )}
                            {addedItems.has(item.id) ? (
                              <Check className="relative z-10 h-4 w-4" />
                            ) : (
                              <Plus className="relative z-10 h-4 w-4" />
                            )}
                            <span className="relative z-10">
                              {!item.is_available
                                ? 'Unavailable'
                                : isRestaurantClosed
                                ? 'Closed'
                                : isLockedToAnotherRestaurant
                                ? 'Locked'
                                : addedItems.has(item.id)
                                ? 'Added'
                                : 'Add'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {item.image_url && (
                      <div className="w-24 h-24 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
