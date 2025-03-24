import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { TrashIcon, CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons';
import { getAllUsers, deleteUser, getPendingVerifications, updateVerificationStatus } from '../utils/api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const usersData = await getAllUsers();
      const verificationsData = await getPendingVerifications();
      setUsers(usersData);
      setPendingVerifications(verificationsData);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        toast.success('User deleted successfully!');
        setUsers(users.filter((user) => user._id !== userId));
        setPendingVerifications(pendingVerifications.filter((ver) => ver._id !== userId));
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleVerificationAction = async (userId, status) => {
    try {
      await updateVerificationStatus(userId, status);
      toast.success(`Verification ${status} successfully!`);
      setPendingVerifications(pendingVerifications.filter((ver) => ver._id !== userId));
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${status} verification`);
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
        <Card className="w-full bg-white shadow-xl rounded-xl border border-green-200 mb-6">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-green-700">
              Admin Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Manage Users
            </h2>
            {users.length === 0 ? (
              <p className="text-lg text-gray-600">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-green-100">
                      <th className="p-3 text-lg font-semibold text-gray-700">Username</th>
                      <th className="p-3 text-lg font-semibold text-gray-700">Role</th>
                      <th className="p-3 text-lg font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-b">
                        <td className="p-3 text-gray-600">{user.username}</td>
                        <td className="p-3 text-gray-600">{user.role}</td>
                        <td className="p-3">
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(user._id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full bg-white shadow-xl rounded-xl border border-green-200">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-green-700">
              Pending Verifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingVerifications.length === 0 ? (
              <p className="text-lg text-gray-600">No pending verifications.</p>
            ) : (
              <div className="space-y-4">
                {pendingVerifications.map((farmer) => (
                  <Card key={farmer._id} className="bg-gray-50 shadow-md rounded-lg">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-green-600">
                        {farmer.username}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600"><strong>Phone Number:</strong> {farmer.phoneNumber}</p>
                      <p className="text-gray-600"><strong>Date of Birth:</strong> {farmer.dob ? new Date(farmer.dob).toLocaleDateString() : 'N/A'}</p>
                      <p className="text-gray-600"><strong>Address:</strong> {farmer.address}</p>
                      <p className="text-gray-600"><strong>Farm Size:</strong> {farmer.farmSize}</p>
                      {farmer.photo && (
                        <div className="mt-2">
                          <p className="text-gray-600"><strong>Photo:</strong></p>
                          <img
                            src={`http://localhost:5000${farmer.photo}`}
                            alt="Farmer Photo"
                            className="w-32 h-32 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/128x128';
                              console.error('Failed to load photo:', farmer.photo);
                            }}
                          />
                        </div>
                      )}
                      <div className="mt-4 flex space-x-4">
                        <Button
                          onClick={() => handleVerificationAction(farmer._id, 'approved')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircledIcon className="h-5 w-5 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleVerificationAction(farmer._id, 'rejected')}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <CrossCircledIcon className="h-5 w-5 mr-2" />
                          Reject
                        </Button>
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

export default AdminDashboard;