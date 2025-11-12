import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * This component checks if a user is logged in.
 * If they are, it renders the child route (using <Outlet />).
 * If not, it redirects them to the /login page.
 *
 * We can also add an 'allowedRole' prop to check for 'customer' or 'shopkeeper'.
 */
const ProtectedRoute = ({ allowedRole }) => {
  const { user } = useAuth();

  // 1. Check if user is logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check if a specific role is required and if the user has it
  if (allowedRole && user.role !== allowedRole) {
    // User is logged in, but doesn't have the right role
    // Send them to a "home" page (e.g., designer for customer)
    return <Navigate to={user.role === 'customer' ? '/designer' : '/'} replace />;
  }

  // 3. User is logged in and has the correct role (or no role was required)
  return <Outlet />; // This renders the component (e.g., DesignerPage or AdminDashboard)
};

export default ProtectedRoute;