import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { getProfile, addProduct } from '../utils/api';

const ProductTagging = () => {
  const [formData, setFormData] = useState({
    name: '',
    origin: '',
    harvestDate: '',
    description: '',
  });
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getProfile();
        if (userData.role !== 'farmer') {
          toast.error('Only farmers can access this page.');
          navigate('/');
          return;
        }
        setIsVerified(userData.verified);
        setLoading(false);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch user data');
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  const { name, origin, harvestDate, description } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!name) {
      toast.error('Product name is required');
      return;
    }
    if (!origin) {
      toast.error('Origin is required');
      return;
    }
    if (!harvestDate) {
      toast.error('Harvest date is required');
      return;
    }

    try {
      await addProduct(formData);
      toast.success('Product added successfully!');
      navigate('/farmer-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add product');
    }
  };

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
        <Card className="w-full max-w-md mx-auto bg-white shadow-xl rounded-xl border border-green-200">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-green-700 text-center">
              Add New Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isVerified ? (
              <form onSubmit={onSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="name">
                    Product Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={onChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="origin">
                    Origin
                  </label>
                  <input
                    type="text"
                    id="origin"
                    name="origin"
                    value={origin}
                    onChange={onChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter origin (e.g., California)"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="harvestDate">
                    Harvest Date
                  </label>
                  <input
                    type="date"
                    id="harvestDate"
                    name="harvestDate"
                    value={harvestDate}
                    onChange={onChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="description">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={description}
                    onChange={onChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter product description"
                    rows="3"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-3 rounded-lg transition-all duration-300"
                >
                  Add Product
                </Button>
              </form>
            ) : (
              <div className="text-center">
                <p className="text-lg text-red-600 mb-4">
                  You must be a verified farmer to list products.
                </p>
                <p className="text-gray-600">
                  Your verification status is currently{' '}
                  <span className="font-semibold text-yellow-600">pending</span> or{' '}
                  <span className="font-semibold text-red-600">rejected</span>.
                  Please wait for admin approval or contact support.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductTagging;