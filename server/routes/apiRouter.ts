import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { 
  getSupabaseServer, 
  isServerSupabaseConfigured,
  fallbackStore, 
  checkIfOwnerExists,
  provisionOwnerAtomic,
  fetchPublishedTours, 
  fetchAllToursAdmin, 
  upsertTour, 
  deleteTourById, 
  createAuthoritativeBooking, 
  fetchBookingsAdmin, 
  fetchUserBookings,
  updateBookingStatusRecord, 
  checkInTicket,
  fetchFinanceOverview,
  recordFinancialTransaction,
  submitInquiry,
  fetchInquiriesAdmin,
  updateInquiryStatus,
  fetchApprovedReviews,
  fetchAllReviewsAdmin,
  submitReview,
  moderateReview,
  subscribeNewsletter,
  fetchSubscribersAdmin,
  fetchSettings,
  updateSettings,
  recordAuditLog,
  fetchAuditLogsAdmin
} from '../supabaseServer';
import { 
  authenticateToken, 
  requireAuth, 
  requireStaff, 
  requireRoles, 
  registerSession, 
  revokeSession, 
  AuthenticatedRequest 
} from '../middleware/auth';
import { authRateLimiter, setupRateLimiter } from '../middleware/rateLimiter';
import { UserRole } from '../../src/types/supabase';

export const apiRouter = express.Router();

// Apply token authentication across all API routes
apiRouter.use(authenticateToken);

// ============================================================================
// HEALTH & STATUS CHECK
// ============================================================================
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    backend: 'Kemet Authoritative Server (Node 22)',
    supabaseConfigured: isServerSupabaseConfigured,
    mode: isServerSupabaseConfigured ? 'production-supabase' : 'development-store'
  });
});

// ============================================================================
// OWNER PROVISIONING & AUTHENTICATION
// ============================================================================

/**
 * Controlled Initial Owner Provisioning:
 * Only permitted if NO owner exists yet, and requires a valid SETUP_SECRET from env.
 * Protected with dedicated rate-limiting and atomic in-flight mutex.
 */
apiRouter.post('/auth/provision-owner', setupRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, setupSecret } = req.body;
    if (!email || !password || !fullName || !setupSecret) {
      return res.status(400).json({ error: 'Email, password, full name, and setupSecret are required.' });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const result = await provisionOwnerAtomic({
      email,
      password,
      fullName,
      setupSecret,
      ipAddress: req.ip
    });

    const token = `kemet-session-${crypto.randomBytes(32).toString('hex')}`;
    registerSession({
      token,
      userId: result.userId,
      email: result.email,
      role: 'owner',
      fullName: result.fullName,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      message: 'Royal Sanctuary Owner successfully provisioned.',
      token,
      user: {
        id: result.userId,
        email: result.email,
        fullName: result.fullName,
        role: 'owner'
      }
    });
  } catch (err: any) {
    const status = err.message.includes('permanently closed') || err.message.includes('Invalid setup secret') ? 403 : 400;
    res.status(status).json({ error: err.message || 'Owner provisioning failed.' });
  }
});

/**
 * Staff and Traveler Login
 * Verifies credentials authoritatively against Supabase Auth or local hash store.
 * Backdoor and auto-admin escalation patterns have been strictly removed.
 */
apiRouter.post('/auth/login', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabaseServer();

    // 1. Authoritative Supabase Auth Verification
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });

        if (!error && data.session && data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const profileData = profile as any;
          const role = (profileData?.role as UserRole) || 'traveler';

          return res.json({
            success: true,
            token: data.session.access_token,
            user: {
              id: data.user.id,
              email: data.user.email,
              fullName: profileData?.full_name || data.user.user_metadata?.full_name || 'Noble Traveler',
              role
            }
          });
        }
      } catch (sbErr) {
        // Continue to check local dev store only if non-production
        if (process.env.NODE_ENV === 'production') {
          return res.status(401).json({ error: 'Invalid royal email or password.' });
        }
      }
    }

    // 2. Development Store Verification (Only when Supabase is unconfigured in development)
    if (process.env.NODE_ENV !== 'production') {
      const staff = fallbackStore.staffUsers.find(u => u.email.toLowerCase() === cleanEmail);
      if (staff && staff.passwordHash && staff.passwordSalt) {
        const hash = crypto.pbkdf2Sync(password, staff.passwordSalt, 10000, 64, 'sha512').toString('hex');
        if (hash === staff.passwordHash) {
          const token = `kemet-session-${crypto.randomBytes(32).toString('hex')}`;
          const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
          registerSession({
            token,
            userId: staff.id,
            email: staff.email,
            role: staff.role,
            fullName: staff.fullName,
            expiresAt
          });

          return res.json({
            success: true,
            token,
            user: {
              id: staff.id,
              email: staff.email,
              fullName: staff.fullName,
              role: staff.role
            }
          });
        }
      }
    }

    return res.status(401).json({ error: 'Invalid royal email or password.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

/**
 * Customer Registration
 * Strictly assigns 'traveler' role. Disallows role escalation.
 */
apiRouter.post('/auth/register', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, phone, whatsapp, hotelName, roomNumber } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabaseServer();
    let userId: string = crypto.randomUUID();
    let sessionToken: string | null = null;

    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || '',
            whatsapp: whatsapp || '',
            hotel_name: hotelName || '',
            room_number: roomNumber || '',
            role: 'traveler' // Strict traveler role
          }
        }
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      if (data.user) {
        userId = data.user.id;
        sessionToken = data.session?.access_token || null;

        // Upsert profile with strict 'traveler' role
        await (supabase.from('profiles') as any).upsert({
          id: userId,
          email: cleanEmail,
          full_name: fullName,
          phone: phone || null,
          whatsapp: whatsapp || null,
          hotel_name: hotelName || null,
          room_number: roomNumber || null,
          role: 'traveler',
          vip_tier: 'Noble',
          lead_status: 'Active Traveler',
          lead_score: 50
        });
      }
    } else {
      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({ error: 'Authoritative user registration service unavailable.' });
      }

      // Dev store user creation
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
      const newUser = {
        id: userId,
        email: cleanEmail,
        fullName,
        role: 'traveler' as UserRole,
        passwordHash: hash,
        passwordSalt: salt,
        phone: phone || '',
        whatsapp: whatsapp || '',
        hotelName: hotelName || '',
        roomNumber: roomNumber || '',
        createdAt: new Date().toISOString()
      };
      fallbackStore.staffUsers.push(newUser);

      sessionToken = `kemet-session-${crypto.randomBytes(32).toString('hex')}`;
      registerSession({
        token: sessionToken,
        userId: newUser.id,
        email: newUser.email,
        role: 'traveler',
        fullName: newUser.fullName,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
      });
    }

    res.status(201).json({
      success: true,
      token: sessionToken,
      user: {
        id: userId,
        email: cleanEmail,
        fullName,
        role: 'traveler'
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

/**
 * Check current authenticated session
 */
apiRouter.get('/auth/me', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ authenticated: false, error: 'Not authenticated' });
  }
  res.json({
    authenticated: true,
    user: req.user
  });
});

/**
 * Logout
 */
apiRouter.post('/auth/logout', (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    revokeSession(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ============================================================================
// TOURS & EXCURSIONS CATALOGUE
// ============================================================================

apiRouter.get('/tours', async (req: Request, res: Response) => {
  try {
    const tours = await fetchPublishedTours();
    res.json(tours);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve tours.' });
  }
});

apiRouter.get('/admin/tours', requireStaff, async (req: Request, res: Response) => {
  try {
    const tours = await fetchAllToursAdmin();
    res.json(tours);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve tours.' });
  }
});

apiRouter.post('/admin/tours', requireStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tourData = req.body;
    if (!tourData.title || !tourData.base_price) {
      return res.status(400).json({ error: 'Title and base price are required.' });
    }

    const saved = await upsertTour(tourData);

    await recordAuditLog({
      actor_id: req.user?.id,
      actor_email: req.user?.email || 'staff',
      actor_role: req.user?.role || 'staff',
      action: 'TOUR_UPSERT',
      entity_type: 'tour',
      entity_id: saved.id,
      status: 'SUCCESS',
      details: `Excursion "${saved.title}" saved by ${req.user?.email}.`
    });

    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save tour.' });
  }
});

apiRouter.delete('/admin/tours/:id', requireStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await deleteTourById(id);

    await recordAuditLog({
      actor_id: req.user?.id,
      actor_email: req.user?.email || 'staff',
      actor_role: req.user?.role || 'staff',
      action: 'TOUR_DELETED',
      entity_type: 'tour',
      entity_id: id,
      status: 'SUCCESS',
      details: `Tour ID ${id} deleted by ${req.user?.email}.`
    });

    res.json({ success: true, message: 'Excursion successfully deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete tour.' });
  }
});

// ============================================================================
// BOOKINGS & OPERATIONS
// ============================================================================

/**
 * Public & Customer Booking Submission
 */
apiRouter.post('/bookings', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      tour_id,
      scheduled_date,
      traveler_name,
      traveler_email,
      phone_number,
      whatsapp_number,
      hotel_name,
      room_number,
      pickup_location,
      guest_count,
      promo_code,
      special_requests
    } = req.body;

    if (!tour_id || !scheduled_date || !traveler_name || !traveler_email) {
      return res.status(400).json({
        error: 'Missing required booking fields: excursion, date, name, and email.'
      });
    }

    const result = await createAuthoritativeBooking({
      customer_id: req.user?.id || null,
      tour_id,
      scheduled_date,
      traveler_name,
      traveler_email,
      phone_number,
      whatsapp_number,
      hotel_name,
      room_number,
      pickup_location,
      guest_count: Number(guest_count) || 1,
      promo_code,
      special_requests
    });

    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Booking reservation could not be processed.' });
  }
});

/**
 * Traveler's Own Bookings (Strict Isolation)
 */
apiRouter.get('/bookings/my-bookings', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userEmail = req.user?.email;
    const userId = req.user?.id;
    const userBookings = await fetchUserBookings(userId, userEmail);
    res.json(userBookings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Staff Bookings Management
 */
apiRouter.get('/admin/bookings', requireStaff, async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    const search = req.query.search as string;
    const bookings = await fetchBookingsAdmin({ status, search });
    res.json(bookings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/admin/bookings/:id/status', requireStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, internal_notes } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required.' });

    const updated = await updateBookingStatusRecord(
      id,
      status,
      internal_notes,
      req.user?.email
    );

    await recordAuditLog({
      actor_id: req.user?.id,
      actor_email: req.user?.email || 'staff',
      actor_role: req.user?.role || 'staff',
      action: 'BOOKING_STATUS_UPDATE',
      entity_type: 'booking',
      entity_id: id,
      status: 'SUCCESS',
      details: `Status of booking ${id} updated to ${status}.`
    });

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/admin/bookings/check-in', requireStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Booking reference or QR code payload required.' });

    const staffName = req.user?.fullName || req.user?.email || 'Staff';
    const checkedIn = await checkInTicket(code.trim(), staffName);

    res.json({
      success: true,
      message: `Verified and checked in: ${checkedIn.traveler_name} (${checkedIn.booking_reference})`,
      booking: checkedIn
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================================================
// FINANCE & TRANSACTION LEDGER
// ============================================================================

apiRouter.get('/admin/finance/overview', requireRoles(['owner', 'admin', 'finance']), async (req: Request, res: Response) => {
  try {
    const financeData = await fetchFinanceOverview();
    res.json(financeData);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/admin/finance/transactions', requireRoles(['owner', 'admin', 'finance']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { booking_id, transaction_type, amount, payment_method, notes } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Valid transaction amount required.' });
    }

    const recorded = await recordFinancialTransaction({
      booking_id,
      transaction_type: transaction_type || 'payment',
      amount: Number(amount),
      payment_method,
      notes,
      recorded_by: req.user?.email
    });

    await recordAuditLog({
      actor_id: req.user?.id,
      actor_email: req.user?.email || 'finance',
      actor_role: req.user?.role || 'finance',
      action: 'TRANSACTION_RECORDED',
      entity_type: 'transaction',
      entity_id: recorded.id,
      status: 'SUCCESS',
      details: `${transaction_type || 'payment'} of $${amount} recorded.`
    });

    res.status(201).json(recorded);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// CUSTOMER CRM & INQUIRIES
// ============================================================================

apiRouter.post('/crm/inquiries', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required.' });
    }

    const inquiry = await submitInquiry({
      customer_id: req.user?.id || null,
      name,
      email,
      phone,
      subject,
      message
    });

    res.status(201).json({ success: true, message: 'Inquiry received by our High Priests.', inquiry });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/admin/crm/inquiries', requireStaff, async (req: Request, res: Response) => {
  try {
    const inquiries = await fetchInquiriesAdmin();
    res.json(inquiries);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/admin/crm/inquiries/:id', requireStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, internal_notes, priority } = req.body;
    const updated = await updateInquiryStatus(id, { status, internal_notes, priority });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// REVIEWS & MODERATION
// ============================================================================

apiRouter.get('/reviews', async (req: Request, res: Response) => {
  try {
    const approved = await fetchApprovedReviews();
    res.json(approved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/reviews', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tour_id, rating, comment, avatar } = req.body;
    if (!tour_id || !rating || !comment) {
      return res.status(400).json({ error: 'Tour ID, rating (1-5), and review text required.' });
    }

    const review = await submitReview({
      tour_id,
      customer_id: req.user?.id || null,
      author_name: req.user?.fullName || 'Traveler',
      avatar,
      rating,
      comment
    });

    res.status(201).json({
      success: true,
      message: 'Your review was received and will appear once verified by our Scribes.',
      review
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/admin/reviews', requireStaff, async (req: Request, res: Response) => {
  try {
    const reviews = await fetchAllReviewsAdmin();
    res.json(reviews);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/admin/reviews/:id/moderate', requireStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await moderateReview(id, status, req.user?.id);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// NEWSLETTER
// ============================================================
apiRouter.post('/newsletter/subscribe', async (req: Request, res: Response) => {
  try {
    const { email, interests } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address required.' });
    }

    const subscriber = await subscribeNewsletter(email, interests);
    res.status(201).json({
      success: true,
      message: 'Welcome to Kemet Spirit. Your 30% discount code is KEMET30.',
      promo_code: 'KEMET30',
      subscriber
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/admin/newsletter', requireStaff, async (req: Request, res: Response) => {
  try {
    const list = await fetchSubscribersAdmin();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// OPERATIONAL ADMIN OVERVIEW
// ============================================================================

apiRouter.get('/admin/overview', requireStaff, async (req: Request, res: Response) => {
  try {
    const [bookings, inquiries, reviews, financeData] = await Promise.all([
      fetchBookingsAdmin(),
      fetchInquiriesAdmin(),
      fetchAllReviewsAdmin(),
      fetchFinanceOverview()
    ]);

    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'pending_approval').length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingToday = bookings.filter(b => b.scheduled_date === todayStr);

    const unreadInquiries = inquiries.filter(i => i.status === 'new').length;
    const pendingReviews = reviews.filter(r => r.status === 'pending').length;

    res.json({
      metrics: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        todayDepartures: upcomingToday.length,
        collectedRevenue: financeData.totalCollected,
        unreadInquiries,
        pendingReviews
      },
      todayDeparturesList: upcomingToday,
      recentBookings: bookings.slice(0, 5),
      systemStatus: {
        supabaseActive: isServerSupabaseConfigured,
        serverTime: new Date().toISOString()
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/admin/audit-logs', requireStaff, async (req: Request, res: Response) => {
  try {
    const logs = await fetchAuditLogsAdmin();
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/settings', async (req: Request, res: Response) => {
  try {
    const settings = await fetchSettings();
    res.json({
      company: settings.company_info,
      operational: settings.operational_defaults,
      promo: settings.promotional_banner
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/admin/settings', requireStaff, async (req: Request, res: Response) => {
  try {
    const settings = await fetchSettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/admin/settings', requireRoles(['owner', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, settings } = req.body;
    if (!category || !settings) return res.status(400).json({ error: 'Category and settings required.' });
    
    const updated = await updateSettings(category, settings, req.user?.id);

    await recordAuditLog({
      actor_id: req.user?.id,
      actor_email: req.user?.email || 'admin',
      actor_role: req.user?.role || 'admin',
      action: 'SETTINGS_UPDATE',
      entity_type: 'settings',
      entity_id: category,
      status: 'SUCCESS',
      details: `Settings category "${category}" updated.`
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// GEMINI SERVER-SIDE AI INTEGRATION (Scribe Oracle & Itinerary Planner)
// ============================================================================

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured on the server.');
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'kemet-spirit-backend' } }
    });
  }
  return aiClient;
}

apiRouter.post('/ai/scribe-chat', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    // Safety: sanitize input length
    const cleanMessage = message.slice(0, 1000).trim();

    // Context contains only public catalog metadata (NO customer or booking PII)
    const tours = await fetchPublishedTours();
    const tourList = tours.map(t => `- ${t.title} (${t.duration}, $${t.base_price})`).join('\n');

    const prompt = `You are Sennedjem, the wise Royal Scribe of Kemet Spirit. You speak in a polite, atmospheric Pharaonic style (referring to Ra, Isis, the golden desert, and the turquoise waters of the Red Sea).
Available tours in our sanctuary:
${tourList}

Traveler message: "${cleanMessage}"

Respond concisely (1-2 paragraphs) in the exact language of the user, guiding them through Egypt's treasures and excursions.`;

    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });

    res.json({ response: response.text || 'May Ra illuminate your path, traveler.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'AI Scribe could not be summoned.' });
  }
});
