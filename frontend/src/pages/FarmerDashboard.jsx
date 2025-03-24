import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { getProfile, getFarmerProducts } from '../utils/api';
import { CheckCircledIcon } from '@radix-ui/react-icons';

const FarmerDashboard = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getProfile();
        if (!userData.profileCompleted) {
          navigate('/complete-profile');
          return;
        }
        const productData = await getFarmerProducts();
        setUser(userData);
        setProducts(productData);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

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
        <Card className="w-full bg-white shadow-xl rounded-xl border border-green-200 mb-6">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-green-700 flex items-center">
              Farmer Dashboard
              {user?.verified && (
                <CheckCircledIcon className="h-8 w-8 text-green-500 ml-2" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Welcome, {user?.username}!
            </h2>
            <p className="text-lg text-gray-600 mb-2">Role: {user?.role}</p>
            {user?.profileCompleted && (
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Verification Status</h3>
                {user.verified ? (
                  <p className="text-green-600 font-semibold">Verified ✅</p>
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
                <p className="text-gray-600"><strong>Farm Size:</strong> {user.farmSize}</p>
                {user.photo && (
                  <div className="mt-2">
                    <p className="text-gray-600"><strong>Photo:</strong></p>
                    <img
                      src={`http://localhost:5000${user.photo}`} // Prepend the backend base URL
                      alt="Farmer Photo"
                      className="w-32 h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/128x128'; // Updated fallback image URL
                        console.error('Failed to load photo:', user.photo);
                      }}
                    />
                  </div>
                )}
              </div>
            )}
            <Link to="/product-tagging">
              <Button className="bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-3 px-6 rounded-lg transition-all duration-300">
                Add New Product
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="w-full bg-white shadow-xl rounded-xl border border-green-200">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-green-700">
              Your Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="text-lg text-gray-600">No products added yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product._id} className="bg-gray-50 shadow-md rounded-lg">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-green-600">
                        {product.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">Origin: {product.origin}</p>
                      <p className="text-gray-600">
                        Harvest Date: {new Date(product.harvestDate).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600">Description: {product.description || 'N/A'}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FarmerDashboard;