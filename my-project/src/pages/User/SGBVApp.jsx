// SGBVApp.jsx
import { useState, useEffect, useRef } from 'react';
import kenyanFlag from "/src/assets/kenyanflag.png";
import { Home, Phone, Info, Bell, Send, Shield, Upload, AlertTriangle } from 'lucide-react';
import HomeScreen from './Home.jsx';
import ReportForm from './Report.jsx';
import EmergencyContacts from './Emergency.jsx';
import InformationScreen from './About.jsx';
import UpdatesScreen from './Updates.jsx';

export default function SGBVApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    description: '',
    gender: '',
    perpetratorDetails: '',
    contactPhone: '',
    contactEmail: '',
    location: '',
    anonymous: false,
  });
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen setActiveTab={setActiveTab} />;
      case 'report':
        return <ReportForm step={step} setStep={setStep} formData={formData} handleInputChange={handleInputChange} />;
      case 'emergency':
        return <EmergencyContacts />;
      case 'info':
        return <InformationScreen />;
      case 'updates':
        return <UpdatesScreen />;
      default:
        return <HomeScreen setActiveTab={setActiveTab} />;
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setHeaderVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setHeaderVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      {/* Header - Animated based on scroll */}
      <header className={`fixed top-0 left-0 right-0 py-5 px-4 text-white transition-transform duration-300 z-20 ${
        headerVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0E3692] to-transparent opacity-90"></div>
        <div className="relative z-10 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src={kenyanFlag} 
              alt="Kenyan Flag" 
              className="h-12 w-auto"
            />
            <h1 className="text-2xl font-bold">SafeSpace</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-20 pb-16 px-4">
        {renderContent()}
      </main>

      {/* Fixed Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-inner z-10">
        <div className="flex justify-around py-3">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center p-2 ${activeTab === 'home' ? 'text-[#0E3692]' : 'text-gray-600'}`}
          >
            <Home size={20} />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button 
            onClick={() => setActiveTab('report')}
            className={`flex flex-col items-center p-2 ${activeTab === 'report' ? 'text-[#0E3692]' : 'text-gray-600'}`}
          >
            <Send size={20} />
            <span className="text-xs mt-1">Report</span>
          </button>
          <button 
            onClick={() => setActiveTab('emergency')}
            className={`flex flex-col items-center p-2 ${activeTab === 'emergency' ? 'text-[#0E3692]' : 'text-gray-600'}`}
          >
            <AlertTriangle size={20} />
            <span className="text-xs mt-1">Emergency</span>
          </button>
          <button 
            onClick={() => setActiveTab('info')}
            className={`flex flex-col items-center p-2 ${activeTab === 'info' ? 'text-[#0E3692]' : 'text-gray-600'}`}
          >
            <Info size={20} />
            <span className="text-xs mt-1">About</span>
          </button>
          <button 
            onClick={() => setActiveTab('updates')}
            className={`flex flex-col items-center p-2 ${activeTab === 'updates' ? 'text-[#0E3692]' : 'text-gray-600'}`}
          >
            <Bell size={20} />
            <span className="text-xs mt-1">Updates</span>
          </button>
        </div>
      </footer>
    </div>
  );
}