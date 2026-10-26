import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database, UserRole } from '../src/types/supabase';
import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export const isServerSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_SERVICE_ROLE_KEY &&
  SUPABASE_URL !== 'https://your-project.supabase.co'
);

let supabaseServerClient: SupabaseClient<Database> | null = null;

if (isServerSupabaseConfigured) {
  try {
    supabaseServerClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    console.log('[Kemet Server] Successfully initialized Supabase Service Role client.');
  } catch (err) {
    console.error('[Kemet Server] Failed to initialize Supabase server client:', err);
  }
} else {
  console.warn('[Kemet Server] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured. Running in secure fallback mode.');
}

export function getSupabaseServer(): SupabaseClient<Database> | null {
  return supabaseServerClient;
}

// ============================================================================
// IN-MEMORY / LOCAL SEED STORE FOR SEAMLESS DEVELOPMENT & FALLBACK
// ============================================================================
export interface FallbackStore {
  tours: any[];
  bookings: any[];
  bookingHistory: any[];
  transactions: any[];
  inquiries: any[];
  reviews: any[];
  subscribers: any[];
  settings: Record<string, any>;
  auditLogs: any[];
  staffUsers: any[];
}

export const fallbackStore: FallbackStore = {
  tours: [
    {
      id: 'diving-1',
      slug: 'ras-mohammed-royal-coral-diving',
      title: 'Ras Mohammed Royal Coral Diving',
      tagline: 'Explore the sunken statues of the sea god Nun',
      category_slug: 'diving',
      duration: 'Full Day (8 Hours)',
      base_price: 120.00,
      currency: 'USD',
      rating: 4.90,
      review_count: 28,
      location: 'Red Sea, Egypt (Ras Mohammed National Park)',
      primary_image_url: '/src/assets/images/egypt_sea_diving_1784070366165.jpg',
      description: 'Plunge into the deep turquoise kingdom of Nun, the primordial waters of Egyptian lore. This professional-led scuba diving excursion guides you past vertical coral walls, hammerhead sanctuaries, and a breathtaking submerged field of hand-carved Pharaonic stone monuments resting on the seabed.',
      ancient_lore: 'Ancient priests of the Red Sea wrote of "Nun"—the source of all life. They believed that submerged stone statues kept the ocean spirits pacified, ensuring safe passage for Queen Hatshepsut\'s trade caravans navigating to the mythical land of Punt.',
      inclusions: [
        'All professional scuba equipment (tanks, regulators, wetsuits)',
        'Two guided deep dives with certified Egyptologist-divers',
        'Traditional open-deck yacht lunch cooked by maritime Bedouins',
        'Round-trip hotel transfers in Hurghada or Sharm El Sheikh'
      ],
      highlights: [
        'Swim alongside giant Napoleon fish & sea turtles',
        'Unveil the underwater stone sanctuary of Anubis & Ramses',
        'Professional underwater 4K photography package'
      ],
      exclusions: ['Personal wetsuit purchase', 'Underwater scooter rental add-on'],
      status: 'published',
      is_featured: true,
      max_capacity_per_departure: 18,
      created_at: new Date().toISOString()
    },
    {
      id: 'safari-1',
      slug: 'sets-golden-deshret-safari',
      title: "Set's Golden Deshret Safari",
      tagline: 'Race quad bikes and trek camels across the red dunes',
      category_slug: 'safari',
      duration: 'Half Day (6 Hours)',
      base_price: 75.00,
      currency: 'USD',
      rating: 4.85,
      review_count: 42,
      location: 'Sinai Desert, Egypt (Hurghada Outskirts)',
      primary_image_url: '/src/assets/images/egypt_desert_safari_1784070379685.jpg',
      description: 'Race high-performance quad bikes over rolling sand ripples before transitioning to the majestic pace of a traditional camel caravan. Conclude your voyage at a secluded, torch-lit Bedouin oasis, enjoying hibiscus tea, fireside lore, and powerful telescope stargazing into the starry canopy of Nut.',
      ancient_lore: 'The red desert was called "Deshret" by Pharaohs, ruled by Set, the god of storms. Ancient miners traversed these dunes under the guard of the King\'s archers to secure Sinai\'s copper and turquoise, marking key rocks with cartouches to guarantee their return.',
      inclusions: [
        'High-performance 250cc Quad Bike (ATV) and safety helmet',
        'Sunset camel caravan trek through ancient sand ridges',
        'Secluded Bedouin camp feast with flatbread baking masterclass',
        'Astronomer-led telescope stargazing into the constellation Sah'
      ],
      highlights: [
        'Conquer high sand waves at 50km/h on an ATV',
        'Traditional acoustic Bedouin Rababa songs under the Milky Way',
        'Learn ancient Pharaonic star-navigation techniques'
      ],
      exclusions: ['Bedouin herbal oil souvenirs', 'Alcoholic beverages'],
      status: 'published',
      is_featured: true,
      max_capacity_per_departure: 25,
      created_at: new Date().toISOString()
    },
    {
      id: 'history-1',
      slug: 'pharaohs-pilgrimage-to-waset-luxor',
      title: "Pharaoh's Pilgrimage to Waset (Luxor)",
      tagline: 'Unlock the tombs of Valley of the Kings & Karnak',
      category_slug: 'history',
      duration: 'Full Day (14 Hours)',
      base_price: 180.00,
      currency: 'USD',
      rating: 4.95,
      review_count: 64,
      location: 'Luxor (Ancient Waset), Egypt',
      primary_image_url: '/src/assets/images/egypt_luxor_temple_1784070393047.jpg',
      description: 'Cross the Sinai mountains to the rich Nile Valley. Arrive in ancient Waset (Luxor), capital of the New Kingdom, where you will wander the gargantuan column halls of Karnak, descend into the painted royal vaults of the Valley of the Kings, and stand in awe before the Colossi of Memnon.',
      ancient_lore: 'To cross from the East Bank to the West Bank of Luxor is to traverse the veil between the living and the dead. The Pharaohs carved their tombs deep inside mountain crevices to match the setting of Ra, assuring resurrection into the eternal fields of Aaru.',
      inclusions: [
        'Private luxury Mercedes transport from Red Sea coast',
        'VIP entrance tickets to 3 Royal Tombs in Valley of the Kings',
        'Guided masterclass through Karnak Temple & Hatshepsut\'s Temple',
        'Gourmet Egyptian lunch on a private island on the Nile River'
      ],
      highlights: [
        'Touch hieroglyphs of the giant Hypostyle Hall in Karnak',
        'Descend into King Tutankhamun\'s painted resting vault',
        'Sunset felucca cruise with traditional hibiscus elixir'
      ],
      exclusions: ['King Tutankhamun tomb special entry supplement ($15)', 'Hot air balloon sunrise extension'],
      status: 'published',
      is_featured: true,
      max_capacity_per_departure: 16,
      created_at: new Date().toISOString()
    },
    {
      id: 'boat-1',
      slug: 'sobeks-royal-queen-nefertari-cruise',
      title: "Sobek's Royal Queen Nefertari Cruise",
      tagline: 'Sail past Giftun Island aboard our gold-appointed yacht',
      category_slug: 'boat',
      duration: 'Full Day (7 Hours)',
      base_price: 95.00,
      currency: 'USD',
      rating: 4.88,
      review_count: 31,
      location: 'Hurghada, Red Sea, Egypt',
      primary_image_url: '/src/assets/images/egypt_boat_trip_1784071711626.jpg',
      description: 'Sail upon the shimmering turquoise empire of Sobek in absolute luxury. Relax on the double-tiered sun-decks of our royal wooden yacht as we voyage toward Giftun Island. Feast on a fresh sea-tribute banquet cooked by your private onboard chefs, swim in pristine shallow lagoons, and snorkel amidst vibrant coral clusters.',
      ancient_lore: 'The Nile and the seas were overseen by Sobek, the patron of water and fertility. Ancient Egyptian kings launched cedarwood pleasure barges covered in gold leaf to honor the water spirits, believing that a joyful voyage over the sea ensured good harvest and divine favor from Osiris.',
      inclusions: [
        'Full snorkeling equipment and safety flotation gear',
        'Fresh Red Sea grilled fish and Egyptian mezze buffet',
        'Unlimited fresh tropical juices, Egyptian coffee and Bedouin tea',
        'Round-trip hotel pickup in modern air-conditioned vehicle'
      ],
      highlights: [
        'Swim in the crystal shallow lagoons of Giftun Orange Bay',
        'Lounge on comfortable shaded sundecks with cushioned daybeds',
        'Dolphin spotting along the bow of the yacht'
      ],
      exclusions: ['Giftun Island national park environmental fee ($5)', 'Alcoholic beverages'],
      status: 'published',
      is_featured: true,
      max_capacity_per_departure: 30,
      created_at: new Date().toISOString()
    },
    {
      id: 'speedboat-1',
      slug: 'horus-falcon-eye-speedboat-cruise',
      title: "Horus's Falcon Eye Speedboat Cruise",
      tagline: 'Unleash adrenaline at high speeds across secret islands',
      category_slug: 'speedboat',
      duration: 'Half Day (4 Hours)',
      base_price: 150.00,
      currency: 'USD',
      rating: 4.92,
      review_count: 19,
      location: 'El Gouna & Red Sea Islands, Egypt',
      primary_image_url: '/src/assets/images/egypt_speedboat_1784071721552.jpg',
      description: 'Soar across the waves of the Red Sea like the sacred sky falcon Horus. This premium speedboat voyage lets you bypass the slow yachts and dive straight into the most secluded, untouched island reefs of the Red Sea. Tailor your route, stop at uninhabited sandbanks, and experience the thrill of high-speed pharaonic transport.',
      ancient_lore: 'Horus, the falcon-headed lord of skies, was famous for his unmatched speed and piercing vision. Pharaonic scouts used swift reed skiffs to patrol the shores with falcon-like swiftness, communicating back to the royal temples via mirrored light signals.',
      inclusions: [
        'Private high-speed twin-engine luxury craft with certified captain',
        'Premium anti-fog snorkeling kits and underwater GoPro footage',
        'Iced organic hibiscus coolers and Egyptian artisan pastries',
        'VIP private sedan pickup directly from hotel entrance'
      ],
      highlights: [
        'Fly across turquoise channels at up to 65 km/h',
        'Private solitary swim stops at secluded shallow sandbars',
        'Uncrowded snorkeling at protected outer barrier reefs'
      ],
      exclusions: ['Deep sea fishing gear', 'Private chef onboard (available on request)'],
      status: 'published',
      is_featured: false,
      max_capacity_per_departure: 8,
      created_at: new Date().toISOString()
    }
  ],
  bookings: [
    {
      id: 'b-1001',
      booking_reference: 'KEM-2026-8492',
      customer_id: 'usr-demo-1',
      tour_id: 'diving-1',
      schedule_id: 'sch-1',
      tour_title: 'Ras Mohammed Royal Coral Diving',
      traveler_name: 'Cleopatra the Diver',
      traveler_email: 'cleo.ocean@royal-kemet.com',
      phone_number: '+20 101 234 5678',
      whatsapp_number: '+20 101 234 5678',
      hotel_name: 'Steigenberger ALDAU Beach Hotel',
      room_number: 'Suite 404',
      pickup_location: 'Hotel Main Lobby',
      pickup_time: '07:30 AM',
      scheduled_date: '2026-11-05',
      guest_count: 2,
      base_price_snapshot: 120.00,
      promo_code_used: 'KEMET30',
      discount_amount: 72.00,
      total_cost: 168.00,
      currency: 'USD',
      status: 'confirmed',
      payment_status: 'paid',
      special_requests: 'Requires prescription dive mask (-2.5) if available',
      internal_notes: 'VIP guest. Assigned master dive instructor Tarek.',
      assigned_guide_name: 'Tarek Al-Masry',
      assigned_driver_name: 'Ahmed Said',
      checked_in: false,
      created_at: '2026-10-20T10:00:00Z'
    },
    {
      id: 'b-1002',
      booking_reference: 'KEM-2026-3194',
      customer_id: 'usr-demo-2',
      tour_id: 'safari-1',
      schedule_id: 'sch-2',
      tour_title: "Set's Golden Deshret Safari",
      traveler_name: 'Ramses the Nomad',
      traveler_email: 'ramses.great@deshret-safaris.org',
      phone_number: '+20 109 876 5432',
      whatsapp_number: '+20 109 876 5432',
      hotel_name: 'Rixos Premium Magawish',
      room_number: 'Villa 12',
      pickup_location: 'Hotel Gate Guardhouse',
      pickup_time: '14:00 PM',
      scheduled_date: '2026-11-06',
      guest_count: 3,
      base_price_snapshot: 75.00,
      promo_code_used: null,
      discount_amount: 0.00,
      total_cost: 225.00,
      currency: 'USD',
      status: 'pending_approval',
      payment_status: 'unpaid',
      special_requests: 'Vegetarian meals for Bedouin dinner please',
      internal_notes: 'Awaiting passport copy for quad insurance.',
      assigned_guide_name: 'Sheikh Mansour',
      assigned_driver_name: 'Karim Zaki',
      checked_in: false,
      created_at: '2026-10-22T14:30:00Z'
    }
  ],
  bookingHistory: [
    {
      id: 'hist-1',
      booking_id: 'b-1001',
      from_status: null,
      to_status: 'pending_approval',
      note: 'Booking submitted online by customer',
      created_at: '2026-10-20T10:00:00Z'
    },
    {
      id: 'hist-2',
      booking_id: 'b-1001',
      from_status: 'pending_approval',
      to_status: 'confirmed',
      note: 'Payment verified and hotel transfer scheduled',
      created_at: '2026-10-20T11:15:00Z'
    }
  ],
  transactions: [
    {
      id: 'txn-1',
      booking_id: 'b-1001',
      transaction_type: 'payment',
      amount: 168.00,
      currency: 'USD',
      status: 'completed',
      payment_method: 'Credit Card / Visa',
      external_reference: 'STRIPE_PI_948271',
      notes: 'Online deposit and full excursion payment confirmed',
      created_at: '2026-10-20T10:05:00Z'
    }
  ],
  inquiries: [
    {
      id: 'inq-1',
      customer_id: null,
      name: 'Amelia & Mark Vance',
      email: 'vance.travelers@world.com',
      phone: '+44 7700 900077',
      subject: 'Private Felucca & Luxor Family Tour Inquiry',
      message: 'Greetings! We are a family of four visiting Luxor in late November. Can we arrange a private Nile Felucca sailing alongside the Valley of the Kings tomb visit?',
      status: 'new',
      priority: 'high',
      internal_notes: 'High potential family booking. Recommended VIP minivan.',
      created_at: '2026-10-24T16:20:00Z'
    }
  ],
  reviews: [
    {
      id: 'rev-1',
      tour_id: 'diving-1',
      customer_id: null,
      author_name: 'Dr. Sarah Jenkins',
      avatar: 'Noble Explorer',
      rating: 5,
      comment: 'Diving in Ras Mohammed alongside the submerged Pharaonic statues was an awe-inspiring experience. The marine bedouins served an exquisite fresh lunch on the yacht!',
      status: 'approved',
      created_at: '2026-10-15T12:00:00Z'
    },
    {
      id: 'rev-2',
      tour_id: 'safari-1',
      customer_id: null,
      author_name: 'Marcus Brody',
      avatar: 'Desert Voyager',
      rating: 5,
      comment: 'Racing the quads into the sunset and gazing at Orion through the high-powered telescope in the Bedouin camp was unforgettable.',
      status: 'approved',
      created_at: '2026-10-18T19:00:00Z'
    }
  ],
  subscribers: [
    {
      id: 'sub-1',
      email: 'explorer@kemetspirit.com',
      interests: ['diving', 'history'],
      vip_tier: 'Noble',
      promo_code: 'KEMET30',
      is_subscribed: true,
      consent_given_at: '2026-10-01T08:00:00Z'
    }
  ],
  settings: {
    company_info: {
      name: 'Kemet Spirit - Powered by Mas International Agency',
      phone: '+20 100 000 0000',
      whatsapp: '+20 100 000 0000',
      email: 'operations@kemetspirit.com',
      address: 'Sheraton Road, Marine Promenade, Hurghada, Egypt'
    },
    operational_defaults: {
      default_currency: 'USD',
      timezone: 'Africa/Cairo',
      auto_confirm_bookings: false,
      require_hotel_pickup_details: true,
      cancellation_notice_hours: 24
    },
    promotional_banner: {
      is_active: true,
      code: 'KEMET30',
      discount_percent: 30,
      title: 'Royal Sun Season Offering',
      description: 'Apply promo code KEMET30 during reservation to receive a 30% blessing on all excursions.'
    }
  },
  auditLogs: [
    {
      id: 'log-1',
      actor_email: 'system@kemetspirit.com',
      actor_role: 'system',
      action: 'SYSTEM_BOOT',
      entity_type: 'system',
      entity_id: 'system',
      ip_address: '127.0.0.1',
      status: 'SUCCESS',
      details: 'Authoritative backend started and verified.',
      created_at: new Date().toISOString()
    }
  ],
  staffUsers: []
};

// ============================================================================
// AUTHORITATIVE DATABASE ACCESS WRAPPERS
// ============================================================================

export async function fetchPublishedTours(): Promise<any[]> {
  if (supabaseServerClient) {
    try {
      const { data, error } = await supabaseServerClient
        .from('tours')
        .select('*')
        .eq('status', 'published')
        .order('is_featured', { ascending: false });
      if (!error && data && data.length > 0) return data;
      if (error) console.warn('[Supabase] Fetch tours warning:', error.message);
    } catch (e: any) {
      console.warn('[Supabase] Fetch tours exception:', e.message);
    }
  }
  return fallbackStore.tours.filter(t => t.status === 'published');
}

export async function fetchAllToursAdmin(): Promise<any[]> {
  if (supabaseServerClient) {
    try {
      const { data, error } = await supabaseServerClient
        .from('tours')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (e: any) {
      console.warn('[Supabase] Fetch all tours exception:', e.message);
    }
  }
  return fallbackStore.tours;
}

export async function upsertTour(tourData: any): Promise<any> {
  const tourId = tourData.id || `tour-${Date.now()}`;
  const record = {
    ...tourData,
    id: tourId,
    updated_at: new Date().toISOString()
  };

  if (supabaseServerClient) {
    try {
      const { data, error } = await supabaseServerClient
        .from('tours')
        .upsert(record)
        .select()
        .single();
      if (!error && data) return data;
      if (error) console.error('[Supabase] Upsert tour error:', error.message);
    } catch (e: any) {
      console.error('[Supabase] Upsert tour exception:', e.message);
    }
  }

  // Fallback update
  const idx = fallbackStore.tours.findIndex(t => t.id === tourId);
  if (idx >= 0) {
    fallbackStore.tours[idx] = { ...fallbackStore.tours[idx], ...record };
    return fallbackStore.tours[idx];
  } else {
    fallbackStore.tours.unshift(record);
    return record;
  }
}

export async function deleteTourById(id: string): Promise<boolean> {
  if (supabaseServerClient) {
    try {
      const { error } = await supabaseServerClient
        .from('tours')
        .delete()
        .eq('id', id);
      if (!error) return true;
    } catch (e: any) {
      console.error('[Supabase] Delete tour exception:', e.message);
    }
  }
  fallbackStore.tours = fallbackStore.tours.filter(t => t.id !== id);
  return true;
}

export async function createAuthoritativeBooking(params: {
  customer_id?: string | null;
  tour_id: string;
  scheduled_date: string;
  traveler_name: string;
  traveler_email: string;
  phone_number?: string | null;
  whatsapp_number?: string | null;
  hotel_name?: string | null;
  room_number?: string | null;
  pickup_location?: string | null;
  guest_count: number;
  promo_code?: string | null;
  special_requests?: string | null;
}): Promise<any> {
  // If Supabase RPC is available, call create_booking_atomic
  if (supabaseServerClient) {
    try {
      const { data, error } = await (supabaseServerClient as any).rpc('create_booking_atomic', {
        p_customer_id: params.customer_id || null,
        p_tour_id: params.tour_id,
        p_scheduled_date: params.scheduled_date,
        p_traveler_name: params.traveler_name,
        p_traveler_email: params.traveler_email,
        p_phone: params.phone_number || null,
        p_whatsapp: params.whatsapp_number || null,
        p_hotel_name: params.hotel_name || null,
        p_room_number: params.room_number || null,
        p_pickup_location: params.pickup_location || null,
        p_guest_count: params.guest_count,
        p_promo_code: params.promo_code || null,
        p_special_requests: params.special_requests || null,
      });

      if (!error && data) {
        return data;
      }
      if (error) console.warn('[Supabase] RPC create_booking_atomic warning:', error.message);
    } catch (e: any) {
      console.warn('[Supabase] RPC exception:', e.message);
    }
  }

  // Authoritative server-side price calculation and booking validation
  const tour = fallbackStore.tours.find(t => t.id === params.tour_id || t.slug === params.tour_id);
  if (!tour) {
    throw new Error('Requested excursion not found in catalogue.');
  }

  const basePrice = Number(tour.base_price) || 100;
  const guests = Math.max(1, params.guest_count || 1);
  let discount = 0;
  if (params.promo_code && ['kemet30', 'royal30', 'pharaoh30'].includes(params.promo_code.toLowerCase().trim())) {
    discount = Math.round(basePrice * guests * 0.30);
  }
  const totalCost = (basePrice * guests) - discount;

  const year = params.scheduled_date ? params.scheduled_date.substring(0, 4) : '2026';
  const randomRef = Math.floor(1000 + Math.random() * 9000);
  const bookingRef = `KEM-${year}-${randomRef}`;
  const bookingId = `b-${Date.now()}`;

  const newBooking = {
    id: bookingId,
    booking_reference: bookingRef,
    customer_id: params.customer_id || null,
    tour_id: tour.id,
    tour_title: tour.title,
    traveler_name: params.traveler_name,
    traveler_email: params.traveler_email,
    phone_number: params.phone_number || '',
    whatsapp_number: params.whatsapp_number || '',
    hotel_name: params.hotel_name || '',
    room_number: params.room_number || '',
    pickup_location: params.pickup_location || 'Hotel Lobby',
    pickup_time: '07:30 AM',
    scheduled_date: params.scheduled_date,
    guest_count: guests,
    base_price_snapshot: basePrice,
    promo_code_used: params.promo_code || null,
    discount_amount: discount,
    total_cost: totalCost,
    currency: tour.currency || 'USD',
    status: 'pending_approval',
    payment_status: 'unpaid',
    special_requests: params.special_requests || '',
    internal_notes: '',
    assigned_guide_name: null,
    assigned_driver_name: null,
    checked_in: false,
    created_at: new Date().toISOString()
  };

  fallbackStore.bookings.unshift(newBooking);
  fallbackStore.bookingHistory.push({
    id: `hist-${Date.now()}`,
    booking_id: bookingId,
    from_status: null,
    to_status: 'pending_approval',
    note: 'Booking submitted by traveler',
    created_at: new Date().toISOString()
  });

  return {
    success: true,
    booking_id: bookingId,
    booking_reference: bookingRef,
    total_cost: totalCost,
    discount_amount: discount,
    scheduled_date: params.scheduled_date,
    guest_count: guests,
    booking: newBooking
  };
}

export async function fetchBookingsAdmin(filters?: { status?: string; search?: string }): Promise<any[]> {
  if (supabaseServerClient) {
    try {
      let query = supabaseServerClient.from('bookings').select('*').order('created_at', { ascending: false });
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status as any);
      }
      const { data, error } = await query;
      if (!error && data) return data;
    } catch (e: any) {
      console.warn('[Supabase] Fetch bookings exception:', e.message);
    }
  }

  let list = [...fallbackStore.bookings];
  if (filters?.status && filters.status !== 'all') {
    list = list.filter(b => b.status === filters.status);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(b => 
      b.booking_reference?.toLowerCase().includes(q) ||
      b.traveler_name?.toLowerCase().includes(q) ||
      b.traveler_email?.toLowerCase().includes(q) ||
      b.tour_title?.toLowerCase().includes(q)
    );
  }
  return list;
}

export async function updateBookingStatusRecord(
  id: string, 
  status: string, 
  notes?: string, 
  actorEmail?: string
): Promise<any> {
  const allowedStatuses = ['pending_approval', 'confirmed', 'completed', 'cancelled', 'refunded'];
  if (!allowedStatuses.includes(status)) {
    throw new Error(`Invalid status transition to '${status}'`);
  }

  if (supabaseServerClient) {
    try {
      const { data, error } = await (supabaseServerClient as any)
        .from('bookings')
        .update({
          status: status as any,
          internal_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        // Log status history
        await (supabaseServerClient as any).from('booking_status_history').insert({
          booking_id: id,
          to_status: status as any,
          note: notes || `Status changed by ${actorEmail || 'staff'}`
        });
        return data;
      }
    } catch (e: any) {
      console.error('[Supabase] Update booking status exception:', e.message);
    }
  }

  const b = fallbackStore.bookings.find(item => item.id === id || item.booking_reference === id);
  if (!b) throw new Error('Booking not found');
  const prevStatus = b.status;
  b.status = status;
  if (notes) b.internal_notes = notes;

  fallbackStore.bookingHistory.push({
    id: `hist-${Date.now()}`,
    booking_id: b.id,
    from_status: prevStatus,
    to_status: status,
    note: notes || `Status updated by ${actorEmail || 'staff'}`,
    created_at: new Date().toISOString()
  });

  return b;
}

export async function checkInTicket(idOrRef: string, staffName: string): Promise<any> {
  if (supabaseServerClient) {
    try {
      const { data, error } = await (supabaseServerClient as any)
        .from('bookings')
        .update({
          checked_in: true,
          checked_in_at: new Date().toISOString(),
          status: 'completed'
        })
        .or(`id.eq.${idOrRef},booking_reference.eq.${idOrRef}`)
        .select()
        .single();
      if (!error && data) return data;
    } catch (e: any) {
      console.error('[Supabase] Check-in exception:', e.message);
    }
  }

  const b = fallbackStore.bookings.find(item => item.id === idOrRef || item.booking_reference === idOrRef);
  if (!b) throw new Error('Booking ticket voucher not found.');
  b.checked_in = true;
  b.checked_in_at = new Date().toISOString();
  b.status = 'completed';

  fallbackStore.auditLogs.unshift({
    id: `log-${Date.now()}`,
    actor_email: staffName,
    actor_role: 'staff',
    action: 'TICKET_CHECK_IN',
    entity_type: 'booking',
    entity_id: b.id,
    status: 'SUCCESS',
    details: `Ticket voucher ${b.booking_reference} successfully verified and checked in at tour gate by ${staffName}.`,
    created_at: new Date().toISOString()
  });

  return b;
}
