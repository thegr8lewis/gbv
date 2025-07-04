import { useState, useEffect } from 'react';
import { 
  AlertCircle,
  Bell,
  FileOutput,
  Calendar as CalendarIcon,
  Clock,
  FileText,
  X,
  Maximize2,
  Minimize2,
  Download,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '/src/pages/Admin/AdminLayout.jsx';

export default function Dashboard() {
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

  // Rest of your existing state
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
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(false);
  
  // Define the media URL base - adjust this to match your Django settings
  const MEDIA_URL = 'http://localhost:8000/media/';
  
  // Fetch reports from API
  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:8000/api/reports/list/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('is_staff');
        navigate('/login');
        return;
      }

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
      report.status?.toLowerCase() === 'pending'
    ).length;
    const completed = data.filter(report => 
      report.status?.toLowerCase() === 'completed'
    ).length;
    
    setStats({
      totalReports: total,
      activeCases: active,
      resolvedCases: completed,
      responseRate: Math.round((completed / (total || 1)) * 100)
    });

    const sorted = [...data].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    ).slice(0, 5);
    
    setRecentReports(sorted);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getPriority = (category) => {
    if (!category) return 'Medium';
    if (category.toLowerCase().includes('sexual') || category.toLowerCase().includes('assault')) 
      return 'High';
    if (category.toLowerCase().includes('stalking')) 
      return 'Low';
    return 'Medium';
  };

  const getStatusClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const statusLower = status.toLowerCase();
    if (statusLower === 'new') return 'bg-blue-100 text-blue-800';
    if (statusLower === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (statusLower === 'completed') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getPriorityClass = (priority) => {
    if (!priority) return 'text-yellow-600';
    if (priority.toLowerCase() === 'high') 
      return 'text-red-600';
    if (priority.toLowerCase() === 'medium') 
      return 'text-yellow-600';
    return 'text-green-600';
  };

  const openModal = (report) => {
    setSelectedReport(report);
    setShowModal(true);
    setFullscreenImage(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReport(null);
    setFullscreenImage(false);
  };

  const toggleImageFullscreen = () => {
    setFullscreenImage(!fullscreenImage);
  };

  // Function to construct the proper media URL
  const getEvidenceUrl = (evidencePath) => {
    if (!evidencePath) return null;
    
    // If the path already includes the full URL, return it as is
    if (evidencePath.startsWith('http')) {
      return evidencePath;
    }
    
    // If it's just the filename or a relative path, prepend the media URL
    const path = evidencePath.startsWith('evidence/') 
      ? evidencePath 
      : `evidence/${evidencePath}`;
      
    return `${MEDIA_URL}${path}`;
  };

  // Check if the evidence is an image based on file extension
  const isImage = (filename) => {
    if (!filename) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
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

    if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
              <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">+12%</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.totalReports}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm text-gray-500">Active Cases</h3>
              <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">-3%</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.activeCases}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm text-gray-500">Completed Cases</h3>
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
            <div className="flex items-center space-x-2">
              <button 
                onClick={fetchReports}
                className="flex items-center space-x-1 p-1 text-gray-500 rounded-md hover:bg-gray-100"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <a href="/admin/reports" className="text-sm text-blue-600 hover:underline">View all</a>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Loading reports...
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
                      Date Reported
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
                        <span className="text-sm font-medium text-blue-600">RPT-{report.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{report.category || 'Uncategorized'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(report.status)}`}>
                          {report.status || 'New'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{formatDate(report.created_at)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getPriorityClass(getPriority(report.category))}`}>
                          {getPriority(report.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => openModal(report)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View
                        </button>
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

      {/* Report Detail Modal */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
          <div 
            className={`bg-white rounded-xl shadow-2xl ${
              fullscreenImage ? 'w-full h-full m-0 rounded-none' : 'max-w-5xl w-full max-h-[90vh] mx-4'
            } overflow-hidden transform transition-all duration-300 flex flex-col`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-8 py-5 bg-gradient-to-r from-indigo-50 to-blue-50">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  <FileText className="w-4 h-4" />
                </span>
                Report #{selectedReport.id}
              </h3>
              <button 
                onClick={closeModal} 
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`${fullscreenImage ? '' : 'p-6'} overflow-y-auto flex-1`}>
              {/* Fullscreen Image View */}
              {fullscreenImage && selectedReport.evidence && isImage(selectedReport.evidence) && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 flex items-center justify-center bg-gray-900 p-4">
                    <img 
                      src={getEvidenceUrl(selectedReport.evidence)} 
                      alt="Report evidence" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex justify-between items-center p-6 bg-gray-900 text-white">
                    <div className="text-sm text-gray-300">
                      Evidence for Report #{selectedReport.id}
                    </div>
                    <button
                      onClick={toggleImageFullscreen}
                      className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 flex items-center transition-colors"
                    >
                      <Minimize2 className="w-4 h-4 mr-2" />
                      Exit Fullscreen
                    </button>
                  </div>
                </div>
              )}

              {/* Normal Modal Content */}
              {!fullscreenImage && (
                <>
                  {/* Status Banner */}
                  <div className={`mb-6 p-3 rounded-lg ${getStatusClass(selectedReport.status || 'New')}`}>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-current mr-2 animate-pulse"></div>
                      <span className="font-medium">Status: {selectedReport.status || 'New'}</span>
                      <span className="ml-auto text-sm">Reported on {formatDate(selectedReport.created_at)}</span>
                    </div>
                  </div>

                  {/* Content Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column - Report Details */}
                    <div className="md:col-span-2 space-y-6">
                      <div className="bg-gray-50 p-5 rounded-lg">
                        <h4 className="text-sm uppercase font-bold text-gray-500 mb-3 flex items-center">
                          Description
                        </h4>
                        <p className="text-gray-800 whitespace-pre-wrap">{selectedReport.description}</p>
                      </div>

                      <div className="bg-gray-50 p-5 rounded-lg">
                        <h4 className="text-sm uppercase font-bold text-gray-500 mb-3">
                          Perpetrator Details
                        </h4>
                        <p className="text-gray-800 whitespace-pre-wrap">
                          {selectedReport.perpetrator_details || 'No details provided'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-xs uppercase font-bold text-gray-500 mb-2">
                            Category
                          </h4>
                          <p className="text-gray-800 font-medium">{selectedReport.category || 'Not specified'}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-xs uppercase font-bold text-gray-500 mb-2">
                            Location
                          </h4>
                          <p className="text-gray-800 font-medium">{selectedReport.location || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Contact & Evidence */}
                    <div className="space-y-6">
                      {/* Reporter Info Card */}
                      <div className="bg-blue-50 border border-blue-100 p-5 rounded-lg">
                        <h4 className="text-sm uppercase font-bold text-blue-700 mb-4 flex items-center">
                          Reporter Information
                        </h4>
                        
                        <div className="space-y-4">
                          <div>
                            <h5 className="text-xs font-medium text-blue-600">Anonymous Report</h5>
                            <p className="mt-1 font-medium">
                              {selectedReport.anonymous ? 'Yes' : 'No'}
                            </p>
                          </div>
                          
                          {!selectedReport.anonymous && (
                            <>
                              <div>
                                <h5 className="text-xs font-medium text-blue-600">Contact Phone</h5>
                                <p className="mt-1 font-medium">{selectedReport.contact_phone || 'Not provided'}</p>
                              </div>
                              
                              <div>
                                <h5 className="text-xs font-medium text-blue-600">Contact Email</h5>
                                <p className="mt-1 font-medium">{selectedReport.contact_email || 'Not provided'}</p>
                              </div>
                            </>
                          )}
                          
                          <div>
                            <h5 className="text-xs font-medium text-blue-600">Gender</h5>
                            <p className="mt-1 font-medium">{selectedReport.gender || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Evidence Card */}
                      <div className="bg-gray-50 border border-gray-100 p-5 rounded-lg">
                        <h4 className="text-sm uppercase font-bold text-gray-500 mb-4">
                          Evidence
                        </h4>
                        
                        {selectedReport.evidence ? (
                          <div>
                            {isImage(selectedReport.evidence) ? (
                              <div className="space-y-3">
                                <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                  <div className="relative group">
                                    <img 
                                      src={getEvidenceUrl(selectedReport.evidence)} 
                                      alt="Report evidence" 
                                      className="w-full cursor-pointer transform transition hover:scale-[1.02]"
                                      onClick={toggleImageFullscreen}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                                      <button
                                        onClick={toggleImageFullscreen}
                                        className="bg-white/90 p-2 rounded-lg flex items-center shadow-md text-sm font-medium transition hover:bg-white"
                                      >
                                        <Maximize2 className="w-4 h-4 mr-1" />
                                        View Full Size
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                
                                <a 
                                  href={getEvidenceUrl(selectedReport.evidence)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center w-full py-2 px-4 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download Original
                                </a>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center bg-white border border-gray-200 rounded-lg p-4">
                                <a 
                                  href={getEvidenceUrl(selectedReport.evidence)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center py-2 px-4 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  View Evidence
                                </a>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center text-gray-500">
                            No evidence provided
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions Footer */}
                  <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={closeModal}
                      className="px-6 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition shadow-sm"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}