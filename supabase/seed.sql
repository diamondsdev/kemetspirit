-- ============================================================================
-- KEMET SPIRIT - SEED SCRIPT
-- File: supabase/seed.sql
-- Description: Idempotent seed data for destinations, categories, tours,
--              itineraries, pickup locations, and website settings.
-- ============================================================================

-- 1. Destinations
INSERT INTO destinations (slug, name, ancient_name, region, description, image_url, display_order)
VALUES 
  ('red-sea-sinai', 'Ras Mohammed & Sinai', 'Nun''s Primeval Deep', 'Red Sea & Sinai', 'Protected marine sanctuary featuring vertical coral drop-offs and ancient maritime lore.', '/src/assets/images/egypt_sea_diving_1784070366165.jpg', 1),
  ('hurghada-deshret', 'Hurghada & Eastern Desert', 'Set''s Deshret Realm', 'Eastern Desert Coast', 'Golden rolling sand dunes meeting turquoise maritime waters, rich in Bedouin culture.', '/src/assets/images/egypt_desert_safari_1784070379685.jpg', 2),
  ('luxor-waset', 'Luxor & Nile Valley', 'Waset (The Scepter City)', 'Upper Egypt', 'The eternal spiritual capital of the New Kingdom, home to Karnak and the Valley of the Kings.', '/src/assets/images/egypt_luxor_temple_1784070393047.jpg', 3),
  ('giftun-islands', 'Giftun Orange Bay Islands', 'Sobek''s Turquoise Realm', 'Red Sea Protected Islands', 'Pristine white sandbars, shallow sapphire lagoons, and vibrant coral ecosystems.', '/src/assets/images/egypt_boat_trip_1784071711626.jpg', 4),
  ('el-gouna-lagoons', 'El Gouna Northern Lagoons', 'Horus''s Azure Skiff Coast', 'Red Sea Northern Coast', 'Private archipelago of lagoons and secret reefs navigated by swift speedboats.', '/src/assets/images/egypt_speedboat_1784071721552.jpg', 5)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url;

-- 2. Tour Categories
INSERT INTO tour_categories (slug, name, description, icon, display_order)
VALUES
  ('diving', 'Scuba Diving & Reefs', 'Underwater coral walls, sunken Pharaonic sanctuaries, and deep sea marine life.', 'Anchor', 1),
  ('safari', 'Desert Quad & Camel Safaris', 'High-adrenaline ATV expeditions, sunset camel caravans, and Bedouin stargazing.', 'Compass', 2),
  ('history', 'Ancient Temples & Nile Pilgrimages', 'VIP historical journeys to Luxor, Karnak, Valley of the Kings, and Nile cruises.', 'Sparkles', 3),
  ('boat', 'Royal Yacht & Island Cruises', 'Double-tiered luxury yachts, island exploration, and gourmet seafood banquets.', 'Ship', 4),
  ('speedboat', 'Adrenaline Speedboat Voyages', 'High-speed custom routes to untouched sandbanks and isolated dolphin sanctuaries.', 'Zap', 5)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 3. Core Tours & Excursions
INSERT INTO tours (
  slug, title, tagline, category_slug, duration, base_price, currency, rating, review_count,
  location, primary_image_url, description, ancient_lore, inclusions, highlights, exclusions,
  status, is_featured, max_capacity_per_departure
) VALUES
  (
    'ras-mohammed-royal-coral-diving',
    'Ras Mohammed Royal Coral Diving',
    'Explore the sunken statues of the sea god Nun',
    'diving',
    'Full Day (8 Hours)',
    120.00,
    'USD',
    4.90,
    28,
    'Red Sea, Egypt (Ras Mohammed National Park)',
    '/src/assets/images/egypt_sea_diving_1784070366165.jpg',
    'Plunge into the deep turquoise kingdom of Nun, the primordial waters of Egyptian lore. This professional-led scuba diving excursion guides you past vertical coral walls, hammerhead sanctuaries, and a breathtaking submerged field of hand-carved Pharaonic stone monuments resting on the seabed.',
    'Ancient priests of the Red Sea wrote of "Nun"—the source of all life. They believed that submerged stone statues kept the ocean spirits pacified, ensuring safe passage for Queen Hatshepsut''s trade caravans navigating to the mythical land of Punt.',
    '["All professional scuba equipment (tanks, regulators, wetsuits)", "Two guided deep dives with certified Egyptologist-divers", "Traditional open-deck yacht lunch cooked by maritime Bedouins", "Round-trip hotel transfers in Hurghada or Sharm El Sheikh"]'::jsonb,
    '["Swim alongside giant Napoleon fish & sea turtles", "Unveil the underwater stone sanctuary of Anubis & Ramses", "Professional underwater 4K photography package"]'::jsonb,
    '["Personal wetsuit purchase", "Underwater scooter rental add-on"]'::jsonb,
    'published',
    true,
    18
  ),
  (
    'sets-golden-deshret-safari',
    'Set''s Golden Deshret Safari',
    'Race quad bikes and trek camels across the red dunes',
    'safari',
    'Half Day (6 Hours)',
    75.00,
    'USD',
    4.85,
    42,
    'Sinai Desert, Egypt (Hurghada Outskirts)',
    '/src/assets/images/egypt_desert_safari_1784070379685.jpg',
    'Race high-performance quad bikes over rolling sand ripples before transitioning to the majestic pace of a traditional camel caravan. Conclude your voyage at a secluded, torch-lit Bedouin oasis, enjoying hibiscus tea, fireside lore, and powerful telescope stargazing into the starry canopy of Nut.',
    'The red desert was called "Deshret" by Pharaohs, ruled by Set, the god of storms. Ancient miners traversed these dunes under the guard of the King''s archers to secure Sinai''s copper and turquoise, marking key rocks with cartouches to guarantee their return.',
    '["High-performance 250cc Quad Bike (ATV) and safety helmet", "Sunset camel caravan trek through ancient sand ridges", "Secluded Bedouin camp feast with flatbread baking masterclass", "Astronomer-led telescope stargazing into the constellation Sah"]'::jsonb,
    '["Conquer high sand waves at 50km/h on an ATV", "Traditional acoustic Bedouin Rababa songs under the Milky Way", "Learn ancient Pharaonic star-navigation techniques"]'::jsonb,
    '["Bedouin herbal oil souvenirs", "Alcoholic beverages"]'::jsonb,
    'published',
    true,
    25
  ),
  (
    'pharaohs-pilgrimage-to-waset-luxor',
    'Pharaoh''s Pilgrimage to Waset (Luxor)',
    'Unlock the tombs of Valley of the Kings & Karnak',
    'history',
    'Full Day (14 Hours)',
    180.00,
    'USD',
    4.95,
    64,
    'Luxor (Ancient Waset), Egypt',
    '/src/assets/images/egypt_luxor_temple_1784070393047.jpg',
    'Cross the Sinai mountains to the rich Nile Valley. Arrive in ancient Waset (Luxor), capital of the New Kingdom, where you will wander the gargantuan column halls of Karnak, descend into the painted royal vaults of the Valley of the Kings, and stand in awe before the Colossi of Memnon.',
    'To cross from the East Bank to the West Bank of Luxor is to traverse the veil between the living and the dead. The Pharaohs carved their tombs deep inside mountain crevices to match the setting of Ra, assuring resurrection into the eternal fields of Aaru.',
    '["Private luxury Mercedes transport from Red Sea coast", "VIP entrance tickets to 3 Royal Tombs in Valley of the Kings", "Guided masterclass through Karnak Temple & Hatshepsut''s Temple", "Gourmet Egyptian lunch on a private island on the Nile River"]'::jsonb,
    '["Touch hieroglyphs of the giant Hypostyle Hall in Karnak", "Descend into King Tutankhamun''s painted resting vault", "Sunset felucca cruise with traditional hibiscus elixir"]'::jsonb,
    '["King Tutankhamun tomb special entry supplement ($15)", "Hot air balloon sunrise extension"]'::jsonb,
    'published',
    true,
    16
  ),
  (
    'sobeks-royal-queen-nefertari-cruise',
    'Sobek''s Royal Queen Nefertari Cruise',
    'Sail past Giftun Island aboard our gold-appointed yacht',
    'boat',
    'Full Day (7 Hours)',
    95.00,
    'USD',
    4.88,
    31,
    'Hurghada, Red Sea, Egypt',
    '/src/assets/images/egypt_boat_trip_1784071711626.jpg',
    'Sail upon the shimmering turquoise empire of Sobek in absolute luxury. Relax on the double-tiered sun-decks of our royal wooden yacht as we voyage toward Giftun Island. Feast on a fresh sea-tribute banquet cooked by your private onboard chefs, swim in pristine shallow lagoons, and snorkel amidst vibrant coral clusters.',
    'The Nile and the seas were overseen by Sobek, the patron of water and fertility. Ancient Egyptian kings launched cedarwood pleasure barges covered in gold leaf to honor the water spirits, believing that a joyful voyage over the sea ensured good harvest and divine favor from Osiris.',
    '["Full snorkeling equipment and safety flotation gear", "Fresh Red Sea grilled fish and Egyptian mezze buffet", "Unlimited fresh tropical juices, Egyptian coffee and Bedouin tea", "Round-trip hotel pickup in modern air-conditioned vehicle"]'::jsonb,
    '["Swim in the crystal shallow lagoons of Giftun Orange Bay", "Lounge on comfortable shaded sundecks with cushioned daybeds", "Dolphin spotting along the bow of the yacht"]'::jsonb,
    '["Giftun Island national park environmental fee ($5)", "Alcoholic beverages"]'::jsonb,
    'published',
    true,
    30
  ),
  (
    'horus-falcon-eye-speedboat-cruise',
    'Horus''s Falcon Eye Speedboat Cruise',
    'Unleash adrenaline at high speeds across secret islands',
    'speedboat',
    'Half Day (4 Hours)',
    150.00,
    'USD',
    4.92,
    19,
    'El Gouna & Red Sea Islands, Egypt',
    '/src/assets/images/egypt_speedboat_1784071721552.jpg',
    'Soar across the waves of the Red Sea like the sacred sky falcon Horus. This premium speedboat voyage lets you bypass the slow yachts and dive straight into the most secluded, untouched island reefs of the Red Sea. Tailor your route, stop at uninhabited sandbanks, and experience the thrill of high-speed pharaonic transport.',
    'Horus, the falcon-headed lord of skies, was famous for his unmatched speed and piercing vision. Pharaonic scouts used swift reed skiffs to patrol the shores with falcon-like swiftness, communicating back to the royal temples via mirrored light signals.',
    '["Private high-speed twin-engine luxury craft with certified captain", "Premium anti-fog snorkeling kits and underwater GoPro footage", "Iced organic hibiscus coolers and Egyptian artisan pastries", "VIP private sedan pickup directly from hotel entrance"]'::jsonb,
    '["Fly across turquoise channels at up to 65 km/h", "Private solitary swim stops at secluded shallow sandbars", "Uncrowded snorkeling at protected outer barrier reefs"]'::jsonb,
    '["Deep sea fishing gear", "Private chef onboard (available on request)"]'::jsonb,
    'published',
    false,
    8
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  base_price = EXCLUDED.base_price,
  description = EXCLUDED.description,
  ancient_lore = EXCLUDED.ancient_lore,
  inclusions = EXCLUDED.inclusions,
  highlights = EXCLUDED.highlights;

-- 4. Website Settings Defaults
INSERT INTO website_settings (key, value, category, description)
VALUES
  ('company_info', '{"name": "Kemet Spirit - Powered by Mas International Agency", "phone": "+20 100 000 0000", "whatsapp": "+20 100 000 0000", "email": "operations@kemetspirit.com", "address": "Sheraton Road, Marine Promenade, Hurghada, Egypt"}'::jsonb, 'general', 'Official company contact details and address'),
  ('operational_defaults', '{"default_currency": "USD", "timezone": "Africa/Cairo", "auto_confirm_bookings": false, "require_hotel_pickup_details": true, "cancellation_notice_hours": 24}'::jsonb, 'operations', 'Operating rules and default configurations'),
  ('promotional_banner', '{"is_active": true, "code": "KEMET30", "discount_percent": 30, "title": "Royal Sun Season Offering", "description": "Apply promo code KEMET30 during reservation to receive a 30% blessing on all excursions."}'::jsonb, 'marketing', 'Active public promotional banner')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value;
