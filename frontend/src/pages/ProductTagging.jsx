import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { addProduct } from '../utils/api';

const ProductTagging = () => {
  const [formData, setFormData] = useState({
    name: '',
    origin: '',
    harvestDate: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await addProduct(formData);
      toast.success('Product added successfully!');
      navigate('/farmer-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-xl rounded-xl border border-green-200">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-green-700">
            Add New Product
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg font-medium text-gray-700">
                Product Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter product name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="origin" className="text-lg font-medium text-gray-700">
                Origin
              </Label>
              <Input
                id="origin"
                name="origin"
                type="text"
                value={formData.origin}
                onChange={handleChange}
                required
                className="w-full p-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter origin (e.g., California)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="harvestDate" className="text-lg font-medium text-gray-700">
                Harvest Date
              </Label>
              <Input
                id="harvestDate"
                name="harvestDate"
                type="date"
                value={formData.harvestDate}
                onChange={handleChange}
                required
                className="w-full p-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-lg font-medium text-gray-700">
                Description (Optional)
              </Label>
              <Input
                id="description"
                name="description"
                type="text"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter product description"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-3 rounded-lg transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? 'Adding Product...' : 'Add Product'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductTagging;