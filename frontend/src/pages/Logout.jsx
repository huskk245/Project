import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { logout } from '../utils/api';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout();
        localStorage.removeItem('token');
        toast.success('Logged out successfully!');
        navigate('/login');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Logout failed');
        navigate('/login');
      }
    };
    handleLogout();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-xl rounded-xl border border-green-200">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-green-700">
            Logging Out...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-lg text-gray-600">
            Please wait while we log you out.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Logout;