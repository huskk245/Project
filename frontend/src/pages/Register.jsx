import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { EyeOpenIcon, EyeClosedIcon } from '@radix-ui/react-icons'; // Correct icons
import { register } from '../utils/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: '',
  });
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-xl rounded-xl border border-green-200">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-green-700">
            Register with FarmChain
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-lg font-medium text-gray-700">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full p-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-lg font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'} // Toggle between text and password
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full p-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeClosedIcon className="h-5 w-5" />
                  ) : (
                    <EyeOpenIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-lg font-medium text-gray-700">
                Role
              </Label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="">Select a role</option>
                <option value="farmer">Farmer</option>
                <option value="consumer">Consumer</option>
                <option value="retailer">Retailer</option>
              </select>
            </div>
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-3 rounded-lg transition-all duration-300"
            >
              Register
            </Button>
          </form>
          <p className="mt-4 text-center text-gray-600 text-base">
            Already have an account?{' '}
            <a href="/login" className="text-green-600 hover:underline font-medium">
              Login here
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;