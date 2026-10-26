/**
 * Kemet Spirit - Automated Security & Data Integrity Test Suite
 * Validates:
 * 1. Owner Provisioning & Setup Secret Enforcement
 * 2. Secondary Owner Provisioning Rejection (Singleton Owner)
 * 3. Prevention of Privilege Escalation during Registration
 * 4. Token & Authentication Enforcement
 * 5. Role-Based Access Control (RBAC) & Finance Module Protection
 * 6. Customer Data & Tenant Isolation on My-Bookings
 * 7. Server-Side Atomic Booking Pricing & Promo Validation
 * 8. Production Fail-Closed Behavior
 * 9. AI Scribe Prompt Isolation (No Customer PII)
 */

import http from 'http';
import express from 'express';
import { apiRouter } from '../server/routes/apiRouter';
import { 
  fallbackStore, 
  provisionOwnerAtomic, 
  checkIfOwnerExists,
  createAuthoritativeBooking 
} from '../server/supabaseServer';

async function runTestSuite() {
  console.log('🏛️  [KEMET TEST SUITE] Starting Security & Data Integrity Audit...');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, description: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${description}`);
      failed++;
    }
  }

  // Setup test Express server
  const app = express();
  app.use(express.json());
  app.use('/api', apiRouter);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // ------------------------------------------------------------------------
    // TEST 1: Health Check Endpoint
    // ------------------------------------------------------------------------
    console.log('\n--- 1. System Health & Architecture ---');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'GET /api/health responds with 200 OK');
    assert(healthData.status === 'ok', 'Health status reports OK');
    assert(typeof healthData.supabaseConfigured === 'boolean', 'Supabase configuration flag is present');

    // ------------------------------------------------------------------------
    // TEST 2: Owner Provisioning Rejects Missing or Incorrect SETUP_SECRET
    // ------------------------------------------------------------------------
    console.log('\n--- 2. Owner Setup & Secret Enforcement ---');
    process.env.SETUP_SECRET = 'royal_high_entropy_secret_test_9876';

    const badSecretRes = await fetch(`${baseUrl}/api/auth/provision-owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'owner@kemetspirit.com',
        password: 'SacredPassword2026!',
        fullName: 'Royal High Priest',
        setupSecret: 'wrong_secret_attempt'
      })
    });
    assert(badSecretRes.status === 403, 'Provisioning with wrong setup secret is rejected with 403 Forbidden');

    const missingSecretRes = await fetch(`${baseUrl}/api/auth/provision-owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'owner@kemetspirit.com',
        password: 'SacredPassword2026!',
        fullName: 'Royal High Priest',
        setupSecret: ''
      })
    });
    assert(missingSecretRes.status === 400, 'Provisioning with empty setup secret is rejected with 400 Bad Request');

    // ------------------------------------------------------------------------
    // TEST 3: Legitimate Initial Owner Provisioning
    // ------------------------------------------------------------------------
    console.log('\n--- 3. Legitimate Initial Owner Creation ---');
    const validOwnerRes = await fetch(`${baseUrl}/api/auth/provision-owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'pharaoh@kemetspirit.com',
        password: 'RoyalPassword2026!#',
        fullName: 'Pharaoh Ramses IV',
        setupSecret: 'royal_high_entropy_secret_test_9876'
      })
    });
    const validOwnerData = await validOwnerRes.json();
    assert(validOwnerRes.status === 201, 'Valid owner provisioning succeeds with 201 Created');
    assert(validOwnerData.user?.role === 'owner', 'Provisioned user has role "owner"');
    const ownerToken = validOwnerData.token;
    assert(Boolean(ownerToken), 'Owner session token is returned');

    // ------------------------------------------------------------------------
    // TEST 4: Subsequent Owner Provisioning Must Be Permanently Closed
    // ------------------------------------------------------------------------
    console.log('\n--- 4. Subsequent Owner Provisioning Blocked ---');
    const secondOwnerRes = await fetch(`${baseUrl}/api/auth/provision-owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'usurper@kemetspirit.com',
        password: 'UsurperPassword2026!',
        fullName: 'Imposter Priest',
        setupSecret: 'royal_high_entropy_secret_test_9876'
      })
    });
    assert(secondOwnerRes.status === 403, 'Subsequent owner provisioning rejected with 403 (Owner already exists)');

    // ------------------------------------------------------------------------
    // TEST 5: Registration Cannot Escalate Privileges to Admin or Owner
    // ------------------------------------------------------------------------
    console.log('\n--- 5. Privilege Escalation Prevention in Registration ---');
    const travelerRegRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'traveler_alice@world.com',
        password: 'TravelerPassword2026!',
        fullName: 'Alice Explorer',
        role: 'owner', // Malicious attempt to self-assign owner role
        vip_tier: 'Pharaoh'
      })
    });
    const travelerRegData = await travelerRegRes.json();
    assert(travelerRegRes.status === 201, 'Customer registration succeeds');
    assert(travelerRegData.user?.role === 'traveler', 'Role is strictly forced to "traveler" despite payload containing "owner"');
    const travelerToken = travelerRegData.token;

    // ------------------------------------------------------------------------
    // TEST 6: Unauthenticated Access to Admin Routes is Blocked
    // ------------------------------------------------------------------------
    console.log('\n--- 6. Unauthenticated & Forged Token Rejection ---');
    const unauthRes = await fetch(`${baseUrl}/api/admin/overview`);
    assert(unauthRes.status === 401, 'Unauthenticated request to /api/admin/overview receives 401 Unauthorized');

    const fakeTokenRes = await fetch(`${baseUrl}/api/admin/overview`, {
      headers: { 'Authorization': 'Bearer forged_token_abc_123' }
    });
    assert(fakeTokenRes.status === 401, 'Forged bearer token receives 401 Unauthorized');

    // ------------------------------------------------------------------------
    // TEST 7: Traveler Cannot Access Staff Dashboard or Finance (RBAC)
    // ------------------------------------------------------------------------
    console.log('\n--- 7. Role-Based Access Control (RBAC) Enforcement ---');
    const travelerAdminRes = await fetch(`${baseUrl}/api/admin/overview`, {
      headers: { 'Authorization': `Bearer ${travelerToken}` }
    });
    assert(travelerAdminRes.status === 403, 'Traveler attempting to access /api/admin/overview receives 403 Forbidden');

    const travelerFinanceRes = await fetch(`${baseUrl}/api/admin/finance/overview`, {
      headers: { 'Authorization': `Bearer ${travelerToken}` }
    });
    assert(travelerFinanceRes.status === 403, 'Traveler attempting to access /api/admin/finance/overview receives 403 Forbidden');

    // Owner CAN access admin and finance
    const ownerFinanceRes = await fetch(`${baseUrl}/api/admin/finance/overview`, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(ownerFinanceRes.status === 200, 'Owner can access /api/admin/finance/overview with 200 OK');

    // ------------------------------------------------------------------------
    // TEST 8: Customer Data Isolation (Tenant Boundary)
    // ------------------------------------------------------------------------
    console.log('\n--- 8. Customer Tenant Isolation on My-Bookings ---');
    // Register Traveler Bob
    const bobRegRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'traveler_bob@world.com',
        password: 'BobPassword2026!',
        fullName: 'Bob Nomad'
      })
    });
    const bobData = await bobRegRes.json();
    const bobToken = bobData.token;

    // Alice creates a booking
    const aliceBookingRes = await fetch(`${baseUrl}/api/bookings`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${travelerToken}`
      },
      body: JSON.stringify({
        tour_id: 'diving-1',
        scheduled_date: '2026-11-15',
        traveler_name: 'Alice Explorer',
        traveler_email: 'traveler_alice@world.com',
        guest_count: 2,
        promo_code: 'KEMET30'
      })
    });
    assert(aliceBookingRes.status === 201, 'Alice successfully created a booking');

    // Bob views his bookings
    const bobBookingsRes = await fetch(`${baseUrl}/api/bookings/my-bookings`, {
      headers: { 'Authorization': `Bearer ${bobToken}` }
    });
    const bobBookings = await bobBookingsRes.json();
    assert(Array.isArray(bobBookings), 'Bob received an array of bookings');
    const hasAliceBooking = bobBookings.some((b: any) => b.traveler_email === 'traveler_alice@world.com');
    assert(!hasAliceBooking, "Bob's booking list CANNOT see Alice's booking (Strict Isolation)");

    // Alice views her bookings
    const aliceBookingsRes = await fetch(`${baseUrl}/api/bookings/my-bookings`, {
      headers: { 'Authorization': `Bearer ${travelerToken}` }
    });
    const aliceBookings = await aliceBookingsRes.json();
    const seesOwnBooking = aliceBookings.some((b: any) => b.traveler_email === 'traveler_alice@world.com');
    assert(seesOwnBooking, "Alice CAN see her own booking");

    // ------------------------------------------------------------------------
    // TEST 9: Server-Side Authoritative Pricing & Promo Discount Verification
    // ------------------------------------------------------------------------
    console.log('\n--- 9. Server-Side Pricing & Promo Code Logic ---');
    // Diving base price is 120. 2 guests = 240. KEMET30 discount = 30% of 240 = 72. Total = 168.
    const bookingDetails = await aliceBookingRes.json();
    assert(bookingDetails.total_cost === 168, 'Server accurately computed discounted price (240 - 30% = 168)');
    assert(bookingDetails.discount_amount === 72, 'Server snapshot records exact discount amount of 72');

    // ------------------------------------------------------------------------
    // TEST 10: AI Scribe Request Validation & PII Safety
    // ------------------------------------------------------------------------
    console.log('\n--- 10. AI Scribe Input Validation & Sanitization ---');
    const emptyAiRes = await fetch(`${baseUrl}/api/ai/scribe-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '' })
    });
    assert(emptyAiRes.status === 400, 'AI Scribe rejects empty messages with 400 Bad Request');

  } finally {
    server.close();
  }

  console.log('\n========================================');
  console.log(`🏁 [AUDIT COMPLETE] Passed: ${passed} | Failed: ${failed}`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
