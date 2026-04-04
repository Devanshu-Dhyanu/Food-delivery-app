import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Restaurant = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  rating: number;
  delivery_time: string;
  cuisine_type: string;
  is_open: boolean;
  created_at: string;
};

export type MenuItem = {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_vegetarian: boolean;
  is_available: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string | null;
  restaurant_id: string | null;
  restaurant_name: string | null;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  subtotal_amount: number | null;
  delivery_fee: number | null;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  price: number;
  item_name: string;
  created_at: string;
};

export type DeliveryFeedback = {
  id: string;
  order_id: string;
  user_id: string;
  rating: number | null;
  feedback_text: string | null;
  skipped_at: string | null;
  created_at: string;
};

export type CartItem = MenuItem & {
  quantity: number;
  restaurant_name: string;
};

export type UserProfile = {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  gender: string;
  location_type: string;
  hostel_name: string | null;
  block: string | null;
  room_number: string | null;
  building_number: string | null;
  exact_location: string | null;
  uid: string;
  created_at: string;
  updated_at: string;
};
