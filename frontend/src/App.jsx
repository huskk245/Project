import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './pages/Register';
import Login from './pages/Login';
import Logout from './pages/Logout';
import FarmerDashboard from './pages/FarmerDashboard';
import ProductTagging from './pages/ProductTagging';
import TrackProduct from './pages/TrackProduct';
import AdminDashboard from './pages/AdminDashboard';
import farmBackground from './assets/farm.jpg'; // Ensure this image exists
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const App = () => {
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    document.body.classList.add('no-scroll');
    const timer = setTimeout(() => {
      document.body.classList.remove('no-scroll');
      setAnimationComplete(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300">
          <Routes>
            <Route
              path="/"
              element={
                <div
                  className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center relative"
                  style={{
                    backgroundImage: `url(${farmBackground})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="absolute inset-0 bg-green-900 bg-opacity-50"></div>
                  <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="relative z-10 text-center text-white"
                  >
                    <motion.h1
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="text-6xl font-bold mb-4"
                    >
                      Welcome to FarmChain
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="text-2xl mb-6"
                    >
                      Trace your food from farm to table with transparency and trust.
                    </motion.p>
                    <motion.a
                      href="/register"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-green-500 hover:bg-green-600 text-white text-lg font-semibold py-3 px-8 rounded-lg transition-all duration-300"
                      >
                        Get Started
                      </motion.button>
                    </motion.a>
                  </motion.div>
                </div>
              }
            />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/logout"
              element={
                <ProtectedRoute allowedRoles={['admin', 'farmer', 'consumer']}>
                  <Logout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer-dashboard"
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <FarmerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/product-tagging"
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <ProductTagging />
                </ProtectedRoute>
              }
            />
            <Route
              path="/track-product"
              element={
                <ProtectedRoute allowedRoles={['consumer']}>
                  <TrackProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-green-800 text-white text-center py-4"
        >
          <p className="text-lg">© 2025 FarmChain. All rights reserved.</p>
        </motion.footer>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
};

export default App;
