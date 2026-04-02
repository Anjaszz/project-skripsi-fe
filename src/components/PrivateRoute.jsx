import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, requiredRole, redirectTo }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    if (redirectTo) return <Navigate to={redirectTo} replace />;
    
    // Auto-detect based on requiredRole if possible
    const isCustomerRoute = Array.isArray(requiredRole) 
      ? requiredRole.includes('customer') 
      : requiredRole === 'customer';
    
    return <Navigate to={isCustomerRoute ? "/auth" : "/login"} replace />;
  }

  const isAllowed = !requiredRole || 
                   (Array.isArray(requiredRole) ? requiredRole.includes(user.role) : user.role === requiredRole);

  if (requiredRole && !isAllowed) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
