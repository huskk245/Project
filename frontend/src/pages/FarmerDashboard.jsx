import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { getProfile, getFarmerProducts, deleteProduct } from '../utils/api';
import { CheckCircledIcon, TrashIcon } from '@radix-ui/react-icons';
import { MapPin, Clock, BluetoothConnected } from 'lucide-react';
import Spinner from '../components/ui/spinner';
import ProductDetails from '../components/ProductDetails';
import { trackRFIDInRealtime } from '../utils/firebase';

const FarmerDashboard = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rfidStatus, setRfidStatus] = useState({});
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const userData = await getProfile();
      if (!userData.profileCompleted) {
        navigate('/complete-profile');
        return;
      }
      const productData = await getFarmerProducts();
      console.log("Fetched products:", productData);
      setUser(userData);
      setProducts(productData);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  // Set up RFID tracking for all products
  useEffect(() => {
    const unsubscribers = {};

    // Clean up previous listeners
    Object.values(unsubscribers).forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') unsubscribe();
    });

    console.log("Setting up RFID tracking for products:", products);
    products.forEach(product => {
      if (product.rfid) {
        console.log(`Setting up tracking for product with RFID: ${product.rfid}`);
        unsubscribers[product._id] = trackRFIDInRealtime(product.rfid, (data) => {
          console.log(`RFID update for ${product.rfid}:`, data);
          setRfidStatus(prev => ({
            ...prev,
            [product._id]: data
          }));
        });
      }
    });

    // Cleanup when component unmounts
    return () => {
      console.log("Cleaning up RFID listeners");
      Object.values(unsubscribers).forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') unsubscribe();
      });
    };
  }, [products]);

  const handleDelist = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteProduct(productId);
      toast.success('Product delisted successfully');
      fetchData(); // Refresh the products list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delist product');
    }
  };

  const handleCardClick = (product) => {
    // Add current user information to the product when displaying details
    setSelectedProduct({
      ...product,
      farmer: user
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 p-4">
        <div className="container mx-auto pt-20">
          <Card className="w-full bg-white shadow-xl rounded-xl border border-green-200">
            <CardContent className="p-6">
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                <Spinner />
                <p className="mt-4 text-lg font-medium text-green-700">Loading dashboard...</p>
              </div>
              <h2 className="text-2xl font-bold text-green-700 mb-6">Farmer Dashboard</h2>
            </CardContent>
          </Card>
        </div>
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
                {user?.photo && (
                  <div className="mt-2">
                    <p className="text-gray-600"><strong>Photo:</strong></p>
                    <img
                      src={`http://localhost:5000${user.photo}`}
                      alt="Farmer Photo"
                      className="w-32 h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/128x128';
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
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No products added yet</p>
                <Link
                  to="/product-tagging"
                  className="inline-block bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Add New Product
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {products.map((product) => {
                  const productRfidStatus = rfidStatus[product._id];
                  const hasRfidData = productRfidStatus && productRfidStatus.entries && productRfidStatus.entries.length > 0;
                  const latestEntry = hasRfidData ? productRfidStatus.entries[0] : null;
                  
                  return (
                    <div
                      key={product._id}
                      className="relative cursor-pointer transition-transform hover:scale-105 bg-white rounded-lg shadow-md overflow-hidden"
                      onClick={() => handleCardClick(product)}
                    >
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click event
                          handleDelist(product._id);
                        }}
                        className="absolute top-2 right-2 bg-white text-red-600 hover:bg-red-50 z-10 rounded-full p-1.5 shadow-md"
                        aria-label="Delete product"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </Button>
                      <img
                        src={`http://localhost:5000${product.image}`}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/400x300?text=No+Image';
                          console.error('Failed to load image:', product.image);
                        }}
                      />
                      <div className="p-4">
                        <div className="space-y-1">
                          <p className="text-gray-600">Origin: {product.origin}</p>
                          <p className="text-gray-600">
                            Harvest Date: {new Date(product.harvestDate).toLocaleDateString()}
                          </p>
                          <p className="text-gray-600">Description: {product.description || 'N/A'}</p>
                          {product.rfid && (
                            <div className="mt-2 border-t pt-2">
                              <div className="flex items-center">
                                <BluetoothConnected className="h-4 w-4 text-blue-500 mr-1" />
                                <p className="text-gray-700 font-medium">
                                  RFID: <span className="font-bold">{product.rfid}</span>
                                </p>
                              </div>
                              <div className={`mt-1 ${hasRfidData ? 'text-green-600' : 'text-gray-400'}`}>
                                {hasRfidData ? (
                                  <div>
                                    <span className="flex items-center">
                                      <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                                      <span className="font-medium">
                                        {productRfidStatus.entries.length} location entries tracked
                                      </span>
                                    </span>
                                    {latestEntry && (
                                      <>
                                        <div className="mt-1 text-sm flex items-center">
                                          <MapPin className="h-3 w-3 mr-1" />
                                          Last seen at: Location {latestEntry.location}
                                        </div>
                                        <div className="text-sm flex items-center">
                                          <Clock className="h-3 w-3 mr-1" />
                                          {new Date(latestEntry.timestamp).toLocaleString()}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                ) : (
                                  <span className="flex items-center">
                                    <span className="inline-block h-2 w-2 rounded-full bg-gray-300 mr-2"></span>
                                    Waiting for RFID updates...
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className={`mt-4 p-3 rounded-lg ${product.isFresh ? 'bg-green-50' : 'bg-red-50'}`}>
                          <div className="flex items-center">
                            <span className={product.isFresh ? 'text-green-600' : 'text-red-600'}>
                              Freshness Status: {product.isFresh ? 'Fresh ✓' : 'Not Fresh ✗'}
                            </span>
                          </div>
                          <div className={product.isFresh ? 'text-green-600' : 'text-red-600'}>
                            Confidence Score: {product.freshnessScore}%
                          </div>
                          {product.predictedLabel && (
                            <div className={product.isFresh ? 'text-green-600' : 'text-red-600'}>
                              AI Classification: {product.predictedLabel}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default FarmerDashboard;