/**
 * Client Auth & API Gateway Helper
 * All client traffic routes exclusively through Express /api/* endpoints.
 * Direct browser access to Supabase is strictly disabled for security and data integrity.
 */

export const isSupabaseConfigured = true;

export async function getCurrentUser(): Promise<any | null> {
  const token = localStorage.getItem('kemet_session_token') || localStorage.getItem('kemet_admin_token');
  if (!token) return null;

  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

export async function signOutUser(): Promise<{ error: Error | null }> {
  const token = localStorage.getItem('kemet_session_token') || localStorage.getItem('kemet_admin_token');
  try {
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
  } catch (err: any) {
    return { error: err };
  } finally {
    localStorage.removeItem('kemet_session_token');
    localStorage.removeItem('kemet_admin_token');
    localStorage.removeItem('kemet_user');
    localStorage.removeItem('kemet_admin_verified');
  }
  return { error: null };
}

export const supabase = null;
