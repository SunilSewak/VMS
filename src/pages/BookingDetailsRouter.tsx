/**
 * Booking Details Router
 * 
 * Routes users to appropriate booking view based on role:
 * - Admins: Admin Processing Workspace (new tabbed interface)
 * - Sales Heads: Original Booking Details (read-only view)
 */

import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../auth/permissions';
import { AdminProcessingWorkspace } from './AdminProcessingWorkspace';
import { BookingDetails } from './BookingDetails';

export function BookingDetailsRouter() {
  const { user } = useAuth();
  
  // Admin users get the new Processing Workspace
  const isAdmin = user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN;
  
  if (isAdmin) {
    return <AdminProcessingWorkspace />;
  }
  
  // Sales Heads and other users get the original detail view
  return <BookingDetails />;
}
