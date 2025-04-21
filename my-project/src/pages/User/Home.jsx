// src/Home.jsx
import { AlertTriangle, Phone, ArrowRight, Info, Bell } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto px-0 py-0 space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-800 opacity-10 rounded-full scale-150 translate-x-1/2 translate-y-1/4"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-3">Welcome to SafeSpace</h1>
          <p className="text-lg mb-6 max-w-lg opacity-90">
            A secure platform to report and address sexual and gender-based violence in your community.
          </p>
          <button 
            onClick={() => navigate('/report')}
            className="bg-white text-blue-700 px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition duration-300 flex items-center space-x-2"
          >
            {isLoggedIn ? 'Report an Incident' : 'Learn How to Report'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Emergency Support */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-red-100 hover:shadow-lg transition duration-300">
          <div className="flex items-center mb-4">
            <div className="bg-red-50 p-3 rounded-full">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h3 className="text-xl font-semibold ml-3">Emergency Support</h3>
          </div>
          <p className="text-gray-600 mb-4">Need immediate help? Access emergency contacts directly for urgent assistance.</p>
          <button 
            onClick={() => navigate('/emergency')}
            className="w-full text-red-500 border border-red-500 px-4 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center justify-center"
          >
            <Phone size={18} className="mr-2" />
            Access Emergency Contacts
          </button>
        </div>

        {/* Resources & Information */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100 hover:shadow-lg transition duration-300">
          <div className="flex items-center mb-4">
            <div className="bg-blue-50 p-3 rounded-full">
              <Info size={22} className="text-blue-700" />
            </div>
            <h3 className="text-xl font-semibold ml-3">Resources & Information</h3>
          </div>
          <p className="text-gray-600 mb-4">Learn about gender equity, support services, and how to identify SGBV.</p>
          <button 
            onClick={() => navigate('/about')}
            className="w-full text-blue-700 border border-blue-700 px-4 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center"
          >
            Learn More
            <ArrowRight size={18} className="ml-2" />
          </button>
        </div>
      </div>

      {/* Latest Updates Section */}
      <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center">
            <Bell size={20} className="text-blue-700 mr-2" />
            <h3 className="text-xl font-semibold">Latest Updates</h3>
          </div>
          <button 
            onClick={() => navigate('/updates')}
            className="text-blue-700 text-sm font-medium hover:underline flex items-center"
          >
            View all
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
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>
        ) : latestUpdates.length > 0 ? (
          <div className="space-y-3">
            {latestUpdates.map((update) => (
              <div key={update.id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-blue-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{update.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(update.created_at)}</p>
                  </div>
                  <button
                    onClick={() => navigate('/updates')}
                    className="text-blue-700 text-xs flex items-center hover:underline"
                  >
                    View <ArrowRight size={14} className="ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-4 rounded-lg text-gray-500 text-center">No updates available</div>
        )}
      </div>
    </div>
  );
}