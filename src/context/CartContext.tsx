import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CartItem, MenuItem } from '../lib/supabase';

interface CartContextType {
  cart: CartItem[];
  cartRestaurantId: string | null;
  cartRestaurantName: string | null;
  addToCart: (item: MenuItem, restaurantName: string) => void;
  canAddFromRestaurant: (restaurantId: string) => boolean;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = 'vajra-cart-v1';

const isCartItem = (value: unknown): value is CartItem => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Partial<CartItem>;

  return (
    typeof item.id === 'string' &&
    typeof item.restaurant_id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.description === 'string' &&
    typeof item.price === 'number' &&
    typeof item.image_url === 'string' &&
    typeof item.category === 'string' &&
    typeof item.is_vegetarian === 'boolean' &&
    typeof item.is_available === 'boolean' &&
    typeof item.created_at === 'string' &&
    typeof item.quantity === 'number' &&
    typeof item.restaurant_name === 'string'
  );
};

const loadStoredCart = (): CartItem[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!storedValue) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(storedValue);
    return Array.isArray(parsedValue) && parsedValue.every(isCartItem) ? parsedValue : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => loadStoredCart());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (cart.length === 0) {
      window.localStorage.removeItem(CART_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const cartRestaurantId = cart[0]?.restaurant_id ?? null;
  const cartRestaurantName = cart[0]?.restaurant_name ?? null;

  const canAddFromRestaurant = (restaurantId: string) => {
    return cart.length === 0 || cartRestaurantId === restaurantId;
  };

  const addToCart = (item: MenuItem, restaurantName: string) => {
    setCart((prev) => {
      if (prev.length > 0 && prev[0].restaurant_id !== item.restaurant_id) {
        return prev;
      }

      const existingItem = prev.find((i) => i.id === item.id);
      if (existingItem) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1, restaurant_name: restaurantName }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartRestaurantId,
        cartRestaurantName,
        addToCart,
        canAddFromRestaurant,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalAmount,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
