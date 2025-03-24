import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

const CompleteProfile = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    dob: '',
    address: '',
    farmSize: '',
    photo: null,
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

        if (response.data.role !== 'farmer') {
          navigate('/');
          return;
        }

        if (response.data.profileCompleted) {
          navigate('/farmer-dashboard');
        }

        setLoading(false);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch user data');
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  const { phoneNumber, dob, address, farmSize, photo } = formData;

  const onChange = (e) => {
    if (e.target.name === 'photo') {
      setFormData((prevState) => ({
        ...prevState,
        photo: e.target.files[0],
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
    if (!farmSize) {
      toast.error('Please enter your farm size');
      return;
    }
    if (!photo) {
      toast.error('Please upload a photo');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('phoneNumber', phoneNumber);
      formDataToSend.append('dob', dob);
      formDataToSend.append('address', address);
      formDataToSend.append('farmSize', farmSize);
      formDataToSend.append('photo', photo); // Append the actual file

      const response = await axios.put(
        'http://localhost:5000/api/auth/complete-profile',
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success(response.data.message);
      navigate('/farmer-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete profile');
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
              Complete Your Profile
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
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="address">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={address}
                  onChange={onChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your address"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="farmSize">
                  Farm Size
                </label>
                <input
                  type="text"
                  id="farmSize"
                  name="farmSize"
                  value={farmSize}
                  onChange={onChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your farm size (e.g., 10 acres)"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="photo">
                  Upload Photo
                </label>
                <input
                  type="file"
                  id="photo"
                  name="photo"
                  accept="image/*"
                  onChange={onChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-3 rounded-lg transition-all duration-300"
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

export default CompleteProfile;