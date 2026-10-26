export type UserRole = 'owner' | 'admin' | 'manager' | 'operations' | 'finance' | 'support' | 'traveler';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  hotelName?: string;
  roomNumber?: string;
  role?: UserRole;
  createdAt?: string;
}

export interface Excursion {
  id: string;
  slug?: string;
  title: string;
  tagline: string;
  category: 'diving' | 'safari' | 'history' | 'boat' | 'speedboat' | 'cultural';
  category_slug?: string;
  duration: string;
  price: number;
  base_price?: number;
  currency?: string;
  rating: number;
  review_count?: number;
  location: string;
  image: string;
  primary_image_url?: string;
  description: string;
  inclusions: string[];
  highlights: string[];
  exclusions?: string[];
  ancientLore: string;
  ancient_lore?: string;
  status?: 'draft' | 'published' | 'archived';
  is_featured?: boolean;
  max_capacity_per_departure?: number;
}

export interface Booking {
  id: string;
  booking_reference?: string;
  excursionId: string;
  tour_id?: string;
  excursionTitle: string;
  tour_title?: string;
  travelerName: string;
  traveler_name?: string;
  travelerEmail: string;
  traveler_email?: string;
  phoneNumber?: string;
  phone_number?: string;
  whatsappNumber?: string;
  whatsapp_number?: string;
  hotelName?: string;
  hotel_name?: string;
  roomNumber?: string;
  room_number?: string;
  pickupLocation?: string;
  pickup_location?: string;
  pickupTime?: string;
  pickup_time?: string;
  date: string;
  scheduled_date?: string;
  numberOfGuests: number;
  guest_count?: number;
  totalCost: number;
  total_cost?: number;
  currency?: string;
  promoCodeUsed?: string;
  promo_code_used?: string;
  discountAmount?: number;
  discount_amount?: number;
  specialRequests?: string;
  special_requests?: string;
  status: 'Pending Oracle Approval' | 'Confirmed by High Priest' | 'Completed' | 'pending_approval' | 'confirmed' | 'completed' | 'cancelled' | 'refunded';
  payment_status?: 'unpaid' | 'partially_paid' | 'paid' | 'refunded';
  internalNotes?: string;
  internal_notes?: string;
  assigned_guide_name?: string;
  assigned_driver_name?: string;
  checkedIn?: boolean;
  checked_in?: boolean;
  checked_in_at?: string;
  createdAt: string;
  created_at?: string;
}

export interface Review {
  id: string;
  excursionId?: string;
  tour_id?: string;
  author: string;
  author_name?: string;
  avatar: string;
  rating: number;
  comment: string;
  date?: string;
  created_at?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface FinancialTransaction {
  id: string;
  booking_id?: string | null;
  transaction_type: 'payment' | 'refund' | 'adjustment' | 'expense';
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  external_reference?: string;
  notes?: string;
  recorded_by?: string;
  created_at: string;
}

export interface CRMInquiry {
  id: string;
  customer_id?: string | null;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  priority: string;
  internal_notes?: string;
  assigned_to?: string;
  created_at: string;
}

export interface SecurityAuditLog {
  id: string;
  timestamp?: string;
  created_at?: string;
  eventType?: string;
  action: string;
  userRole?: string;
  actor_role?: string;
  actor_email?: string;
  ipAddress?: string;
  ip_address?: string;
  status: 'SUCCESS' | 'WARNING' | 'REVOKED' | 'FAILED';
  details: string;
}

export interface ScribeMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface CustomItineraryDay {
  dayNumber: number;
  theme: string;
  activities: string[];
  scribeWisdom: string;
}

export interface CustomItinerary {
  royalGreeting: string;
  title: string;
  days: CustomItineraryDay[];
  blessing: string;
}
