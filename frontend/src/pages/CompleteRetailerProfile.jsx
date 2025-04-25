import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { completeRetailerProfile } from '../utils/api';

const CompleteRetailerProfile = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    dob: '',
    address: '',
    storeName: '',
    storeType: 'grocery', // Default value
    photo: null,
    businessLicense: null,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.role !== 'retailer') {
          navigate('/');
          return;
        }

        if (response.data.profileCompleted) {
          navigate('/retailer-dashboard');
        }

        setLoading(false);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch user data');
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  const { phoneNumber, dob, address, storeName, storeType, photo, businessLicense } = formData;

  const onChange = (e) => {
    if (e.target.name === 'photo' || e.target.name === 'businessLicense') {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.name]: e.target.files[0],
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

    // Client-side validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
      toast.error('Please enter a valid phone number (e.g., +1234567890)');
      return;
    }
    if (!dob) {
      toast.error('Please enter your date of birth');
      return;
    }
    if (!address) {
      toast.error('Please enter your address');
      return;
    }
    if (!storeName) {
      toast.error('Please enter your store name');
      return;
    }
    if (!storeType) {
      toast.error('Please select your store type');
      return;
    }
    if (!photo) {
      toast.error('Please upload a photo');
      return;
    }
    if (!businessLicense) {
      toast.error('Please upload your business license');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('phoneNumber', phoneNumber);
      formDataToSend.append('dob', dob);
      formDataToSend.append('address', address);
      formDataToSend.append('storeName', storeName);
      formDataToSend.append('storeType', storeType);
      formDataToSend.append('photo', photo);
      formDataToSend.append('businessLicense', businessLicense);

      const response = await completeRetailerProfile(formDataToSend);

      toast.success(response.message);
      navigate('/retailer-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 flex items-center justify-center">
        <p className="text-lg text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 p-4">
      <div className="container mx-auto pt-20">
        <Card className="w-full max-w-md mx-auto bg-white shadow-xl rounded-xl border border-blue-200">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-blue-700 text-center">
              Complete Retailer Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="phoneNumber">
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={phoneNumber}
                  onChange={onChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your phone number (e.g., +1234567890)"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="dob">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={dob}
                  onChange={onChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="address">
                  Business Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={address}
                  onChange={onChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your business address"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="storeName">
                  Store Name
                </label>
                <input
                  type="text"
                  id="storeName"
                  name="storeName"
                  value={storeName}
                  onChange={onChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your store name"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="storeType">
                  Store Type
                </label>
                <select
                  id="storeType"
                  name="storeType"
                  value={storeType}
                  onChange={onChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="supermarket">Supermarket</option>
                  <option value="grocery">Grocery Store</option>
                  <option value="specialty">Specialty Food Store</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="online">Online Retailer</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="photo">
                  Upload Photo (Your profile picture)
                </label>
                <input
                  type="file"
                  id="photo"
                  name="photo"
                  accept="image/*"
                  onChange={onChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="businessLicense">
                  Upload Business License
                </label>
                <input
                  type="file"
                  id="businessLicense"
                  name="businessLicense"
                  accept="image/*,.pdf"
                  onChange={onChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload an image or PDF of your business license or permit
                </p>
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-3 rounded-lg transition-all duration-300"
              >
                Submit
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompleteRetailerProfile; 