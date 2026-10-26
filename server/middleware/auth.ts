import { Request, Response, NextFunction } from 'express';
import { getSupabaseServer, fallbackStore } from '../supabaseServer';
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

/**
 * Token and Session verification middleware
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

  // 1. Try Supabase JWT verification
  if (supabase) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        // Fetch profile to get real role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', user.id)
          .single();

        const userProfile = profile as any;
        req.user = {
          id: user.id,
          email: user.email || '',
          role: (userProfile?.role as UserRole) || 'traveler',
          fullName: userProfile?.full_name || user.user_metadata?.full_name || 'Traveler'
        };
        return next();
      }
    } catch (e) {
      // Continue to check local session store
    }
  }

  // 2. Check local secure session store (for staff / dev sessions)
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
      error: 'Authentication required. Please log in with your royal credentials.'
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
      error: 'Authentication required to access the High Priest Sanctuary.'
    });
  }

  const staffRoles: UserRole[] = ['owner', 'admin', 'manager', 'operations', 'finance', 'support'];
  if (!staffRoles.includes(req.user.role)) {
    return res.status(403).json({
      error: 'Forbidden. Your royal seal does not grant access to operational controls.'
    });
  }
  next();
}

/**
 * Enforce specific role-based permissions
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

// Active secure session registry
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
