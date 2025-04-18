import { useState } from 'react';
import './App.css'
import { 
  Menu, 
  X, 
  Bell, 
  Users, 
  FileText, 
  MessageSquare, 
  AlertCircle, 
  Settings, 
  User, 
  LogOut, 
  Calendar, 
  ChevronDown, 
  ChevronUp,
  Search,
  BarChart2
} from 'lucide-react';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false);
  
  // Mock data for the dashboard
  const stats = [
    { title: 'Total Reports', value: '324', change: '+12%' },
    { title: 'Active Cases', value: '76', change: '-3%' },
    { title: 'Resolved Cases', value: '248', change: '+18%' },
    { title: 'Response Rate', value: '94%', change: '+2%' },
  ];
  
  const recentReports = [
    { id: 'RPT-3829', category: 'Sexual Harassment', status: 'New', date: '18 Apr 2025', priority: 'High' },
    { id: 'RPT-3828', category: 'Domestic Violence', status: 'In Progress', date: '17 Apr 2025', priority: 'Medium' },
    { id: 'RPT-3827', category: 'Cyberbullying', status: 'In Progress', date: '16 Apr 2025', priority: 'Medium' },
    { id: 'RPT-3826', category: 'Sexual Assault', status: 'Escalated', date: '15 Apr 2025', priority: 'High' },
    { id: 'RPT-3825', category: 'Stalking', status: 'Resolved', date: '14 Apr 2025', priority: 'Low' },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Escalated': return 'bg-red-100 text-red-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-md">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">KU CGEE</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        <div className="p-4">
          <nav className="space-y-1">
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700">
              <BarChart2 className="w-5 h-5 mr-3" />
              Dashboard
            </a>
            
            <div>
              <button 
                onClick={() => setReportsDropdownOpen(!reportsDropdownOpen)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <FileText className="w-5 h-5 mr-3" />
                  Reports
                </div>
                {reportsDropdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {reportsDropdownOpen && (
                <div className="pl-10 mt-1 space-y-1">
                  <a href="#" className="block px-3 py-1 text-sm text-gray-700 rounded-md hover:bg-gray-100">
                    New Reports
                  </a>
                  <a href="#" className="block px-3 py-1 text-sm text-gray-700 rounded-md hover:bg-gray-100">
                    In Progress
                  </a>
                  <a href="#" className="block px-3 py-1 text-sm text-gray-700 rounded-md hover:bg-gray-100">
                    Resolved
                  </a>
                  <a href="#" className="block px-3 py-1 text-sm text-gray-700 rounded-md hover:bg-gray-100">
                    All Reports
                  </a>
                </div>
              )}
            </div>
            
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
              <Users className="w-5 h-5 mr-3" />
              Users Management
            </a>
            
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
              <MessageSquare className="w-5 h-5 mr-3" />
              Support Messages
            </a>
            
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
              <Calendar className="w-5 h-5 mr-3" />
              Events & Workshops
            </a>
            
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
              <Settings className="w-5 h-5 mr-3" />
              Settings
            </a>
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
            <h1 className="hidden ml-4 text-xl font-semibold text-gray-800 md:block">Admin Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full py-2 pl-10 pr-3 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <button className="p-1 text-gray-500 rounded-full hover:bg-gray-100">
              <Bell className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                AD
              </div>
              <span className="hidden text-sm font-medium text-gray-700 md:block">Admin</span>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Stats cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {stat.change}
                    </span>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-blue-700">{stat.value}</p>
                </div>
              ))}
            </div>
            
            {/* Recent reports */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Recent Reports</h2>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  View all
                </a>
              </div>
              
              <div className="overflow-hidden bg-white shadow rounded-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Report ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Priority
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentReports.map((report, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-700">
                            {report.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {report.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {report.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(report.priority)}`}>
                              {report.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button className="font-medium text-blue-600 hover:text-blue-500">
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Additional sections */}
            <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-2">
              {/* Emergency contacts section */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Emergency Contacts</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
                    <div>
                      <p className="text-sm font-medium text-gray-900">KU Security Office</p>
                      <p className="text-sm text-gray-500">24/7 Emergency Response</p>
                    </div>
                    <p className="text-sm font-medium text-blue-700">0725 471487</p>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Director of Students' Affairs</p>
                      <p className="text-sm text-gray-500">Administrative Support</p>
                    </div>
                    <p className="text-sm font-medium text-blue-700">020 8704470</p>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Private Advisor for Sexual Assault</p>
                      <p className="text-sm text-gray-500">Confidential Support</p>
                    </div>
                    <p className="text-sm font-medium text-blue-700">0798 416091</p>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
                    <div>
                      <p className="text-sm font-medium text-gray-900">KU Health Unit</p>
                      <p className="text-sm text-gray-500">24/7 Free Services</p>
                    </div>
                    <p className="text-sm font-medium text-blue-700">Contact via App</p>
                  </div>
                </div>
                <button className="mt-4 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md">
                  Update Emergency Contacts
                </button>
              </div>
              
              {/* Quick actions section */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 bg-blue-50 rounded-lg flex flex-col items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">Create Alert</span>
                  </button>
                  
                  <button className="p-4 bg-blue-50 rounded-lg flex flex-col items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">Send Notification</span>
                  </button>
                  
                  <button className="p-4 bg-blue-50 rounded-lg flex flex-col items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">Generate Report</span>
                  </button>
                  
                  <button className="p-4 bg-blue-50 rounded-lg flex flex-col items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">Schedule Event</span>
                  </button>
                </div>
                
                <h3 className="text-md font-medium text-gray-900 mt-6 mb-2">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-gray-500">New report submitted 5 minutes ago</p>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-gray-500">Case status updated 42 minutes ago</p>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <p className="text-gray-500">New message from support 1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}