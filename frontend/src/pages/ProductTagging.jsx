import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { getProfile, addProduct } from '../utils/api';
import Spinner from '../components/ui/spinner';

const ProductTagging = () => {
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    origin: '',
    harvestDate: '',
    description: '',
    rfid: '',
    image: null
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

  const { type, name, origin, harvestDate, description, rfid, image } = formData;

  const onChange = (e) => {
    if (e.target.name === 'productImage') {
      setFormData((prevState) => ({
        ...prevState,
        image: e.target.files[0],
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.name]: e.target.value,
      }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!type) {
      toast.error('Product type is required');
      return;
    }
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
    if (!rfid) {
      toast.error('RFID number is required');
      return;
    }
    if (!image) {
      toast.error('Product image is required');
      return;
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('productType', type);
      formDataToSend.append('productName', name);
      formDataToSend.append('origin', origin);
      formDataToSend.append('harvestDate', harvestDate);
      formDataToSend.append('description', description || 'N/A');
      formDataToSend.append('rfid', rfid);
      formDataToSend.append('productImage', image);

      const response = await addProduct(formDataToSend);
      console.log('Product added successfully:', response);
      toast.success('Product added successfully!');
      navigate('/farmer-dashboard');
    } catch (error) {
      console.error('Error adding product:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add product';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 p-4">
        <div className="container mx-auto">
          <Card className="w-full max-w-md mx-auto bg-white shadow-xl rounded-xl">
            <CardContent className="p-6 relative">
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                <Spinner />
                <p className="mt-4 text-lg font-medium text-green-700">Analyzing Product Freshness...</p>
              </div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-green-700">Add New Product</h2>
              </div>
              {isVerified ? (
                <form onSubmit={onSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Product Type</label>
                    <select
                      name="type"
                      value={type}
                      onChange={onChange}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="">Select product type</option>
                      <option value="fruits">Fruits</option>
                      <option value="vegetables">Vegetables</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Product Name</label>
                    <select
                      name="name"
                      value={name}
                      onChange={onChange}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                      disabled={!type}
                    >
                      <option value="">Select product type first</option>
                      {type === 'fruits' && (
                        <>
                          <option value="apple">Apple</option>
                          <option value="orange">Orange</option>
                          <option value="banana">Banana</option>
                        </>
                      )}
                      {type === 'vegetables' && (
                        <>
                          <option value="tomato">Tomato</option>
                          <option value="potato">Potato</option>
                          <option value="cucumber">Cucumber</option>
                          <option value="okra">Okra</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Origin</label>
                    <input
                      type="text"
                      name="origin"
                      value={origin}
                      onChange={onChange}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter origin (e.g., California)"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Harvest Date</label>
                    <input
                      type="date"
                      name="harvestDate"
                      value={harvestDate}
                      onChange={onChange}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">RFID Number</label>
                    <input
                      type="text"
                      name="rfid"
                      value={rfid}
                      onChange={onChange}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter RFID number"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Product Image</label>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        onClick={() => document.getElementById('productImage').click()}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        Choose File
                      </Button>
                      <span className="text-gray-600">
                        {image ? image.name : 'No file chosen'}
                      </span>
                    </div>
                    <input
                      type="file"
                      id="productImage"
                      name="productImage"
                      onChange={onChange}
                      className="hidden"
                      accept="image/*"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Description (Optional)</label>
                    <textarea
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
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 p-4">
      <div className="container mx-auto">
        <Card className="w-full max-w-md mx-auto bg-white shadow-xl rounded-xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-green-700">Add New Product</h2>
            </div>
            {isVerified ? (
              <form onSubmit={onSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Product Type</label>
                  <select
                    name="type"
                    value={type}
                    onChange={onChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select product type</option>
                    <option value="fruits">Fruits</option>
                    <option value="vegetables">Vegetables</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Product Name</label>
                  <select
                    name="name"
                    value={name}
                    onChange={onChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                    disabled={!type}
                  >
                    <option value="">Select product type first</option>
                    {type === 'fruits' && (
                      <>
                        <option value="apple">Apple</option>
                        <option value="orange">Orange</option>
                        <option value="banana">Banana</option>
                      </>
                    )}
                    {type === 'vegetables' && (
                      <>
                        <option value="tomato">Tomato</option>
                        <option value="potato">Potato</option>
                        <option value="cucumber">Cucumber</option>
                        <option value="okra">Okra</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Origin</label>
                  <input
                    type="text"
                    name="origin"
                    value={origin}
                    onChange={onChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter origin (e.g., California)"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Harvest Date</label>
                  <input
                    type="date"
                    name="harvestDate"
                    value={harvestDate}
                    onChange={onChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">RFID Number</label>
                  <input
                    type="text"
                    name="rfid"
                    value={rfid}
                    onChange={onChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter RFID number"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Product Image</label>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      onClick={() => document.getElementById('productImage').click()}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      Choose File
                    </Button>
                    <span className="text-gray-600">
                      {image ? image.name : 'No file chosen'}
                    </span>
                  </div>
                  <input
                    type="file"
                    id="productImage"
                    name="productImage"
                    onChange={onChange}
                    className="hidden"
                    accept="image/*"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Description (Optional)</label>
                  <textarea
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
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
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