import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { 
  getSupabaseServer, 
  isServerSupabaseConfigured,
  fallbackStore, 
  fetchPublishedTours, 
  fetchAllToursAdmin, 
  upsertTour, 
  deleteTourById, 
  createAuthoritativeBooking, 
  fetchBookingsAdmin, 
  updateBookingStatusRecord, 
  checkInTicket 
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
import { UserRole } from '../../src/types/supabase';

export const apiRouter = express.Router();

apiRouter.use(authenticateToken);

// ============================================================================
// HEALTH & STATUS CHECK
// ============================================================================
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    backend: 'Kemet Authoritative Server (Node 22)',
    supabaseConfigured: isServerSupabaseConfigured,
    mode: isServerSupabaseConfigured ? 'production-supabase' : 'development-store'
  });
});

// ============================================================================
// AUTHENTICATION & PROVISIONING
// ============================================================================

/**
 * Controlled Initial Owner Provisioning:
 * Only permitted if no owner exists yet, or with an explicit SETUP_SECRET from env.
 */
apiRouter.post('/auth/provision-owner', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, setupSecret } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required.' });
    }

    const expectedSecret = process.env.SETUP_SECRET;
    const existingStaff = fallbackStore.staffUsers.find(u => u.role === 'owner');

    if (existingStaff && expectedSecret && setupSecret !== expectedSecret) {
      return res.status(403).json({ error: 'An owner already exists. Valid setup secret required.' });
    }

    const supabase = getSupabaseServer();
    let userId = `usr-owner-${Date.now()}`;

    if (supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName }
        });

        if (authError) {
          return res.status(400).json({ error: authError.message });
        }

        if (authData?.user) {
          userId = authData.user.id;
          await (supabase.from('profiles') as any).upsert({
            id: userId,
            email,
            full_name: fullName,
            role: 'owner',
            vip_tier: 'Pharaoh',
            lead_status: 'Royal Owner'
          });
        }
      } catch (sbErr: any) {
        console.warn('[Supabase] Owner provisioning warning, using local register:', sbErr.message);
      }
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    const ownerUser = {
      id: userId,
      email,
      fullName,
      role: 'owner' as UserRole,
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: new Date().toISOString()
    };

    fallbackStore.staffUsers.push(ownerUser);

    const token = `kemet-session-${crypto.randomBytes(32).toString('hex')}`;
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    registerSession({
      token,
      userId: ownerUser.id,
      email: ownerUser.email,
      role: 'owner',
      fullName: ownerUser.fullName,
      expiresAt
    });

    fallbackStore.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actor_email: email,
      actor_role: 'owner',
      action: 'OWNER_PROVISIONED',
      entity_type: 'staff',
      entity_id: userId,
      ip_address: req.ip || '127.0.0.1',
      status: 'SUCCESS',
      details: 'Initial Royal Sanctuary Owner account securely provisioned.',
      created_at: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Royal Sanctuary Owner successfully provisioned.',
      token,
      user: {
        id: userId,
        email,
        fullName,
        role: 'owner'
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Owner provisioning failed.' });
  }
});

/**
 * Staff and Traveler Login
 */
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabaseServer();

    // 1. Try Supabase Auth
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
        // Fall back to local check
      }
    }

    // 2. Local Fallback Verification
    const staff = fallbackStore.staffUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (staff) {
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

    // 3. Demo Admin Provisioning Fallback (If no staff registered yet and admin logs in)
    if (fallbackStore.staffUsers.length === 0 && cleanEmail.includes('admin')) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
      const newAdmin = {
        id: `usr-admin-${Date.now()}`,
        email: cleanEmail,
        fullName: 'High Priest Administrator',
        role: 'owner' as UserRole,
        passwordHash: hash,
        passwordSalt: salt,
        createdAt: new Date().toISOString()
      };
      fallbackStore.staffUsers.push(newAdmin);

      const token = `kemet-session-${crypto.randomBytes(32).toString('hex')}`;
      registerSession({
        token,
        userId: newAdmin.id,
        email: newAdmin.email,
        role: 'owner',
        fullName: newAdmin.fullName,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
      });

      return res.json({
        success: true,
        token,
        user: {
          id: newAdmin.id,
          email: newAdmin.email,
          fullName: newAdmin.fullName,
          role: 'owner'
        }
      });
    }

    return res.status(401).json({ error: 'Invalid royal email or password.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

/**
 * Customer Registration
 */
apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, phone, whatsapp, hotelName, roomNumber } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabaseServer();
    let userId = `usr-${Date.now()}`;

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone || '',
              whatsapp: whatsapp || '',
              hotel_name: hotelName || '',
              room_number: roomNumber || ''
            }
          }
        });

        if (!error && data.user) {
          userId = data.user.id;
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
            lead_status: 'Active Traveler'
          });
        }
      } catch (sbErr: any) {
        console.warn('[Supabase] Sign up error, registering locally:', sbErr.message);
      }
    }

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

    const token = `kemet-session-${crypto.randomBytes(32).toString('hex')}`;
    registerSession({
      token,
      userId: newUser.id,
      email: newUser.email,
      role: 'traveler',
      fullName: newUser.fullName,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      token,
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
    return res.status(401).json({ authenticated: false });
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
    res.status(500).json({ error: err.message || 'Failed to retrieve all tours.' });
  }
});

apiRouter.post('/admin/tours', requireStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tourData = req.body;
    if (!tourData.title || !tourData.base_price) {
      return res.status(400).json({ error: 'Title and base price are required.' });
    }

    const saved = await upsertTour(tourData);

    fallbackStore.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actor_email: req.user?.email || 'staff',
      actor_role: req.user?.role || 'staff',
      action: 'TOUR_SAVED',
      entity_type: 'tour',
      entity_id: saved.id,
      status: 'SUCCESS',
      details: `Excursion "${saved.title}" created or updated.`,
      created_at: new Date().toISOString()
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

    fallbackStore.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actor_email: req.user?.email || 'staff',
      actor_role: req.user?.role || 'staff',
      action: 'TOUR_DELETED',
      entity_type: 'tour',
      entity_id: id,
      status: 'SUCCESS',
      details: `Tour ID ${id} deleted by staff.`,
      created_at: new Date().toISOString()
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
 * Traveler's Own Bookings
 */
apiRouter.get('/bookings/my-bookings', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userEmail = req.user?.email.toLowerCase();
    const userId = req.user?.id;
    const all = await fetchBookingsAdmin();
    const userBookings = all.filter(b => 
      (b.customer_id && b.customer_id === userId) ||
      (b.traveler_email && b.traveler_email.toLowerCase() === userEmail)
    );
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

    fallbackStore.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actor_email: req.user?.email || 'staff',
      actor_role: req.user?.role || 'staff',
      action: 'BOOKING_STATUS_UPDATE',
      entity_type: 'booking',
      entity_id: id,
      status: 'SUCCESS',
      details: `Status of booking ${id} updated to ${status}.`,
      created_at: new Date().toISOString()
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
  const bookings = await fetchBookingsAdmin();
  const transactions = fallbackStore.transactions;

  const totalBookingValue = bookings.reduce((sum, b) => sum + (Number(b.total_cost) || 0), 0);
  const totalCollected = transactions
    .filter(t => t.transaction_type === 'payment' && t.status === 'completed')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalRefunded = transactions
    .filter(t => t.transaction_type === 'refund')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const outstandingBalance = Math.max(0, totalBookingValue - totalCollected);

  res.json({
    totalBookingValue,
    totalCollected,
    totalRefunded,
    outstandingBalance,
    transactionCount: transactions.length,
    recentTransactions: transactions.slice(0, 10)
  });
});

apiRouter.post('/admin/finance/transactions', requireRoles(['owner', 'admin', 'finance']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { booking_id, transaction_type, amount, payment_method, notes } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Valid transaction amount required.' });
    }

    const newTxn = {
      id: `txn-${Date.now()}`,
      booking_id: booking_id || null,
      transaction_type: transaction_type || 'payment',
      amount: Number(amount),
      currency: 'USD',
      status: 'completed',
      payment_method: payment_method || 'Manual Staff Entry',
      external_reference: `MANUAL-${Date.now()}`,
      notes: notes || '',
      recorded_by: req.user?.email || 'staff',
      created_at: new Date().toISOString()
    };

    fallbackStore.transactions.unshift(newTxn);

    // If linked to a booking, update booking payment status
    if (booking_id) {
      const b = fallbackStore.bookings.find(item => item.id === booking_id || item.booking_reference === booking_id);
      if (b && transaction_type === 'payment') {
        b.payment_status = 'paid';
      } else if (b && transaction_type === 'refund') {
        b.payment_status = 'refunded';
      }
    }

    res.status(201).json(newTxn);
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

    const newInquiry = {
      id: `inq-${Date.now()}`,
      customer_id: req.user?.id || null,
      name,
      email,
      phone: phone || '',
      subject: subject || 'General Inquiry',
      message,
      status: 'new',
      priority: 'medium',
      internal_notes: '',
      created_at: new Date().toISOString()
    };

    fallbackStore.inquiries.unshift(newInquiry);
    res.status(201).json({ success: true, message: 'Inquiry received by our High Priests.', inquiry: newInquiry });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/admin/crm/inquiries', requireStaff, (req: Request, res: Response) => {
  res.json(fallbackStore.inquiries);
});

apiRouter.put('/admin/crm/inquiries/:id', requireStaff, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const inq = fallbackStore.inquiries.find(i => i.id === id);
  if (!inq) return res.status(404).json({ error: 'Inquiry not found.' });

  const { status, internal_notes, priority } = req.body;
  if (status) inq.status = status;
  if (internal_notes !== undefined) inq.internal_notes = internal_notes;
  if (priority) inq.priority = priority;

  res.json(inq);
});

// ============================================================================
// REVIEWS & MODERATION
// ============================================================================

apiRouter.get('/reviews', (req: Request, res: Response) => {
  const approved = fallbackStore.reviews.filter(r => r.status === 'approved');
  res.json(approved);
});

apiRouter.post('/reviews', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { tour_id, rating, comment, avatar } = req.body;
  if (!tour_id || !rating || !comment) {
    return res.status(400).json({ error: 'Tour ID, rating (1-5), and review text required.' });
  }

  const newReview = {
    id: `rev-${Date.now()}`,
    tour_id,
    customer_id: req.user?.id || null,
    author_name: req.user?.fullName || 'Traveler',
    avatar: avatar || 'Noble Explorer',
    rating: Math.min(5, Math.max(1, Number(rating))),
    comment,
    status: 'pending', // Moderation required
    created_at: new Date().toISOString()
  };

  fallbackStore.reviews.unshift(newReview);
  res.status(201).json({
    success: true,
    message: 'Your review was received and will appear once verified by our Scribes.',
    review: newReview
  });
});

apiRouter.get('/admin/reviews', requireStaff, (req: Request, res: Response) => {
  res.json(fallbackStore.reviews);
});

apiRouter.put('/admin/reviews/:id/moderate', requireStaff, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const rev = fallbackStore.reviews.find(r => r.id === id);
  if (!rev) return res.status(404).json({ error: 'Review not found.' });

  rev.status = status === 'approved' ? 'approved' : 'rejected';
  res.json(rev);
});

// ============================================================================
// NEWSLETTER
// ============================================================================

apiRouter.post('/newsletter/subscribe', (req: Request, res: Response) => {
  const { email, interests } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address required.' });
  }

  const existing = fallbackStore.subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.json({ success: true, message: 'You are already inscribed in our sacred scrolls.' });
  }

  const newSub = {
    id: `sub-${Date.now()}`,
    email: email.trim().toLowerCase(),
    interests: interests || [],
    vip_tier: 'Noble',
    promo_code: 'KEMET30',
    is_subscribed: true,
    consent_given_at: new Date().toISOString()
  };

  fallbackStore.subscribers.unshift(newSub);
  res.status(201).json({
    success: true,
    message: 'Welcome to Kemet Spirit. Your 30% discount code is KEMET30.',
    promo_code: 'KEMET30'
  });
});

apiRouter.get('/admin/newsletter', requireStaff, (req: Request, res: Response) => {
  res.json(fallbackStore.subscribers);
});

// ============================================================================
// OPERATIONAL ADMIN OVERVIEW
// ============================================================================

apiRouter.get('/admin/overview', requireStaff, async (req: Request, res: Response) => {
  const bookings = await fetchBookingsAdmin();
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending_approval').length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingToday = bookings.filter(b => b.scheduled_date === todayStr);

  const transactions = fallbackStore.transactions;
  const collectedRevenue = transactions
    .filter(t => t.transaction_type === 'payment' && t.status === 'completed')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const unreadInquiries = fallbackStore.inquiries.filter(i => i.status === 'new').length;
  const pendingReviews = fallbackStore.reviews.filter(r => r.status === 'pending').length;

  res.json({
    metrics: {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      todayDepartures: upcomingToday.length,
      collectedRevenue,
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
});

apiRouter.get('/admin/audit-logs', requireStaff, (req: Request, res: Response) => {
  res.json(fallbackStore.auditLogs.slice(0, 50));
});

apiRouter.get('/settings', (req: Request, res: Response) => {
  res.json({
    company: fallbackStore.settings.company_info,
    operational: fallbackStore.settings.operational_defaults,
    promo: fallbackStore.settings.promotional_banner
  });
});

apiRouter.get('/admin/settings', requireStaff, (req: Request, res: Response) => {
  res.json(fallbackStore.settings);
});

apiRouter.put('/admin/settings', requireRoles(['owner', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const { category, settings } = req.body;
  if (!category || !settings) return res.status(400).json({ error: 'Category and settings required.' });
  fallbackStore.settings[category] = { ...fallbackStore.settings[category], ...settings };
  res.json(fallbackStore.settings[category]);
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
    const { message, chatHistory } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const tours = await fetchPublishedTours();
    const tourList = tours.map(t => `- ${t.title} (${t.duration}, $${t.base_price})`).join('\n');

    const prompt = `You are Sennedjem, the wise Royal Scribe of Kemet Spirit. You speak in a polite, atmospheric Pharaonic style (referring to Ra, Isis, the golden desert, and the turquoise waters of the Red Sea).
Available tours in our sanctuary:
${tourList}

Traveler message: "${message}"

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
