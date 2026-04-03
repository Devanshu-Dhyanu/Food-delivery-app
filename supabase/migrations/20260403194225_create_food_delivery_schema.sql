/*
  # Create Food Delivery App Schema for vajraCognixia

  1. New Tables
    - `restaurants`
      - `id` (uuid, primary key)
      - `name` (text) - Restaurant name
      - `description` (text) - Restaurant description
      - `image_url` (text) - Restaurant image
      - `rating` (numeric) - Restaurant rating
      - `delivery_time` (text) - Estimated delivery time
      - `cuisine_type` (text) - Type of cuisine
      - `is_open` (boolean) - Whether restaurant is currently open
      - `created_at` (timestamp)
    
    - `menu_items`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key to restaurants)
      - `name` (text) - Item name
      - `description` (text) - Item description
      - `price` (numeric) - Item price
      - `image_url` (text) - Item image
      - `category` (text) - Food category (appetizer, main, dessert, etc.)
      - `is_vegetarian` (boolean) - Whether item is vegetarian
      - `is_available` (boolean) - Whether item is currently available
      - `created_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `customer_name` (text) - Customer name
      - `customer_phone` (text) - Customer phone
      - `delivery_address` (text) - Delivery address
      - `total_amount` (numeric) - Total order amount
      - `status` (text) - Order status (pending, confirmed, preparing, out_for_delivery, delivered)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key to orders)
      - `menu_item_id` (uuid, foreign key to menu_items)
      - `quantity` (integer) - Item quantity
      - `price` (numeric) - Price at time of order
      - `item_name` (text) - Item name snapshot
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (restaurants, menu_items)
    - Add policies for order creation and tracking
*/

CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  rating numeric DEFAULT 4.0,
  delivery_time text DEFAULT '30-40 min',
  cuisine_type text DEFAULT 'Multi-Cuisine',
  is_open boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric NOT NULL,
  image_url text DEFAULT '',
  category text DEFAULT 'Main Course',
  is_vegetarian boolean DEFAULT false,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  delivery_address text NOT NULL,
  total_amount numeric NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  price numeric NOT NULL,
  item_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view restaurants"
  ON restaurants FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view menu items"
  ON menu_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view orders"
  ON orders FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view order items"
  ON order_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);