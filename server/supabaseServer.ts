import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database, UserRole } from '../src/types/supabase';
import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isServerSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_SERVICE_ROLE_KEY &&
  SUPABASE_URL !== 'https://your-project.supabase.co' &&
  !SUPABASE_SERVICE_ROLE_KEY.includes('your-supabase-service-role-key') &&
  (SUPABASE_URL.startsWith('https://') || SUPABASE_URL.startsWith('http://'))
);

const isProduction = process.env.NODE_ENV === 'production';

let supabaseServerClient: SupabaseClient<Database> | null = null;

if (isServerSupabaseConfigured) {
  try {
    supabaseServerClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    console.log('[Kemet Server] Successfully initialized authoritative Supabase Service Role client.');
  } catch (err) {
    console.error('[Kemet Server] Failed to initialize Supabase server client:', err);
    if (isProduction) {
      console.error('[Kemet Server] CRITICAL: Fail-closed mode active. Production requires valid Supabase credentials.');
    }
  }
} else {
  if (isProduction) {
    console.error('[Kemet Server] FATAL ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured in production. Application will fail-closed.');
  } else {
    console.warn('[Kemet Server] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured. Running in secure local development store mode.');
  }
}

export function getSupabaseServer(): SupabaseClient<Database> | null {
  return supabaseServerClient;
}

/**
 * Ensures production fails closed if Supabase is unconfigured
 */
function assertAuthoritativeAvailable(): void {
  if (isProduction && !supabaseServerClient) {
    throw new Error('503 Service Unavailable: Authoritative database connection is required in production.');
  }
}

// ============================================================================
// LOCAL DEVELOPMENT SEED STORE (ONLY FOR DEV WHEN SUPABASE NOT YET CONFIGURED)
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
      slug: 'giftun-island-paradise-cruise',
      title: 'Giftun Island & Orange Bay Sanctuary',
      tagline: 'Sail the azure currents of Hathor to untouched white sand atolls',
      category_slug: 'boat',
      duration: 'Full Day (7 Hours)',
      base_price: 65.00,
      currency: 'USD',
      rating: 4.88,
      review_count: 51,
      location: 'Hurghada Red Sea Archipelago',
      primary_image_url: '/src/assets/images/egypt_boat_trip_1784071711626.jpg',
      description: 'Step aboard a custom-crafted Egyptian yacht designed in honor of Hathor, the Lady of Turquoise. Cruise across crystal clear lagoons to the powdery white sands of Giftun Island and Orange Bay. Unwind on overwater wooden swings, snorkel protected reefs with clownfish and rays, and feast on Mediterranean grilled seafood.',
      ancient_lore: 'Hathor was worshipped in ancient temples as the goddess of joy, music, and foreign turquoise expeditions. Maritime travelers returning from Punt offered sweet lotus wine at sea to secure her blessings of clear waters and favorable winds.',
      inclusions: [
        '3-hour relaxing stay on Giftun Island & Orange Bay sands',
        'Two guided coral reef snorkeling stops with marine life specialists',
        'Open-buffet fresh seafood and Mediterranean lunch',
        'Complimentary water, hot tea, Bedouin coffee, and soft beverages all day'
      ],
      highlights: [
        'Instagrammable overwater hammocks and swings on turquoise water',
        'Frequent dolphin pod encounters in the open channel',
        'Protected shallow lagoons perfect for all swimming levels'
      ],
      exclusions: ['Orange Bay VIP cabana rental ($20)', 'Banana boat towing add-on'],
      status: 'published',
      is_featured: false,
      max_capacity_per_departure: 30,
      created_at: new Date().toISOString()
    },
    {
      id: 'speedboat-1',
      slug: 'horus-falcon-speed-voyage',
      title: "Horus' Falcon Speedboat Safari",
      tagline: 'High-octane adrenaline blast across coastal Red Sea reefs',
      category_slug: 'speedboat',
      duration: '2 Hours',
      base_price: 95.00,
      currency: 'USD',
      rating: 4.92,
      review_count: 19,
      location: 'El Gouna & Hurghada Coastline',
      primary_image_url: '/src/assets/images/egypt_speedboat_1784071721552.jpg',
      description: 'Feel the rush of Horus\' flight across the azure waves on an ultra-modern 400HP twin-engine speedboat. Skim over coral shallows at exhilarating speeds, pause at secret sandbars inaccessible to larger vessels, and snorkel alongside wild spinner dolphins in their natural migratory bays.',
      ancient_lore: 'Horus was depicted as a divine falcon whose wings spanned the entire sky—one eye the sun, the other the moon. Warriors and royal couriers prayed for his blazing speed and watchful vigilance when carrying vital messages along the desert coastlines.',
      inclusions: [
        'Private or semi-private high-speed watercraft voyage',
        'Life jackets and certified coastal watercraft captain',
        'Snorkeling gear & private swim stop at secluded sandbar',
        'Chilled bottled mineral water and Egyptian fruit juices'
      ],
      highlights: [
        'Hit adrenaline-pumping speeds of up to 45 knots over open water',
        'Private access to isolated sandbars far from commercial crowds',
        'Close-up sightings of wild dolphins leaping in speedboat wakes'
      ],
      exclusions: ['Towable inflatable tube rides', 'Hotel pickup outside El Gouna / Hurghada zone'],
      status: 'published',
      is_featured: false,
      max_capacity_per_departure: 8,
      created_at: new Date().toISOString()
    }
  ],
  bookings: [],
  bookingHistory: [],
  transactions: [],
  inquiries: [],
  reviews: [],
  subscribers: [],
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
  auditLogs: [],
  staffUsers: []
};

// ============================================================================
// ATOMIC OWNER PROVISIONING WITH MUTEX LOCK
// ============================================================================
let isOwnerProvisioningInProgress = false;

export async function checkIfOwnerExists(): Promise<boolean> {
  if (supabaseServerClient) {
    const { data, error } = await supabaseServerClient
      .from('profiles')
      .select('id')
      .eq('role', 'owner')
      .limit(1);

    if (error) {
      console.error('[Supabase] Error checking owner existence:', error.message);
      throw new Error(`Database error while verifying system initialization: ${error.message}`);
    }
    return Boolean(data && data.length > 0);
  }

  assertAuthoritativeAvailable();
  return fallbackStore.staffUsers.some(u => u.role === 'owner');
}

export async function provisionOwnerAtomic(params: {
  email: string;
  password: string;
  fullName: string;
  setupSecret: string;
  ipAddress?: string;
}): Promise<{ userId: string; email: string; fullName: string; role: UserRole }> {
  const expectedSecret = process.env.SETUP_SECRET;
  if (!expectedSecret || expectedSecret.trim() === '') {
    throw new Error('Initial owner setup is disabled. SETUP_SECRET environment variable is not configured.');
  }

  // Strict constant-time string comparison to prevent timing attacks
  const providedBuffer = Buffer.from(params.setupSecret || '');
  const expectedBuffer = Buffer.from(expectedSecret);
  if (providedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    throw new Error('Invalid setup secret. Unauthorized provisioning attempt.');
  }

  if (isOwnerProvisioningInProgress) {
    throw new Error('Another owner provisioning process is currently in progress. Please retry in a moment.');
  }

  isOwnerProvisioningInProgress = true;
  try {
    const ownerExists = await checkIfOwnerExists();
    if (ownerExists) {
      throw new Error('Initial owner setup is permanently closed. An owner has already been established.');
    }

    const cleanEmail = params.email.trim().toLowerCase();

    if (supabaseServerClient) {
      // Create user in Supabase Auth via admin API
      const { data: authData, error: authError } = await supabaseServerClient.auth.admin.createUser({
        email: cleanEmail,
        password: params.password,
        email_confirm: true,
        user_metadata: { full_name: params.fullName }
      });

      if (authError) {
        throw new Error(`Failed to create Supabase Auth owner: ${authError.message}`);
      }

      if (!authData?.user) {
        throw new Error('User creation did not return an authorized identity.');
      }

      const userId = authData.user.id;

      // Upsert profile with strict 'owner' role
      const { error: profileError } = await (supabaseServerClient.from('profiles') as any).upsert({
        id: userId,
        email: cleanEmail,
        full_name: params.fullName,
        role: 'owner',
        vip_tier: 'Pharaoh',
        lead_status: 'Royal Owner',
        lead_score: 100
      });

      if (profileError) {
        throw new Error(`Failed to initialize owner profile: ${profileError.message}`);
      }

      // Record immutable audit log
      await recordAuditLog({
        actor_email: cleanEmail,
        actor_role: 'owner',
        action: 'OWNER_PROVISIONED',
        entity_type: 'profile',
        entity_id: userId,
        status: 'SUCCESS',
        ip_address: params.ipAddress || '127.0.0.1',
        details: 'Initial Royal Sanctuary Owner account securely provisioned via authoritative Supabase.'
      });

      return {
        userId,
        email: cleanEmail,
        fullName: params.fullName,
        role: 'owner'
      };
    }

    assertAuthoritativeAvailable();

    // Dev fallback ONLY when NODE_ENV !== 'production'
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(params.password, salt, 10000, 64, 'sha512').toString('hex');
    const userId = `usr-owner-${Date.now()}`;
    const ownerUser = {
      id: userId,
      email: cleanEmail,
      fullName: params.fullName,
      role: 'owner' as UserRole,
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: new Date().toISOString()
    };
    fallbackStore.staffUsers.push(ownerUser);

    await recordAuditLog({
      actor_email: cleanEmail,
      actor_role: 'owner',
      action: 'OWNER_PROVISIONED',
      entity_type: 'staff',
      entity_id: userId,
      status: 'SUCCESS',
      ip_address: params.ipAddress || '127.0.0.1',
      details: 'Development fallback owner created.'
    });

    return {
      userId,
      email: cleanEmail,
      fullName: params.fullName,
      role: 'owner'
    };
  } finally {
    isOwnerProvisioningInProgress = false;
  }
}

// ============================================================================
// TOURS & EXCURSIONS CATALOGUE
// ============================================================================

export async function fetchPublishedTours(): Promise<any[]> {
  if (supabaseServerClient) {
    try {
      const { data, error } = await supabaseServerClient
        .from('tours')
        .select('*')
        .eq('status', 'published')
        .order('is_featured', { ascending: false });

      if (!error && data && data.length > 0) {
        return data;
      }
      if (error) {
        console.warn('[Supabase] Fetch tours warning:', error.message);
      }
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

      if (!error && data && data.length > 0) {
        return data;
      }
      if (error) {
        console.warn('[Supabase] Fetch all tours error:', error.message);
      }
    } catch (e: any) {
      console.warn('[Supabase] Fetch all tours exception:', e.message);
    }
  }

  return fallbackStore.tours;
}

export async function upsertTour(tourData: any): Promise<any> {
  assertAuthoritativeAvailable();

  const tourId = tourData.id || crypto.randomUUID();
  const record = {
    ...tourData,
    id: tourId,
    updated_at: new Date().toISOString()
  };

  if (supabaseServerClient) {
    const { data, error } = await supabaseServerClient
      .from('tours')
      .upsert(record)
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Upsert tour error:', error.message);
      throw new Error(`Database error saving tour: ${error.message}`);
    }
    return data;
  }

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
  assertAuthoritativeAvailable();

  if (supabaseServerClient) {
    const { error } = await supabaseServerClient
      .from('tours')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Supabase] Delete tour error:', error.message);
      throw new Error(`Database error deleting tour: ${error.message}`);
    }
    return true;
  }

  fallbackStore.tours = fallbackStore.tours.filter(t => t.id !== id);
  return true;
}

// ============================================================================
// CONCURRENCY-SAFE ATOMIC BOOKING
// ============================================================================

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
  assertAuthoritativeAvailable();

  if (supabaseServerClient) {
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

    if (error) {
      console.error('[Supabase] create_booking_atomic error:', error.message);
      throw new Error(`Booking rejected: ${error.message}`);
    }
    return data;
  }

  // Development Fallback calculations
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
    let query = supabaseServerClient.from('bookings').select('*').order('created_at', { ascending: false });
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status as any);
    }
    const { data, error } = await query;
    if (error) {
      console.error('[Supabase] Fetch bookings error:', error.message);
      throw new Error(`Database error fetching bookings: ${error.message}`);
    }
    return data || [];
  }

  assertAuthoritativeAvailable();
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

export async function fetchUserBookings(userId?: string, email?: string): Promise<any[]> {
  if (!userId && !email) return [];

  if (supabaseServerClient) {
    let query = supabaseServerClient.from('bookings').select('*').order('created_at', { ascending: false });
    if (userId && email) {
      query = query.or(`customer_id.eq.${userId},traveler_email.eq.${email}`);
    } else if (userId) {
      query = query.eq('customer_id', userId);
    } else if (email) {
      query = query.eq('traveler_email', email);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[Supabase] Fetch user bookings error:', error.message);
      throw new Error(`Database error fetching user bookings: ${error.message}`);
    }
    return data || [];
  }

  assertAuthoritativeAvailable();
  const cleanEmail = email?.toLowerCase();
  return fallbackStore.bookings.filter(b => 
    (userId && b.customer_id === userId) ||
    (cleanEmail && b.traveler_email?.toLowerCase() === cleanEmail)
  );
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

  assertAuthoritativeAvailable();

  if (supabaseServerClient) {
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

    if (error) {
      console.error('[Supabase] Update booking status error:', error.message);
      throw new Error(`Failed to update booking status: ${error.message}`);
    }

    // Insert history
    await (supabaseServerClient as any).from('booking_status_history').insert({
      booking_id: id,
      to_status: status as any,
      note: notes || `Status changed to ${status} by ${actorEmail || 'staff'}`
    });

    return data;
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
  assertAuthoritativeAvailable();

  if (supabaseServerClient) {
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

    if (error) {
      console.error('[Supabase] Check-in error:', error.message);
      throw new Error(`Check-in failed: ${error.message}`);
    }

    await recordAuditLog({
      actor_email: staffName,
      actor_role: 'staff',
      action: 'TICKET_CHECK_IN',
      entity_type: 'booking',
      entity_id: data.id,
      status: 'SUCCESS',
      details: `Ticket voucher ${data.booking_reference} successfully verified and checked in at tour gate by ${staffName}.`
    });

    return data;
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

// ============================================================================
// FINANCIAL TRANSACTIONS LEDGER
// ============================================================================

export async function fetchFinanceOverview(): Promise<{
  totalBookingValue: number;
  totalCollected: number;
  totalRefunded: number;
  outstandingBalance: number;
  transactionCount: number;
  recentTransactions: any[];
}> {
  if (supabaseServerClient) {
    const [bookingsRes, txnsRes] = await Promise.all([
      supabaseServerClient.from('bookings').select('total_cost, status'),
      supabaseServerClient.from('financial_transactions').select('*').order('created_at', { ascending: false })
    ]);

    if (bookingsRes.error) throw new Error(bookingsRes.error.message);
    if (txnsRes.error) throw new Error(txnsRes.error.message);

    const bookings = bookingsRes.data || [];
    const transactions = txnsRes.data || [];

    const totalBookingValue = bookings
      .filter((b: any) => b.status !== 'cancelled')
      .reduce((sum: number, b: any) => sum + (Number(b.total_cost) || 0), 0);

    const totalCollected = transactions
      .filter((t: any) => t.transaction_type === 'payment' && t.status === 'completed')
      .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);

    const totalRefunded = transactions
      .filter((t: any) => t.transaction_type === 'refund')
      .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);

    const outstandingBalance = Math.max(0, totalBookingValue - totalCollected);

    return {
      totalBookingValue,
      totalCollected,
      totalRefunded,
      outstandingBalance,
      transactionCount: transactions.length,
      recentTransactions: transactions.slice(0, 10)
    };
  }

  assertAuthoritativeAvailable();
  const bookings = fallbackStore.bookings;
  const transactions = fallbackStore.transactions;

  const totalBookingValue = bookings.reduce((sum, b) => sum + (Number(b.total_cost) || 0), 0);
  const totalCollected = transactions
    .filter(t => t.transaction_type === 'payment' && t.status === 'completed')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalRefunded = transactions
    .filter(t => t.transaction_type === 'refund')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const outstandingBalance = Math.max(0, totalBookingValue - totalCollected);

  return {
    totalBookingValue,
    totalCollected,
    totalRefunded,
    outstandingBalance,
    transactionCount: transactions.length,
    recentTransactions: transactions.slice(0, 10)
  };
}

export async function recordFinancialTransaction(params: {
  booking_id?: string | null;
  transaction_type: string;
  amount: number;
  payment_method?: string;
  notes?: string;
  recorded_by?: string;
}): Promise<any> {
  assertAuthoritativeAvailable();

  if (supabaseServerClient) {
    const record = {
      booking_id: params.booking_id || null,
      transaction_type: params.transaction_type as any,
      amount: params.amount,
      currency: 'USD',
      status: 'completed',
      payment_method: params.payment_method || 'Manual Staff Entry',
      external_reference: `MANUAL-${Date.now()}`,
      notes: params.notes || null,
      created_at: new Date().toISOString()
    };

    const { data, error } = await (supabaseServerClient as any)
      .from('financial_transactions')
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Insert transaction error:', error.message);
      throw new Error(`Database error recording transaction: ${error.message}`);
    }

    if (params.booking_id) {
      const paymentStatus = params.transaction_type === 'payment' ? 'paid' : 'refunded';
      await (supabaseServerClient as any)
        .from('bookings')
        .update({ payment_status: paymentStatus })
        .eq('id', params.booking_id);
    }

    return data;
  }

  const newTxn = {
    id: `txn-${Date.now()}`,
    booking_id: params.booking_id || null,
    transaction_type: params.transaction_type || 'payment',
    amount: params.amount,
    currency: 'USD',
    status: 'completed',
    payment_method: params.payment_method || 'Manual Staff Entry',
    external_reference: `MANUAL-${Date.now()}`,
    notes: params.notes || '',
    recorded_by: params.recorded_by || 'staff',
    created_at: new Date().toISOString()
  };

  fallbackStore.transactions.unshift(newTxn);

  if (params.booking_id) {
    const b = fallbackStore.bookings.find(item => item.id === params.booking_id || item.booking_reference === params.booking_id);
    if (b && params.transaction_type === 'payment') {
      b.payment_status = 'paid';
    } else if (b && params.transaction_type === 'refund') {
      b.payment_status = 'refunded';
    }
  }

  return newTxn;
}

// ============================================================================
// CRM INQUIRIES
// ============================================================================

export async function submitInquiry(data: {
  customer_id?: string | null;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}): Promise<any> {
  assertAuthoritativeAvailable();

  if (supabaseServerClient) {
    const record = {
      customer_id: data.customer_id || null,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject || 'General Inquiry',
      message: data.message,
      status: 'new' as any,
      priority: 'medium'
    };

    const { data: inserted, error } = await (supabaseServerClient as any)
      .from('crm_inquiries')
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Insert inquiry error:', error.message);
      throw new Error(`Database error creating inquiry: ${error.message}`);
    }
    return inserted;
  }

  const newInquiry = {
    id: `inq-${Date.now()}`,
    customer_id: data.customer_id || null,
    name: data.name,
    email: data.email,
    phone: data.phone || '',
    subject: data.subject || 'General Inquiry',
    message: data.message,
    status: 'new',
    priority: 'medium',
    internal_notes: '',
    created_at: new Date().toISOString()
  };

  fallbackStore.inquiries.unshift(newInquiry);
  return newInquiry;
}

export async function fetchInquiriesAdmin(): Promise<any[]> {
  if (supabaseServerClient) {
    const { data, error } = await supabaseServerClient
      .from('crm_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  assertAuthoritativeAvailable();
  return fallbackStore.inquiries;
}

export async function updateInquiryStatus(id: string, updates: {
  status?: string;
  internal_notes?: string;
  priority?: string;
}): Promise<any> {
  assertAuthoritativeAvailable();

  if (supabaseServerClient) {
    const { data, error } = await (supabaseServerClient as any)
      .from('crm_inquiries')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  const inq = fallbackStore.inquiries.find(i => i.id === id);
  if (!inq) throw new Error('Inquiry not found');
  if (updates.status) inq.status = updates.status;
  if (updates.internal_notes !== undefined) inq.internal_notes = updates.internal_notes;
  if (updates.priority) inq.priority = updates.priority;
  return inq;
}

// ============================================================================
// REVIEWS & MODERATION
// ============================================================================

export async function fetchApprovedReviews(): Promise<any[]> {
  if (supabaseServerClient) {
    try {
      const { data, error } = await supabaseServerClient
        .from('reviews')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (!error && data) return data;
      if (error) {
        console.warn('[Supabase] fetchApprovedReviews warning:', error.message);
      }
    } catch (e: any) {
      console.warn('[Supabase] fetchApprovedReviews error:', e.message);
    }
  }

  return fallbackStore.reviews.filter(r => r.status === 'approved');
}

export async function fetchAllReviewsAdmin(): Promise<any[]> {
  if (supabaseServerClient) {
    const { data, error } = await supabaseServerClient
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  assertAuthoritativeAvailable();
  return fallbackStore.reviews;
}

export async function submitReview(data: {
  tour_id: string;
  customer_id?: string | null;
  author_name: string;
  avatar?: string;
  rating: number;
  comment: string;
}): Promise<any> {
  assertAuthoritativeAvailable();

  if (supabaseServerClient) {
    const record = {
      tour_id: data.tour_id,
      customer_id: data.customer_id || null,
      author_name: data.author_name,
      avatar: data.avatar || 'Noble Explorer',
      rating: Math.min(5, Math.max(1, Number(data.rating))),
      comment: data.comment,
      status: 'pending' as any
    };

    const { data: inserted, error } = await (supabaseServerClient as any)
      .from('reviews')
      .insert(record)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return inserted;
  }

  const newReview = {
    id: `rev-${Date.now()}`,
    tour_id: data.tour_id,
    customer_id: data.customer_id || null,
    author_name: data.author_name,
    avatar: data.avatar || 'Noble Explorer',
    rating: Math.min(5, Math.max(1, Number(data.rating))),
    comment: data.comment,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  fallbackStore.reviews.unshift(newReview);
  return newReview;
}

export async function moderateReview(id: string, status: string, staffId?: string): Promise<any> {
  assertAuthoritativeAvailable();

  const newStatus = status === 'approved' ? 'approved' : 'rejected';

  if (supabaseServerClient) {
    const { data, error } = await (supabaseServerClient as any)
      .from('reviews')
      .update({
        status: newStatus,
        moderated_by: staffId || null,
        moderated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  const rev = fallbackStore.reviews.find(r => r.id === id);
  if (!rev) throw new Error('Review not found');
  rev.status = newStatus;
  return rev;
}

// ============================================================================
// NEWSLETTER
// ============================================================================

export async function subscribeNewsletter(email: string, interests?: string[]): Promise<any> {
  assertAuthoritativeAvailable();
  const cleanEmail = email.trim().toLowerCase();

  if (supabaseServerClient) {
    const { data, error } = await (supabaseServerClient as any)
      .from('newsletter_subscribers')
      .upsert({
        email: cleanEmail,
        interests: interests || [],
        vip_tier: 'Noble',
        promo_code: 'KEMET30',
        is_subscribed: true
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  const existing = fallbackStore.subscribers.find(s => s.email.toLowerCase() === cleanEmail);
  if (existing) {
    return existing;
  }

  const newSub = {
    id: `sub-${Date.now()}`,
    email: cleanEmail,
    interests: interests || [],
    vip_tier: 'Noble',
    promo_code: 'KEMET30',
    is_subscribed: true,
    consent_given_at: new Date().toISOString()
  };

  fallbackStore.subscribers.unshift(newSub);
  return newSub;
}

export async function fetchSubscribersAdmin(): Promise<any[]> {
  if (supabaseServerClient) {
    const { data, error } = await supabaseServerClient
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  assertAuthoritativeAvailable();
  return fallbackStore.subscribers;
}

// ============================================================================
// WEBSITE SETTINGS
// ============================================================================

export async function fetchSettings(): Promise<any> {
  if (supabaseServerClient) {
    const { data, error } = await supabaseServerClient
      .from('website_settings')
      .select('*');

    if (!error && data && data.length > 0) {
      const settingsMap: Record<string, any> = {};
      data.forEach((row: any) => {
        settingsMap[row.key] = row.value;
      });
      return settingsMap;
    }
  }

  return fallbackStore.settings;
}

export async function updateSettings(category: string, newValues: any, staffId?: string): Promise<any> {
  assertAuthoritativeAvailable();

  if (supabaseServerClient) {
    const { data, error } = await (supabaseServerClient as any)
      .from('website_settings')
      .upsert({
        key: category,
        value: newValues,
        category,
        updated_by: staffId || null,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data?.value || newValues;
  }

  fallbackStore.settings[category] = { ...fallbackStore.settings[category], ...newValues };
  return fallbackStore.settings[category];
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

export async function recordAuditLog(params: {
  actor_id?: string;
  actor_email?: string;
  actor_role?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_data?: any;
  new_data?: any;
  ip_address?: string;
  user_agent?: string;
  status: string;
  details?: string;
}): Promise<void> {
  if (supabaseServerClient) {
    try {
      await (supabaseServerClient as any).from('audit_logs').insert({
        actor_id: params.actor_id || null,
        actor_email: params.actor_email || null,
        actor_role: params.actor_role || null,
        action: params.action,
        entity_type: params.entity_type,
        entity_id: params.entity_id || null,
        old_data: params.old_data || null,
        new_data: params.new_data || null,
        ip_address: params.ip_address || null,
        user_agent: params.user_agent || null,
        status: params.status || 'SUCCESS',
        details: params.details || null,
        created_at: new Date().toISOString()
      });
      return;
    } catch (err) {
      console.warn('[Supabase] Failed to write audit log to database:', err);
    }
  }

  fallbackStore.auditLogs.unshift({
    id: `log-${Date.now()}`,
    ...params,
    created_at: new Date().toISOString()
  });
}

export async function fetchAuditLogsAdmin(): Promise<any[]> {
  if (supabaseServerClient) {
    const { data, error } = await supabaseServerClient
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);
    return data || [];
  }

  assertAuthoritativeAvailable();
  return fallbackStore.auditLogs.slice(0, 50);
}
