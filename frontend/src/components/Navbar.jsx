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
      default:
        return '/login';
    }
  };

  return (
    <nav className="bg-green-800 p-4 fixed top-0 left-0 w-full z-10 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold tracking-wide">
          FarmChain
        </Link>
        <div className="space-x-4">
          {user ? (
            <>
              <Link to={getDashboardPath()}>
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white text-lg font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Dashboard
                </Button>
              </Link>
              {user.role === 'farmer' && (
                <Link to="/product-tagging">
                  <Button
                    className="bg-green-500 hover:bg-green-600 text-white text-lg font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                  >
                    Tag Product
                  </Button>
                </Link>
              )}
              {user.role === 'consumer' && (
                <Link to="/track-product">
                  <Button
                    className="bg-green-500 hover:bg-green-600 text-white text-lg font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                  >
                    Track Product
                  </Button>
                </Link>
              )}
              <Button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white text-lg font-semibold py-2 px-4 rounded-lg transition-all duration-300"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/register">
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white text-lg font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Register
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white text-lg font-semibold py-2 px-4 rounded-lg transition-all duration-300"
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