import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { getProfile, getFarmerProducts } from '../utils/api';

const FarmerDashboard = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getProfile();
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
        <Card className="w-full bg-white shadow-xl rounded-xl border border-green-200 mb-6">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-green-700">
              Farmer Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Welcome, {user?.username}!
            </h2>
            <p className="text-lg text-gray-600 mb-4">Role: {user?.role}</p>
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