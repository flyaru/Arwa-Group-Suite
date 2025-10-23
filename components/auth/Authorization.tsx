import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { User } from '../../types';

interface AuthorizationProps {
  allowedRoles?: User['role'][];
  children: React.ReactNode;
}

const Authorization: React.FC<AuthorizationProps> = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user) {
    // This should ideally not happen if used within a protected route context, but as a safeguard:
    return <Navigate to="/login" replace />;
  }

  // If no roles are specified, allow access once authenticated.
  if (!allowedRoles || allowedRoles.length === 0) {
      return <>{children}</>;
  }

  if (allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }
  
  // User's role is not in the allowed list
  return <Navigate to="/unauthorized" replace />; 
};

export default Authorization;