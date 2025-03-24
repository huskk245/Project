import { useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { trackProduct } from '../utils/api';

const TrackProduct = () => {
  const [productId, setProductId] = useState('');
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await trackProduct(productId);
      setProduct(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to track product');
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white shadow-xl rounded-xl border border-green-200">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-green-700">
            Track Product
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="productId" className="text-lg font-medium text-gray-700">
                Product ID
              </Label>
              <Input
                id="productId"
                name="productId"
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
                className="w-full p-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter product ID"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-3 rounded-lg transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? 'Tracking...' : 'Track Product'}
            </Button>
          </form>

          {product && (
            <div className="mt-6">
              <h3 className="text-2xl font-semibold text-green-700 mb-4">
                Product Details
              </h3>
              <p className="text-lg text-gray-600">Name: {product.name}</p>
              <p className="text-lg text-gray-600">Origin: {product.origin}</p>
              <p className="text-lg text-gray-600">
                Harvest Date: {new Date(product.harvestDate).toLocaleDateString()}
              </p>
              <p className="text-lg text-gray-600">
                Farmer: {product.farmer.username}
              </p>
              <p className="text-lg text-gray-600">
                Description: {product.description || 'N/A'}
              </p>
              <h4 className="text-xl font-semibold text-green-600 mt-4">
                Supply Chain Journey
              </h4>
              <ul className="mt-2 space-y-2">
                {product.supplyChain.map((step, index) => (
                  <li key={index} className="text-gray-600">
                    <span className="font-medium">
                      {new Date(step.date).toLocaleDateString()} - {step.location}:
                    </span>{' '}
                    {step.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackProduct;