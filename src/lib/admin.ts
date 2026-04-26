/**
 * Check if a user is an admin.
 * Admin is detected by email matching NEXT_PUBLIC_ADMIN_EMAIL
 * or by user_metadata.role === 'admin'
 */
export function isAdmin(user: { email?: string; user_metadata?: Record<string, unknown> } | null | undefined): boolean {
  if (!user) return false;
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (adminEmail && user.email === adminEmail) return true;
  if (user.user_metadata?.role === 'admin') return true;
  return false;
}
