import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Lock, Mail, Eye, EyeOff, CheckCircle, XCircle, Bell } from 'lucide-react';
import AdminLayout from '/src/pages/Admin/AdminLayout.jsx';
import axios from 'axios';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate('/login');
      } else {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [navigate]);

  // Notification settings state
  const [settingsData, setSettingsData] = useState({
    notificationEmail: 'admin@kucgee.com',
    reportNotifications: true,
    messageNotifications: true,
    eventReminders: true,
    darkMode: false,
    timezone: 'Africa/Nairobi'
  });

  // Credential update state
  const [credentialData, setCredentialData] = useState({
    current_password: '',
    new_email: '',
    new_password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle settings changes
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettingsData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle credential changes
  const handleCredentialChange = (e) => {
    const { name, value } = e.target;
    setCredentialData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate credential form
  const validateCredentials = () => {
    const newErrors = {};
    
    if (!credentialData.current_password) {
      newErrors.current_password = 'Current password is required';
    }
    
    if (credentialData.new_password && credentialData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters';
    }
    
    if (credentialData.new_password !== credentialData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save notification settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    // Save settings logic here
    alert('Settings saved successfully!');
  };

  // Update credentials with enhanced auth checks
  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    
    if (!validateCredentials()) return;
    
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const payload = {
        current_password: credentialData.current_password,
      };
      
      if (credentialData.new_email) payload.new_email = credentialData.new_email;
      if (credentialData.new_password) payload.new_password = credentialData.new_password;
      
      const response = await axios.post(
        'http://localhost:8000/api/update-credentials/',
        payload,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('is_staff');
        navigate('/login');
        return;
      }
      
      setSuccessMessage('Credentials updated successfully!');
      setCredentialData({
        current_password: '',
        new_email: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_email');
          localStorage.removeItem('is_staff');
          navigate('/login');
          return;
        }
        setErrorMessage(error.response.data.detail || 'Failed to update credentials');
      } else {
        setErrorMessage('Network error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Only render the component if authentication is confirmed
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout activeNavItem="Settings">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Account Security */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 border-b flex items-center">
            <Lock className="w-5 h-5 text-blue-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Account Security</h2>
          </div>
          
          <form onSubmit={handleUpdateCredentials} className="p-6">
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded flex items-center">
                <CheckCircle className="mr-2" size={20} />
                {successMessage}
              </div>
            )}
            
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded flex items-center">
                <XCircle className="mr-2" size={20} />
                {errorMessage}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="current_password"
                    name="current_password"
                    type={showPassword ? "text" : "password"}
                    value={credentialData.current_password}
                    onChange={handleCredentialChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                      errors.current_password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.current_password && (
                  <p className="mt-1 text-sm text-red-600">{errors.current_password}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="new_email" className="block text-sm font-medium text-gray-700 mb-1">
                  New Email (optional)
                </label>
                <div className="relative">
                  <input
                    id="new_email"
                    name="new_email"
                    type="email"
                    value={credentialData.new_email}
                    onChange={handleCredentialChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                      errors.new_email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                    placeholder="Enter new email if you want to change it"
                  />
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>
              
              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password (optional)
                </label>
                <div className="relative">
                  <input
                    id="new_password"
                    name="new_password"
                    type={showPassword ? "text" : "password"}
                    value={credentialData.new_password}
                    onChange={handleCredentialChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                      errors.new_password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                    placeholder="At least 8 characters"
                  />
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
                {errors.new_password && (
                  <p className="mt-1 text-sm text-red-600">{errors.new_password}</p>
                )}
              </div>
              
              {credentialData.new_password && (
                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm_password"
                      name="confirm_password"
                      type={showPassword ? "text" : "password"}
                      value={credentialData.confirm_password}
                      onChange={handleCredentialChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                        errors.confirm_password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                      }`}
                    />
                    <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                  {errors.confirm_password && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                    isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Update Credentials
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}