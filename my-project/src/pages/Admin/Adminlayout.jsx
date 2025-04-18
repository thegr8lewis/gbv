// components/AdminLayout.jsx
import { useState } from 'react';
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

export default function AdminLayout({ children, activeNavItem }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', icon: <BarChart2 className="w-5 h-5" /> },
    { name: 'Reports', icon: <FileText className="w-5 h-5" /> },
    { name: 'Support', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Events', icon: <Calendar className="w-5 h-5" /> },
    { name: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block`}>
        <div className="flex items-center h-16 px-6 border-b">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-md">
              <span className="text-white font-bold">KU</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">KU CGEE</span>
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
            
            <button className="p-2 text-gray-500 bg-gray-100 rounded-full">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">AD</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Admin</span>
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