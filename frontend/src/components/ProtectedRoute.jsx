import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getProfile } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getProfile();
        setUser(userData);

        // Redirect based on user role
        const pathname = window.location.pathname;
        
        // Skip redirects for special paths that should be accessible
        const specialPaths = [
          '/track-product', 
          '/product-tagging', 
          '/complete-profile', 
          '/complete-retailer-profile',
          '/product-verification' // Add product-verification to special paths
        ];
        
        if (specialPaths.includes(pathname)) {
          setLoading(false);
          return;
        }
        
        // First check: redirect to profile completion if not completed
        if (!userData.profileCompleted) {
          if (userData.role === 'farmer' && pathname !== '/complete-profile') {
            navigate('/complete-profile');
            return;
          } else if (userData.role === 'retailer' && pathname !== '/complete-retailer-profile') {
            navigate('/complete-retailer-profile');
            return;
          }
        }
        
        // Second check: redirect based on role if profile is completed
        if (userData.profileCompleted) {
          // Prevent auto-redirect for paths that include the role name
          const matchesRole = (
            (userData.role === 'farmer' && pathname.includes('/farmer')) ||
            (userData.role === 'consumer' && pathname.includes('/consumer')) ||
            (userData.role === 'admin' && pathname.includes('/admin')) ||
            (userData.role === 'retailer' && (
              pathname.includes('/retailer') || 
              pathname === '/product-verification' || // Allow product-verification
              pathname === '/track-product' // Allow track-product
            ))
          );
          
          if (!matchesRole) {
            // Only redirect if not on a matching path
            if (userData.role === 'farmer') {
              navigate('/farmer-dashboard');
            } else if (userData.role === 'consumer') {
              navigate('/consumer-dashboard');
            } else if (userData.role === 'admin') {
              navigate('/admin-dashboard');
            } else if (userData.role === 'retailer') {
              navigate('/retailer-dashboard');
            }
            return;
          }
        }
      } catch (error) {
        console.error("Protected route error:", error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex items-center justify-center">
        <p className="text-lg text-gray-700">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;