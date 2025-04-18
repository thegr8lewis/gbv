// Home.jsx
import { AlertTriangle, Phone } from 'lucide-react';

export default function HomeScreen({ setActiveTab }) {
  return (
    <div className="space-y-6">
      <div className="bg-[#0E3692] rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Welcome to SafeSpace</h2>
        <p className="mb-4">A secure platform to report and address sexual and gender-based violence.</p>
        <button 
          onClick={() => setActiveTab('report')}
          className="bg-white text-[#0E3692] px-6 py-2 rounded-lg font-medium shadow-md hover:bg-gray-100 transition-colors"
        >
          Report an Incident
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
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <p className="text-sm font-medium">New reporting features available</p>
            <p className="text-xs text-gray-500">2 days ago</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <p className="text-sm font-medium">Awareness workshop scheduled</p>
            <p className="text-xs text-gray-500">1 week ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}