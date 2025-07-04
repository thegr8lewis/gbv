
import { AlertTriangle, Phone, ArrowRight, Info, Bell, Shield, Heart, Users, Lock, CheckCircle, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomeScreen({ isLoggedIn }) {
  const [latestUpdates, setLatestUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestUpdates = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/public/updates/?ordering=-created_at');
        if (!response.ok) {
          throw new Error('Failed to fetch updates');
        }
        const data = await response.json();
        // Get the first 3 most recent updates
        setLatestUpdates(data.slice(0, 3));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestUpdates();
  }, []);

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="max-w-4xl mx-auto px-1 py-8">

      {/* Hero Section with Enhanced Styling */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl p-8 text-white shadow-lg mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-500 opacity-10 rounded-full scale-150 translate-x-1/2 -translate-y-1/4"></div>
        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Shield size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold ml-3">Your Safety is Our Priority</h2>
          </div>
          <p className="text-lg mb-6 opacity-90">
            SafeSpace provides a secure platform to report and address sexual and gender-based violence. 
            Every report is handled with complete confidentiality and compassion.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => navigate('/report')}
              className="bg-white text-blue-700 px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition duration-300 flex items-center justify-center space-x-2"
            >
              <Shield size={18} />
              <span>{isLoggedIn ? 'Report an Incident' : 'Learn How to Report'}</span>
              <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => navigate('/about')}
              className="bg-white/10 text-white border border-white/30 px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition duration-300 flex items-center justify-center space-x-2"
            >
              <Info size={18} />
              <span>Learn About SGBV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-white rounded-xl p-6 ">
        <div className="flex items-center mb-5">
          <div className="bg-green-50 p-3 rounded-full">
            <CheckCircle size={22} className="text-green-700" />
          </div>
          <h3 className="text-xl font-semibold ml-3">Why Choose SafeSpace?</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <div className="bg-blue-200 p-2 rounded-full">
                <Lock size={18} className="text-blue-700" />
              </div>
              <h4 className="font-medium ml-3 text-blue-800">100% Confidential</h4>
            </div>
            <p className="text-gray-700 text-sm">Your identity and information are protected with the highest security standards.</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <div className="bg-green-200 p-2 rounded-full">
                <Heart size={18} className="text-green-700" />
              </div>
              <h4 className="font-medium ml-3 text-green-800">Compassionate Support</h4>
            </div>
            <p className="text-gray-700 text-sm">Our trained professionals provide empathetic support throughout your journey.</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <div className="bg-purple-200 p-2 rounded-full">
                <Users size={18} className="text-purple-700" />
              </div>
              <h4 className="font-medium ml-3 text-purple-800">Community Focused</h4>
            </div>
            <p className="text-gray-700 text-sm">Together, we're building a safer environment for everyone in our community.</p>
          </div>
        </div>
      </div>

      {/* Quick Access Cards with Enhanced Styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Emergency Support */}
        <div className="bg-white rounded-xl p-6  hover:shadow-lg transition duration-300">
          <div className="flex items-center mb-4">
            <div className="bg-red-50 p-3 rounded-full">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h3 className="text-xl font-semibold ml-3">Emergency Support</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Need immediate help? Access emergency contacts and crisis support available 24/7.
          </p>
          <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-4">
            <div className="flex items-center">
              <Phone size={16} className="text-red-600 mr-2" />
              <span className="text-sm font-medium text-red-700">24/7 Crisis Hotline Available</span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/emergency')}
            className="w-full text-red-500 border border-red-500 px-4 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center justify-center"
          >
            <Phone size={18} className="mr-2" />
            Access Emergency Contacts
          </button>
        </div>

        {/* Resources & Information */}
        <div className="bg-white rounded-xl p-6 hover:shadow-lg transition duration-300">
          <div className="flex items-center mb-4">
            <div className="bg-blue-50 p-3 rounded-full">
              <Info size={22} className="text-blue-700" />
            </div>
            <h3 className="text-xl font-semibold ml-3">Resources & Information</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Learn about gender equity, support services, and how to identify and prevent SGBV.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
            <div className="flex items-center">
              <Star size={16} className="text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-700">Comprehensive Support Directory</span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/about')}
            className="w-full text-blue-700 border border-blue-700 px-4 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center"
          >
            Learn More
            <ArrowRight size={18} className="ml-2" />
          </button>
        </div>
      </div>

      {/* Latest Updates Section with Enhanced Styling */}
      <div className="bg-gray-50 rounded-xl p-6 shadow-md border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center">
            <div className="bg-indigo-50 p-3 rounded-full">
              <Bell size={22} className="text-indigo-700" />
            </div>
            <h3 className="text-xl font-semibold ml-3">Latest Updates</h3>
          </div>
          <button 
            onClick={() => navigate('/updates')}
            className="text-blue-700 text-sm font-medium hover:underline flex items-center"
          >
            View all updates
            <ArrowRight size={14} className="ml-1" />
          </button>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow-sm animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm bg-red-50 p-4 rounded-lg border border-red-100">
            <div className="flex items-center">
              <AlertTriangle size={16} className="mr-2" />
              {error}
            </div>
          </div>
        ) : latestUpdates.length > 0 ? (
          <div className="space-y-3">
            {latestUpdates.map((update) => (
              <div key={update.id} className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 mb-1">{update.title}</h4>
                    <p className="text-xs text-gray-500">{formatDate(update.created_at)}</p>
                  </div>
                  <button
                    onClick={() => navigate('/updates')}
                    className="text-blue-700 text-xs flex items-center hover:underline ml-4"
                  >
                    View <ArrowRight size={14} className="ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg text-gray-500 text-center">
            <Bell size={32} className="mx-auto mb-2 text-gray-300" />
            <p>No updates available at the moment</p>
          </div>
        )}
      </div>

      {/* Support Message */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl  mt-8 border border-green-100">
        <div className="text-center">
          <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
            <Heart size={24} className="text-green-700" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Remember: You Are Not Alone</h3>
          <p className="text-gray-600 text-sm">
            Our community is here to support you every step of the way. Your courage in speaking up helps create a safer environment for everyone.
          </p>
        </div>
      </div>
    </div>
  );
}