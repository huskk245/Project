import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { getProfile, getAllProducts } from '../utils/api';
import { MapPin, Calendar, Tag, BarChart3, Scan } from 'lucide-react';
import Spinner from '../components/ui/spinner';

const RetailerInventory = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getProfile();
        if (userData.role !== 'retailer') {
          toast.error('Only retailers can access this page.');
          navigate('/');
          return;
        }
        
        setUser(userData);
        
        const productsData = await getAllProducts();
        console.log('Fetched products:', productsData);
        setProducts(productsData);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch data');
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Filter products based on search term and filter type
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.farmer.username && product.farmer.username.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && product.type === filterType;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 flex items-center justify-center">
        <Spinner />
        <p className="ml-2 text-lg text-blue-700">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 p-4">
      <div className="container mx-auto pt-20">
        <Card className="w-full bg-white shadow-xl rounded-xl border border-blue-200 mb-6">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-blue-700">
              Product Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by name, origin, or farmer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-full md:w-48">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="fruits">Fruits</option>
                    <option value="vegetables">Vegetables</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-2">No products found.</p>
                <p className="text-gray-500">Try adjusting your search or filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product._id} className="hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                    <div className="h-48 overflow-hidden">
                      <img
                        src={`http://localhost:5000${product.image}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/600x400?text=No+Image';
                        }}
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2 capitalize">
                        {product.name}
                      </h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                          <span>Origin: {product.origin}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                          <span>Harvested: {new Date(product.harvestDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Tag className="h-4 w-4 mr-2 text-blue-600" />
                          <span>Farmer: {product.farmer.username}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Scan className="h-4 w-4 mr-2 text-blue-600" />
                          <span>RFID: {product.rfid}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <BarChart3 className="h-4 w-4 mr-2 text-blue-600" />
                          <span>Freshness: 
                            <span className={`ml-1 font-medium ${product.freshnessScore > 70 ? 'text-green-600' : 'text-red-600'}`}>
                              {product.freshnessScore}%
                            </span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex space-x-2">
                        <Link to={`/track-product?id=${product._id}`} className="flex-1">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                            Track History
                          </Button>
                        </Link>
                        <Link to={`/product-verification?rfid=${product.rfid}`} className="flex-1">
                          <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                            Verify Freshness
                          </Button>
                        </Link>
                      </div>
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

export default RetailerInventory; 