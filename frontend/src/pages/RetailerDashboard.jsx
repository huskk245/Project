import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { getProfile } from '../utils/api';
import { CheckCircledIcon } from '@radix-ui/react-icons';
import { Store, ShoppingBag, Camera } from 'lucide-react';
import Spinner from '../components/ui/spinner';

const RetailerDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const userData = await getProfile();
      if (!userData.profileCompleted) {
        navigate('/complete-retailer-profile');
        return;
      }
      
      if (userData.role !== 'retailer') {
        navigate('/');
        return;
      }
      
      setUser(userData);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 p-4">
        <div className="container mx-auto pt-20">
          <Card className="w-full bg-white shadow-xl rounded-xl border border-blue-200">
            <CardContent className="p-6">
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                <Spinner />
                <p className="mt-4 text-lg font-medium text-blue-700">Loading dashboard...</p>
              </div>
              <h2 className="text-2xl font-bold text-blue-700 mb-6">Retailer Dashboard</h2>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 p-4">
      <div className="container mx-auto pt-20">
        <Card className="w-full bg-white shadow-xl rounded-xl border border-blue-200 mb-6">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-blue-700 flex items-center">
              Retailer Dashboard
              {user?.verified && (
                <CheckCircledIcon className="h-8 w-8 text-blue-500 ml-2" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Welcome, {user?.username}!
            </h2>
            <p className="text-lg text-gray-600 mb-2">Store: {user?.storeName}</p>
            {user?.profileCompleted && (
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Verification Status</h3>
                {user.verified ? (
                  <p className="text-blue-600 font-semibold">Verified ✅</p>
                ) : (
                  <p className={user.verificationStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'}>
                    {user.verificationStatus === 'pending'
                      ? 'Pending Verification ⏳'
                      : 'Verification Rejected ❌'}
                  </p>
                )}
              </div>
            )}
            {user?.profileCompleted && (
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Profile Details</h3>
                <p className="text-gray-600"><strong>Phone Number:</strong> {user.phoneNumber}</p>
                <p className="text-gray-600"><strong>Date of Birth:</strong> {user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A'}</p>
                <p className="text-gray-600"><strong>Address:</strong> {user.address}</p>
                <p className="text-gray-600"><strong>Store Type:</strong> {user.storeType}</p>
                {user?.photo && (
                  <div className="mt-2">
                    <p className="text-gray-600"><strong>Photo:</strong></p>
                    <img
                      src={`http://localhost:5000${user.photo}`}
                      alt="Retailer Photo"
                      className="w-32 h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/128x128';
                        console.error('Failed to load photo:', user.photo);
                      }}
                    />
                  </div>
                )}
                {user?.businessLicense && (
                  <div className="mt-2">
                    <p className="text-gray-600"><strong>Business License:</strong></p>
                    <a 
                      href={`http://localhost:5000${user.businessLicense}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Business License
                    </a>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white shadow-xl rounded-xl border border-blue-200 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Inventory</h3>
              <p className="text-gray-600 mb-4">Manage your product inventory</p>
              <Link to="/retailer-inventory">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  View Inventory
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-xl rounded-xl border border-blue-200 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Store className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Track Products</h3>
              <p className="text-gray-600 mb-4">Track product journey and authenticity</p>
              <Link to="/track-product">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Track Products
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-xl rounded-xl border border-blue-200 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Camera className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Verify Freshness</h3>
              <p className="text-gray-600 mb-4">Check product quality and freshness</p>
              <Link to="/product-verification">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Verify Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RetailerDashboard; 