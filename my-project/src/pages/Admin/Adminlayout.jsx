// components/AdminLayout.jsx
import { useState, useEffect } from 'react';
import kenyanFlag from "/src/assets/kenyanflag.png";
import { 
  Menu, 
  X, 
  BarChart2,
  FileText,
  Users,
  MessageSquare,
  Calendar,
  Settings,
  Search,
  Bell,
  Clock
} from 'lucide-react';
import axios from 'axios';

export default function AdminLayout({ children, activeNavItem }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState('Admin');
  const [newReportsCount, setNewReportsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch admin details
    const fetchAdminDetails = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/admin/details/', {
          headers: {
            'Authorization': `Token ${localStorage.getItem('auth_token')}`
          }
        });
        setAdminName(response.data.name);
      } catch (error) {
        console.error('Error fetching admin details:', error);
      }
    };

    // Fetch new reports count
    const fetchNewReportsCount = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/reports/count/?status=New', {
          headers: {
            'Authorization': `Token ${localStorage.getItem('auth_token')}`
          }
        });
        setNewReportsCount(response.data.count);
      } catch (error) {
        console.error('Error fetching reports count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDetails();
    fetchNewReportsCount();

    // Set up polling for new reports (every 5 minutes)
    const interval = setInterval(fetchNewReportsCount, 300000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: 'Dashboard', icon: <BarChart2 className="w-5 h-5" /> },
    { name: 'Reports', icon: <FileText className="w-5 h-5" /> },
    { name: 'Support', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Events', icon: <Calendar className="w-5 h-5" /> },
    { name: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  // Get initials from admin name
  const getInitials = (name) => {
    if (!name) return 'AD';
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block`}>
        <div className="flex items-center h-16 px-6 border-b">
        <div className="flex items-center space-x-3">
  <img 
    src={kenyanFlag} 
    alt="Kenyan Flag" 
    className="h-12 w-auto"
  />
  <div className="flex flex-col">
    <h1 className="text-2xl font-bold">ADMIN</h1>
    <p className="text-sm font-semibold text-gray-600">SafeSpace</p>
  </div>
</div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        <div className="p-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={`/admin/${item.name.toLowerCase().replace(' ', '-')}`}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                  activeNavItem === item.name
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navbar */}
        <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 sm:px-6">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-500 lg:hidden">
              <Menu className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="p-2 text-gray-500 bg-gray-100 rounded-full relative">
                <Bell className="w-5 h-5" />
                {newReportsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {newReportsCount}
                  </span>
                )}
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {getInitials(adminName)}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {adminName}
              </span>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}