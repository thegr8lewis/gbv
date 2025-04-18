// pages/admin/dashboard.jsx
import { useState, useEffect } from 'react';
import { 
  AlertCircle,
  Bell,
  FileOutput,
  Calendar as CalendarIcon,
  Clock
} from 'lucide-react';
import AdminLayout from '/src/pages/Admin/AdminLayout';

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalReports: 0,
    activeCases: 0,
    resolvedCases: 0,
    responseRate: 0
  });
  
  // Fetch reports from API
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/reports/list/');
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      const data = await response.json();
      setReports(data);
      processReportsData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Process reports data to generate stats and recent reports
  const processReportsData = (data) => {
    const total = data.length;
    const active = data.filter(report => 
      report.status?.toLowerCase() === 'new' || 
      report.status?.toLowerCase().includes('progress')
    ).length;
    const resolved = data.filter(report => 
      report.status?.toLowerCase().includes('resolved') || 
      report.status?.toLowerCase().includes('escalated')
    ).length;
    
    setStats({
      totalReports: total,
      activeCases: active,
      resolvedCases: resolved,
      responseRate: Math.round((resolved / (total || 1)) * 100)
    });

    const sorted = [...data].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    ).slice(0, 5);
    
    setRecentReports(sorted.map(report => ({
      id: report.id,
      reportId: `RPT-${report.id}`,
      category: report.category || 'Uncategorized',
      status: report.status || 'New',
      date: formatDate(report.created_at),
      priority: getPriority(report.category)
    })));
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getPriority = (category) => {
    if (category?.toLowerCase().includes('sexual') || category?.toLowerCase().includes('assault')) 
      return 'High';
    if (category?.toLowerCase().includes('stalking')) 
      return 'Low';
    return 'Medium';
  };

  const getStatusClass = (status) => {
    if (status.toLowerCase() === 'new') 
      return 'bg-blue-100 text-blue-800';
    if (status.toLowerCase().includes('progress')) 
      return 'bg-yellow-100 text-yellow-800';
    if (status.toLowerCase().includes('resolved')) 
      return 'bg-green-100 text-green-800';
    if (status.toLowerCase().includes('escalated')) 
      return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getPriorityClass = (priority) => {
    if (priority.toLowerCase() === 'high') 
      return 'text-red-600';
    if (priority.toLowerCase() === 'medium') 
      return 'text-yellow-600';
    return 'text-green-600';
  };

  const emergencyContacts = [
    { 
      title: 'KU Security Office',
      description: '24/7 Emergency Response',
      phone: '0725 471487'
    },
    { 
      title: 'Director of Students Affairs',
      description: 'Administrative Support',
      phone: '020 8704470'
    },
    { 
      title: 'Private Advisor for Sexual Assault',
      description: 'Confidential Support',
      phone: '0798 416091'
    },
    { 
      title: 'KU Health Unit',
      description: '24/7 Free Services',
      phone: ''
    }
  ];

  const quickActions = [
    { 
      title: 'Create Alert',
      icon: <AlertCircle className="w-6 h-6 text-blue-500" />,
      onClick: () => console.log('Create Alert clicked')
    },
    { 
      title: 'Send Notification',
      icon: <Bell className="w-6 h-6 text-blue-500" />,
      onClick: () => console.log('Send Notification clicked')
    },
    { 
      title: 'Generate Report',
      icon: <FileOutput className="w-6 h-6 text-blue-500" />,
      onClick: () => console.log('Generate Report clicked')
    },
    { 
      title: 'Schedule Event',
      icon: <CalendarIcon className="w-6 h-6 text-blue-500" />,
      onClick: () => console.log('Schedule Event clicked')
    }
  ];

  const recentActivity = [
    { text: 'New report submitted', time: '5 minutes ago', type: 'report' },
    { text: 'Case status updated', time: '42 minutes ago', type: 'update' },
    { text: 'New message from support', time: '1 hour ago', type: 'message' }
  ];

  return (
    <AdminLayout activeNavItem="Dashboard">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            Error: {error}
          </div>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm text-gray-500">Total Reports</h3>
              <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">+12%</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.totalReports}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm text-gray-500">Active Cases</h3>
              <span className="text-xs font-medium bg-red-100 text-red-800 px-2 py-0.5 rounded-full">-3%</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.activeCases}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm text-gray-500">Resolved Cases</h3>
              <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">+18%</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.resolvedCases}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm text-gray-500">Response Rate</h3>
              <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">+2%</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.responseRate}%</p>
          </div>
        </div>
        
        {/* Recent Reports */}
        <div className="mt-6 bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Recent Reports</h2>
            <a href="#" className="text-sm text-blue-600 hover:underline">View all</a>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Loading reports....
              </div>
            ) : recentReports.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No reports found
              </div>
            ) : (
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
                  {recentReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-blue-600">{report.reportId}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{report.category}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(report.status)}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{report.date}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getPriorityClass(report.priority)}`}>
                          {report.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a href="#" className="text-sm text-blue-600 hover:underline">View</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
        {/* Two-column layout for Emergency Contacts and Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Emergency Contacts */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium text-gray-900">Emergency Contacts</h2>
            </div>
            <div className="p-4">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{contact.title}</h3>
                      <p className="text-xs text-gray-500">{contact.description}</p>
                    </div>
                    {contact.phone && (
                      <span className="text-sm text-blue-600">{contact.phone}</span>
                    )}
                  </div>
                  {index < emergencyContacts.length - 1 && <hr className="mt-3" />}
                </div>
              ))}
              <button className="w-full mt-2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Update Emergency Contacts
              </button>
            </div>
          </div>
          
          {/* Quick Actions and Recent Activity */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <button 
                    key={index}
                    onClick={action.onClick}
                    className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {action.icon}
                    <span className="mt-2 text-sm text-gray-700">{action.title}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-4">
                <ul className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <li key={index} className="flex items-start">
                      <span 
                        className={`mt-1 mr-3 w-2 h-2 rounded-full ${
                          activity.type === 'report' ? 'bg-blue-500' : 
                          activity.type === 'update' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                      />
                      <div>
                        <p className="text-sm text-gray-700">{activity.text}</p>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {activity.time}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-center">
                  <a href="#" className="text-sm text-blue-600 hover:underline">
                    Contact via App
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}