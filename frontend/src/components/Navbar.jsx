import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { getProfile, logout } from '../utils/api';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    try {
      const userData = await getProfile();
      setUser(userData);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setUser(null);
    }

    const handleStorageChange = () => {
      const newToken = localStorage.getItem('token');
      if (newToken) {
        fetchUser();
      } else {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('token');
      setUser(null);
      toast.success('Logged out successfully!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Logout failed');
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'farmer':
        return '/farmer-dashboard';
      case 'admin':
        return '/admin-dashboard';
      case 'consumer':
        return '/consumer-dashboard';
      case 'retailer':
        return '/retailer-dashboard';
      default:
        return '/login';
    }
  };

  return (
    <nav className="bg-green-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">
          FarmChain
        </Link>
        <div className="space-x-4">
          {user ? (
            <>
              <Link to={getDashboardPath()}>
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Dashboard
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Login
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;