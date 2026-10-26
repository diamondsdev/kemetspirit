export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'owner' | 'admin' | 'manager' | 'operations' | 'finance' | 'support' | 'traveler';
export type TourCategory = 'diving' | 'safari' | 'history' | 'boat' | 'speedboat' | 'cultural';
export type TourStatus = 'draft' | 'published' | 'archived';
export type BookingStatus = 'pending_approval' | 'confirmed' | 'completed' | 'cancelled' | 'refunded';
export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'refunded';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type InquiryStatus = 'new' | 'in_progress' | 'resolved' | 'closed';
export type TransactionType = 'payment' | 'refund' | 'adjustment' | 'expense';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          whatsapp: string | null;
          nationality: string | null;
          hotel_name: string | null;
          room_number: string | null;
          role: UserRole;
          vip_tier: string;
          lead_status: string;
          lead_score: number;
          internal_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          phone?: string | null;
          whatsapp?: string | null;
          nationality?: string | null;
          hotel_name?: string | null;
          room_number?: string | null;
          role?: UserRole;
          vip_tier?: string;
          lead_status?: string;
          lead_score?: number;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string | null;
          whatsapp?: string | null;
          nationality?: string | null;
          hotel_name?: string | null;
          room_number?: string | null;
          role?: UserRole;
          vip_tier?: string;
          lead_status?: string;
          lead_score?: number;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tours: {
        Row: {
          id: string;
          slug: string;
          title: string;
          tagline: string | null;
          category_id: string | null;
          category_slug: TourCategory;
          destination_id: string | null;
          duration: string;
          base_price: number;
          currency: string;
          rating: number;
          review_count: number;
          location: string;
          primary_image_url: string;
          description: string;
          ancient_lore: string | null;
          inclusions: Json;
          highlights: Json;
          exclusions: Json;
          status: TourStatus;
          is_featured: boolean;
          max_capacity_per_departure: number;
          seo_title: string | null;
          seo_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          tagline?: string | null;
          category_id?: string | null;
          category_slug?: TourCategory;
          destination_id?: string | null;
          duration: string;
          base_price: number;
          currency?: string;
          rating?: number;
          review_count?: number;
          location: string;
          primary_image_url: string;
          description: string;
          ancient_lore?: string | null;
          inclusions?: Json;
          highlights?: Json;
          exclusions?: Json;
          status?: TourStatus;
          is_featured?: boolean;
          max_capacity_per_departure?: number;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['tours']['Insert']>;
      };
      bookings: {
        Row: {
          id: string;
          booking_reference: string;
          customer_id: string | null;
          tour_id: string;
          schedule_id: string | null;
          tour_title: string;
          traveler_name: string;
          traveler_email: string;
          phone_number: string | null;
          whatsapp_number: string | null;
          hotel_name: string | null;
          room_number: string | null;
          pickup_location: string | null;
          pickup_time: string | null;
          scheduled_date: string;
          guest_count: number;
          base_price_snapshot: number;
          promo_code_used: string | null;
          discount_amount: number;
          total_cost: number;
          currency: string;
          status: BookingStatus;
          payment_status: PaymentStatus;
          special_requests: string | null;
          internal_notes: string | null;
          assigned_guide_name: string | null;
          assigned_driver_name: string | null;
          checked_in: boolean;
          checked_in_at: string | null;
          checked_in_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_reference: string;
          customer_id?: string | null;
          tour_id: string;
          schedule_id?: string | null;
          tour_title: string;
          traveler_name: string;
          traveler_email: string;
          phone_number?: string | null;
          whatsapp_number?: string | null;
          hotel_name?: string | null;
          room_number?: string | null;
          pickup_location?: string | null;
          pickup_time?: string | null;
          scheduled_date: string;
          guest_count: number;
          base_price_snapshot: number;
          promo_code_used?: string | null;
          discount_amount?: number;
          total_cost: number;
          currency?: string;
          status?: BookingStatus;
          payment_status?: PaymentStatus;
          special_requests?: string | null;
          internal_notes?: string | null;
          assigned_guide_name?: string | null;
          assigned_driver_name?: string | null;
          checked_in?: boolean;
          checked_in_at?: string | null;
          checked_in_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
      };
      tour_schedules: {
        Row: {
          id: string;
          tour_id: string;
          departure_date: string;
          start_time: string;
          max_capacity: number;
          reserved_count: number;
          price_override: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tour_id: string;
          departure_date: string;
          start_time?: string;
          max_capacity?: number;
          reserved_count?: number;
          price_override?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['tour_schedules']['Insert']>;
      };
      crm_inquiries: {
        Row: {
          id: string;
          customer_id: string | null;
          name: string;
          email: string;
          phone: string | null;
          subject: string;
          message: string;
          status: InquiryStatus;
          priority: string;
          internal_notes: string | null;
          assigned_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          name: string;
          email: string;
          phone?: string | null;
          subject: string;
          message: string;
          status?: InquiryStatus;
          priority?: string;
          internal_notes?: string | null;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['crm_inquiries']['Insert']>;
      };
      financial_transactions: {
        Row: {
          id: string;
          booking_id: string | null;
          transaction_type: TransactionType;
          amount: number;
          currency: string;
          status: string;
          payment_method: string;
          external_reference: string | null;
          notes: string | null;
          recorded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          transaction_type?: TransactionType;
          amount: number;
          currency?: string;
          status?: string;
          payment_method?: string;
          external_reference?: string | null;
          notes?: string | null;
          recorded_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['financial_transactions']['Insert']>;
      };
      reviews: {
        Row: {
          id: string;
          tour_id: string;
          customer_id: string | null;
          author_name: string;
          avatar: string;
          rating: number;
          comment: string;
          status: ReviewStatus;
          moderated_by: string | null;
          moderated_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tour_id: string;
          customer_id?: string | null;
          author_name: string;
          avatar?: string;
          rating: number;
          comment: string;
          status?: ReviewStatus;
          moderated_by?: string | null;
          moderated_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          interests: Json;
          vip_tier: string;
          promo_code: string | null;
          is_subscribed: boolean;
          consent_given_at: string;
          unsubscribed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          interests?: Json;
          vip_tier?: string;
          promo_code?: string | null;
          is_subscribed?: boolean;
          consent_given_at?: string;
          unsubscribed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['newsletter_subscribers']['Insert']>;
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          actor_email: string | null;
          actor_role: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          old_data: Json | null;
          new_data: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          status: string;
          details: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          actor_email?: string | null;
          actor_role?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          status?: string;
          details?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>;
      };
      website_settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          category: string;
          description: string | null;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          category?: string;
          description?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['website_settings']['Insert']>;
      };
    };
    Functions: {
      create_booking_atomic: {
        Args: {
          p_customer_id: string | null;
          p_tour_id: string;
          p_scheduled_date: string;
          p_traveler_name: string;
          p_traveler_email: string;
          p_phone?: string | null;
          p_whatsapp?: string | null;
          p_hotel_name?: string | null;
          p_room_number?: string | null;
          p_pickup_location?: string | null;
          p_guest_count: number;
          p_promo_code?: string | null;
          p_special_requests?: string | null;
        };
        Returns: Json;
      };
    };
  };
}
