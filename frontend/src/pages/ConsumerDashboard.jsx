import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { getProfile } from '../utils/api';

const ConsumerDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getProfile();
        setUser(userData);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex items-center justify-center">
        <p className="text-lg text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 p-4">
      <div className="container mx-auto pt-20">
        <Card className="w-full bg-white shadow-xl rounded-xl border border-green-200">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-green-700">
              Consumer Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Welcome, {user?.username}!
            </h2>
            <p className="text-lg text-gray-600 mb-4">Role: {user?.role}</p>
            <Link to="/track-product">
              <Button className="bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-3 px-6 rounded-lg transition-all duration-300">
                Track a Product
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConsumerDashboard;   