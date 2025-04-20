// src/Home.jsx
import { AlertTriangle, Phone, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomeScreen({ setActiveTab, isLoggedIn }) {
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

  const handleViewUpdate = (updateId) => {
    // Navigate to updates tab with the specific update ID
    setActiveTab('updates');
    navigate('/updates');
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0E3692] rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Welcome to SafeSpace</h2>
        <p className="mb-4">A secure platform to report and address sexual and gender-based violence.</p>
        <button 
          onClick={() => setActiveTab('report')}
          className="bg-white text-[#0E3692] px-6 py-2 rounded-lg font-medium shadow-md hover:bg-gray-100 transition-colors"
        >
          {isLoggedIn ? 'Report an Incident' : 'Learn How to Report'}
        </button>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-md">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <AlertTriangle size={20} className="mr-2 text-red-500" />
          Emergency Support
        </h3>
        <p className="text-gray-600 mb-3">Need immediate help? Access emergency contacts directly.</p>
        <button 
          onClick={() => setActiveTab('emergency')}
          className="text-red-500 border border-red-500 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center"
        >
          <Phone size={16} className="mr-2" />
          Access Emergency Contacts
        </button>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-md">
        <h3 className="text-lg font-semibold mb-3">Resources & Information</h3>
        <p className="text-gray-600 mb-3">Learn about gender equity, support services, and how to identify SGBV.</p>
        <button 
          onClick={() => setActiveTab('info')}
          className="text-[#0E3692] border border-[#0E3692] px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
        >
          Learn More
        </button>
      </div>

      <div className="bg-gray-100 rounded-xl p-5">
        <h3 className="text-lg font-semibold mb-2">Latest Updates</h3>
        
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-3 rounded-lg shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : latestUpdates.length > 0 ? (
          <div className="space-y-3">
            {latestUpdates.map((update) => (
              <div key={update.id} className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{update.title}</p>
                    <p className="text-xs text-gray-500">{formatDate(update.created_at)}</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('updates')}
                    className="text-[#0E3692] text-xs flex items-center hover:underline"
                  >
                    View <ArrowRight size={14} className="ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No updates available</p>
        )}

        <button 
          onClick={() => setActiveTab('updates')}
          className="mt-3 text-sm text-[#0E3692] hover:text-blue-900 hover:underline"
        >
          View all updates
        </button>
      </div>
    </div>
  );
}