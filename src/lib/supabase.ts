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
  delivery_partner_user_id: string | null;
  delivery_partner_name: string | null;
  delivery_partner_phone: string | null;
  delivery_assignment_status: DeliveryAssignmentStatus;
  delivery_partner_accepted_at: string | null;
  delivery_picked_up_at: string | null;
  delivered_at: string | null;
  payment_status?: string | null;
  payment_method?: string | null;
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

export type OrderIssueType =
  | 'missing_item'
  | 'wrong_order'
  | 'late_delivery'
  | 'other';

export type OrderIssueReportStatus =
  | 'open'
  | 'reviewing'
  | 'resolved'
  | 'refund_approved'
  | 'refund_rejected';

export type OrderIssueReport = {
  id: string;
  order_id: string;
  user_id: string;
  issue_type: OrderIssueType;
  description: string;
  refund_requested: boolean;
  status: OrderIssueReportStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderCancellationRequestStatus =
  | 'open'
  | 'approved'
  | 'rejected';

export type OrderCancellationRequest = {
  id: string;
  order_id: string;
  user_id: string;
  reason: string;
  status: OrderCancellationRequestStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Announcement = {
  id: string;
  title: string;
  message: string;
  image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  audience_type: 'all_users' | 'hostel' | 'segment';
  audience_value: string | null;
  priority: 'low' | 'normal' | 'high';
  delivery_channel: 'in_app' | 'push' | 'both';
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
};

export type RentalVehicle = {
  id: string;
  name: string;
  brand: string;
  description: string;
  image_url: string;
  seats: number;
  transmission: string;
  fuel_type: string;
  price_per_hour: number;
  deposit_amount: number;
  pickup_location: string | null;
  availability_notes: string | null;
  is_available: boolean;
  created_at: string;
};

export type RentalHandoffType = 'delivery_to_user' | 'self_pickup';

export type RentalBookingStatus =
  | 'pending'
  | 'approved'
  | 'active'
  | 'completed'
  | 'cancelled';

export type RentalBooking = {
  id: string;
  user_id: string;
  vehicle_id: string;
  customer_name: string;
  customer_phone: string;
  start_datetime: string;
  end_datetime: string;
  rental_hours: number;
  handoff_type: RentalHandoffType;
  terms_accepted: boolean;
  terms_accepted_at: string | null;
  notes: string | null;
  total_amount: number;
  status: RentalBookingStatus;
  created_at: string;
  updated_at: string;
};

export type MarketplaceListingCategory =
  | 'electronics'
  | 'furniture'
  | 'books'
  | 'fashion'
  | 'appliances'
  | 'cycles'
  | 'gaming'
  | 'study'
  | 'hostel-essentials'
  | 'other';

export type MarketplaceListingCondition = 'new' | 'like_new' | 'good' | 'fair';

export type MarketplaceListingStatus = 'active' | 'reserved' | 'sold' | 'archived';

export type MarketplaceListing = {
  id: string;
  user_id: string;
  seller_name: string;
  seller_phone: string;
  seller_avatar_url: string | null;
  title: string;
  description: string;
  category: MarketplaceListingCategory;
  condition: MarketplaceListingCondition;
  price: number;
  negotiable: boolean;
  location_label: string;
  pickup_details: string | null;
  image_urls: string[];
  status: MarketplaceListingStatus;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type DeliveryPartnerType = 'hosteller' | 'non_hosteller' | 'teacher';

export type DeliveryPartnerGender = 'male' | 'female' | 'other';

export type DeliveryPartnerAccountMode = 'customer' | 'delivery';

export type DeliveryAssignmentStatus =
  | 'unassigned'
  | 'assigned'
  | 'picked_up'
  | 'delivered';

export type DeliveryCallParticipantRole = 'customer' | 'delivery_partner';

export type DeliveryCallSessionStatus =
  | 'ringing'
  | 'accepted'
  | 'declined'
  | 'ended'
  | 'missed'
  | 'cancelled'
  | 'failed';

export type DeliveryPartnerProfile = {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  gender: DeliveryPartnerGender;
  partner_type: DeliveryPartnerType;
  hostel_name: string | null;
  block: string | null;
  room_number: string | null;
  building_number: string | null;
  cabin_number: string | null;
  area_label: string | null;
  account_mode: DeliveryPartnerAccountMode;
  is_online: boolean;
  alert_sound_enabled: boolean;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
};

export type DeliveryCallSession = {
  id: string;
  order_id: string;
  channel_name: string;
  caller_user_id: string;
  caller_role: DeliveryCallParticipantRole;
  caller_label: string | null;
  receiver_user_id: string;
  receiver_role: DeliveryCallParticipantRole;
  receiver_label: string | null;
  status: DeliveryCallSessionStatus;
  initiated_at: string;
  accepted_at: string | null;
  ended_at: string | null;
  ended_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type CartItem = MenuItem & {
  quantity: number;
  restaurant_name: string;
};

export type WalletAccount = {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
};

export type WalletTransaction = {
  id: string;
  wallet_account_id: string;
  user_id: string;
  payment_transaction_id: string | null;
  order_id: string | null;
  transaction_type: 'topup' | 'debit' | 'credit' | 'refund' | 'adjustment';
  direction: 'credit' | 'debit';
  amount: number;
  balance_after: number;
  status: 'pending' | 'success' | 'failed';
  topup_order_id: string | null;
  gateway_payment_id: string | null;
  note: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type UserProfile = {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  avatar_url: string | null;
  gender: string;
  user_role: string | null;
  location_type: string;
  hostel_name: string | null;
  block: string | null;
  room_number: string | null;
  building_number: string | null;
  cabin_number: string | null;
  exact_location: string | null;
  uid: string;
  created_at: string;
  updated_at: string;
};
