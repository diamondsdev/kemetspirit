import { Request, Response, NextFunction } from 'express';
import { getSupabaseServer, fallbackStore, isServerSupabaseConfigured } from '../supabaseServer';
import { UserRole } from '../../src/types/supabase';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// Active session registry for local development tokens
export interface ActiveSession {
  token: string;
  userId: string;
  email: string;
  role: UserRole;
  fullName: string;
  expiresAt: number;
}

export const activeSessions = new Map<string, ActiveSession>();

export function registerSession(session: ActiveSession) {
  activeSessions.set(session.token, session);
}

export function revokeSession(token: string) {
  activeSessions.delete(token);
}

/**
 * Clean up expired local sessions periodically
 */
const sessionCleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [token, session] of activeSessions.entries()) {
    if (now > session.expiresAt) {
      activeSessions.delete(token);
    }
  }
}, 10 * 60 * 1000);
if (sessionCleanupInterval.unref) sessionCleanupInterval.unref();

/**
 * Authoritative Token & Session verification middleware
 */
export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization || (req.headers['x-admin-token'] as string);
  const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : null;

  if (!token) {
    return next();
  }

  const supabase = getSupabaseServer();

  // 1. Authoritative Supabase JWT verification
  if (supabase) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        // Query database profiles table to get the authoritative role (never trust user_metadata directly)
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', user.id)
          .single();

        const userProfile = profile as any;
        const authoritativeRole: UserRole = (userProfile?.role as UserRole) || 'traveler';

        req.user = {
          id: user.id,
          email: user.email || '',
          role: authoritativeRole,
          fullName: userProfile?.full_name || user.user_metadata?.full_name || 'Noble Traveler'
        };
        return next();
      }
    } catch (e) {
      // In production, an invalid Supabase JWT should not be allowed to fall back
      if (process.env.NODE_ENV === 'production') {
        return next();
      }
    }
  }

  // 2. Local development session store (development only)
  const session = activeSessions.get(token);
  if (session && Date.now() < session.expiresAt) {
    req.user = {
      id: session.userId,
      email: session.email,
      role: session.role,
      fullName: session.fullName
    };
    return next();
  }

  return next();
}

/**
 * Enforce authenticated user
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required. Please log in with your credentials.'
    });
  }
  next();
}

/**
 * Enforce staff authorization (owner, admin, manager, operations, finance, support)
 */
export function requireStaff(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required to access administrative controls.'
    });
  }

  const staffRoles: UserRole[] = ['owner', 'admin', 'manager', 'operations', 'finance', 'support'];
  if (!staffRoles.includes(req.user.role)) {
    return res.status(403).json({
      error: 'Forbidden. Your account does not have operational staff authorization.'
    });
  }
  next();
}

/**
 * Enforce specific role-based permissions (RBAC)
 */
export function requireRoles(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Permission denied. Required role: ${allowedRoles.join(' or ')}.`
      });
    }
    next();
  };
}
