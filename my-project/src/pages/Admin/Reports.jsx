import { useState, useEffect } from 'react';
import { 
  FileText, 
  RefreshCw, 
  X, 
  Download, 
  Maximize2, 
  Minimize2,
  MoreVertical,
  Check,
  Clock,
  AlertCircle,
  List,
  ChevronDown
} from 'lucide-react';
import AdminLayout from '/src/pages/Admin/AdminLayout';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  
  // Define the media URL base
  const MEDIA_URL = 'http://localhost:8000/media/';

  // Calculate counts for each status
  const reportCounts = {
    all: reports.length,
    new: reports.filter(report => report.status?.toLowerCase() === 'new').length,
    pending: reports.filter(report => report.status?.toLowerCase() === 'pending').length,
    completed: reports.filter(report => report.status?.toLowerCase() === 'completed').length
  };
  
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/reports/list/');
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      const data = await response.json();
      setReports(data);
      setFilteredReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Filter reports based on active tab
  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredReports(reports);
    } else {
      setFilteredReports(reports.filter(report => 
        report.status?.toLowerCase() === activeTab.toLowerCase()
      ));
    }
  }, [activeTab, reports]);

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    if (status.toLowerCase() === 'new') return 'bg-blue-100 text-blue-800';
    if (status.toLowerCase().includes('progress') || status.toLowerCase() === 'pending') 
      return 'bg-yellow-100 text-yellow-800';
    if (status.toLowerCase().includes('resolved') || status.toLowerCase() === 'completed') 
      return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const openReportModal = (report) => {
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

  const toggleDropdown = (reportId) => {
    setActiveDropdown(activeDropdown === reportId ? null : reportId);
  };

  const updateReportStatus = async (reportId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:8000/api/reports/${reportId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update report status');
      }

      setReports(reports.map(report => 
        report.id === reportId ? { ...report, status: newStatus } : report
      ));

      setActiveDropdown(null);
      
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport({ ...selectedReport, status: newStatus });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getEvidenceUrl = (evidencePath) => {
    if (!evidencePath) return null;
    
    if (evidencePath.startsWith('http')) {
      return evidencePath;
    }
    
    const path = evidencePath.startsWith('evidence/') 
      ? evidencePath 
      : `evidence/${evidencePath}`;
      
    return `${MEDIA_URL}${path}`;
  };

  const isImage = (filename) => {
    if (!filename) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  return (
    <AdminLayout activeNavItem="Reports">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            Error: {error}
          </div>
        )}
        
        {/* Status Tabs with Counts */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex flex-col items-center px-4 py-2 text-sm rounded-md ${activeTab === 'all' ? 'bg-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <div className="flex items-center">
                <List className="w-4 h-4 mr-2" />
                All
              </div>
              <span className="text-xs font-medium mt-1">{reportCounts.all}</span>
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`flex flex-col items-center px-4 py-2 text-sm rounded-md ${activeTab === 'new' ? 'bg-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-blue-500" />
                New
              </div>
              <span className="text-xs font-medium mt-1">{reportCounts.new}</span>
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex flex-col items-center px-4 py-2 text-sm rounded-md ${activeTab === 'pending' ? 'bg-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                Pending
              </div>
              <span className="text-xs font-medium mt-1">{reportCounts.pending}</span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex flex-col items-center px-4 py-2 text-sm rounded-md ${activeTab === 'completed' ? 'bg-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <div className="flex items-center">
                <Check className="w-4 h-4 mr-2 text-green-500" />
                Completed
              </div>
              <span className="text-xs font-medium mt-1">{reportCounts.completed}</span>
            </button>
          </div>
          <button 
            onClick={fetchReports}
            className="flex items-center space-x-1 p-2 text-gray-500 rounded-md hover:bg-gray-100"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Refresh</span>
          </button>
        </div>
        
        {/* Reports Table */}
        <div className="overflow-hidden bg-white shadow rounded-lg">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Loading reports...
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No {activeTab === 'all' ? '' : activeTab} reports found
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {report.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {report.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(report.status)}`}>
                          {report.status || 'New'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(report.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm flex items-center space-x-2">
                        <button
                          onClick={() => openReportModal(report)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          View
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => toggleDropdown(report.id)}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {activeDropdown === report.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
                              <button
                                onClick={() => updateReportStatus(report.id, 'New')}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <AlertCircle className="w-4 h-4 mr-2 text-blue-500" />
                                Mark as New
                              </button>
                              <button
                                onClick={() => updateReportStatus(report.id, 'Pending')}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                                Mark as Pending
                              </button>
                              <button
                                onClick={() => updateReportStatus(report.id, 'Completed')}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <Check className="w-4 h-4 mr-2 text-green-500" />
                                Mark as Completed
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
                          <p className="text-gray-800 font-medium">{selectedReport.category}</p>
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
                  <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                    <div className="relative">
                      <button
                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                        className="flex items-center space-x-1 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        <span>Change Status</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {showStatusDropdown && (
                        <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
                          <button
                            onClick={() => {
                              updateReportStatus(selectedReport.id, 'New');
                              setShowStatusDropdown(false);
                            }}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            <AlertCircle className="w-4 h-4 mr-2 text-blue-500" />
                            Mark as New
                          </button>
                          <button
                            onClick={() => {
                              updateReportStatus(selectedReport.id, 'Pending');
                              setShowStatusDropdown(false);
                            }}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                            Mark as Pending
                          </button>
                          <button
                            onClick={() => {
                              updateReportStatus(selectedReport.id, 'Completed');
                              setShowStatusDropdown(false);
                            }}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            <Check className="w-4 h-4 mr-2 text-green-500" />
                            Mark as Completed
                          </button>
                        </div>
                      )}
                    </div>
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