import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { getProfile } from '../utils/api';
import Spinner from '../components/ui/spinner';
import axios from 'axios';
import { trackRFIDInRealtime } from '../utils/firebase';

const ProductVerification = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [rfid, setRfid] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [rfidData, setRfidData] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [freshnessResult, setFreshnessResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ProductVerification component mounted");
    
    const fetchUser = async () => {
      try {
        console.log("Fetching user data...");
        
        // Check if token exists
        const token = localStorage.getItem('token');
        if (!token) {
          console.error("No authentication token found");
          setError("You must be logged in to access this page");
          toast.error('Please log in to continue');
          navigate('/login');
          return;
        }
        
        const userData = await getProfile();
        console.log("User data received:", userData);
        
        if (!userData) {
          console.error("No user data returned");
          setError("Could not load user profile");
          return;
        }
        
        if (userData.role !== 'retailer') {
          console.error("User is not a retailer:", userData.role);
          setError("Only retailers can access this page");
          return;
        }
        
        setUser(userData);
        console.log("User data set successfully");
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(error.response?.data?.message || "Failed to fetch user data");
        // Don't navigate away automatically - let user see the error
      } finally {
        setLoading(false);
        console.log("Loading state set to false");
      }
    };

    fetchUser();
    
    // Add cleanup function
    return () => {
      console.log("ProductVerification component unmounting");
    };
  }, [navigate]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductImage(file);
      // Create preview URL for the selected image
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const verifyRFID = async () => {
    if (!rfid) {
      toast.error('Please enter an RFID code');
      return;
    }

    try {
      console.log("Verifying RFID:", rfid);
      
      // Setup RFID tracking
      const unsubscribe = trackRFIDInRealtime(rfid, (data) => {
        console.log(`RFID data received:`, data);
        setRfidData(data);
        
        if (!data || !data.entries || data.entries.length === 0) {
          toast.error('No tracking data found for this RFID');
        } else {
          toast.success(`Found ${data.entries.length} tracking entries for RFID ${rfid}`);
        }
      });
      
      // Clean up subscription after 5 seconds
      setTimeout(() => {
        unsubscribe();
      }, 5000);
    } catch (error) {
      console.error('Error verifying RFID:', error);
      toast.error('Failed to verify RFID');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rfid) {
      toast.error('Please enter an RFID code');
      return;
    }
    
    if (!productImage) {
      toast.error('Please upload a product image');
      return;
    }
    
    try {
      setSubmitLoading(true);
      console.log("Submitting verification for RFID:", rfid);
      
      // Create form data with the product image and RFID
      const formData = new FormData();
      formData.append('productImage', productImage);
      formData.append('rfid', rfid);
      
      // Send to backend for freshness verification
      const response = await axios.post('http://localhost:5000/api/products/verify-freshness', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log("Verification response:", response.data);
      setFreshnessResult(response.data);
      toast.success('Freshness verification complete and added to supply chain journey!');
    } catch (error) {
      console.error('Error during freshness verification:', error);
      toast.error(error.response?.data?.message || 'Failed to verify product freshness');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 flex items-center justify-center">
        <div className="p-6 bg-white rounded-lg shadow-xl max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Page</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <Button 
            type="button" 
            onClick={() => navigate('/retailer-dashboard')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 flex items-center justify-center">
        <Spinner />
        <p className="ml-2 text-lg text-blue-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 p-4">
      <div className="container mx-auto pt-20">
        <Card className="w-full max-w-md mx-auto bg-white shadow-xl rounded-xl border border-blue-200">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-blue-700">
              Product Freshness Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="rfid" className="text-lg font-medium text-gray-700">
                  Product RFID
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="rfid"
                    value={rfid}
                    onChange={(e) => setRfid(e.target.value)}
                    className="flex-1 p-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter product RFID"
                    required
                  />
                  <Button 
                    type="button"
                    onClick={verifyRFID}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Verify
                  </Button>
                </div>
                
                {rfidData && rfidData.entries && rfidData.entries.length > 0 && (
                  <div className="mt-2 p-3 bg-green-50 text-green-700 rounded-lg">
                    <p className="font-medium">✅ RFID verified</p>
                    <p className="text-sm">Found {rfidData.entries.length} tracking entries</p>
                    <p className="text-sm">Last seen: {new Date(rfidData.entries[0].timestamp).toLocaleString()}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="productImage" className="text-lg font-medium text-gray-700">
                  Product Image
                </Label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    onClick={() => document.getElementById('productImage').click()}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Choose File
                  </Button>
                  <span className="text-gray-600">
                    {productImage ? productImage.name : 'No file chosen'}
                  </span>
                </div>
                <input
                  type="file"
                  id="productImage"
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/*"
                  required
                />

                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-gray-700 mb-2">Preview:</p>
                    <img 
                      src={imagePreview} 
                      alt="Product Preview" 
                      className="w-full h-64 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <div className="flex items-center justify-center">
                    <Spinner className="h-5 w-5 mr-2" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  'Verify Freshness'
                )}
              </Button>
            </form>

            {freshnessResult && (
              <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200 shadow-md">
                <h3 className="text-xl font-bold text-blue-700 mb-3">Freshness Analysis</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Freshness Score:</span>
                    <span className={`font-bold ${freshnessResult.freshnessScore > 70 ? 'text-green-600' : 'text-red-600'}`}>
                      {freshnessResult.freshnessScore}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className={`font-bold ${freshnessResult.isFresh ? 'text-green-600' : 'text-red-600'}`}>
                      {freshnessResult.isFresh ? 'Fresh ✅' : 'Not Fresh ❌'}
                    </span>
                  </div>
                  {freshnessResult.predictedLabel && (
                    <div className="flex justify-between">
                      <span className="font-medium">Classification:</span>
                      <span className="font-bold text-blue-700">
                        {freshnessResult.predictedLabel}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {freshnessResult && (
              <div className="mt-4 text-center">
                <p className="text-green-600 font-medium mb-2">
                  Verification has been added to the product's supply chain journey!
                </p>
                <p className="text-gray-600 mb-4">
                  Click the button below to view the complete supply chain journey.
                </p>
                <Button
                  type="button"
                  onClick={() => navigate(`/track-product?rfid=${rfid}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  View Supply Chain Journey
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductVerification; 