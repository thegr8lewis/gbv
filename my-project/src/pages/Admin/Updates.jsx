import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Bell, Edit2, Trash2, X, Send, PlusCircle } from 'lucide-react';
import AdminLayout from '/src/pages/Admin/AdminLayout.jsx';

export default function Updates() {
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

  // State management
  const [updates, setUpdates] = useState([]);
  const [newUpdate, setNewUpdate] = useState({
    title: "",
    content: "",
    date: new Date().toISOString().split('T')[0]
  });
  const [editingUpdateId, setEditingUpdateId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
  
  // Modal states
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState({ id: null, type: null, title: null });

  // Get auth token with validation
  const getAuthToken = () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/login');
      return null;
    }
    return token;
  };

  // Fetch data function with auth check
  const fetchUpdates = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch('http://localhost:8000/api/updates/', {
        headers: { 'Authorization': `Token ${token}` }
      });

      if (response.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('is_staff');
        navigate('/login');
        return;
      }

      if (response.ok) {
        setUpdates(await response.json());
      } else {
        throw new Error('Failed to fetch updates');
      }
    } catch (error) {
      setStatusMessage({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authChecked) {
      fetchUpdates();
    }
  }, [authChecked]);

  // Helper function
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Delete confirmation handlers with auth check
  const confirmDelete = (id, type, title) => {
    setItemToDelete({ id, type, title });
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete({ id: null, type: null, title: null });
  };

  const executeDelete = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`http://localhost:8000/api/updates/${itemToDelete.id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });

      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('is_staff');
        navigate('/login');
        return;
      }
      
      if (response.ok) {
        setUpdates(updates.filter(update => update.id !== itemToDelete.id));
        setStatusMessage({ type: 'success', message: 'Update deleted successfully!' });
      } else {
        throw new Error('Failed to delete update');
      }
    } catch (error) {
      setStatusMessage({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
      setItemToDelete({ id: null, type: null, title: null });
    }
  };

  // Update handlers with auth checks
  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    if (editingUpdateId) {
      setUpdates(updates.map(update => 
        update.id === editingUpdateId ? { ...update, [name]: value } : update
      ));
    } else {
      setNewUpdate({ ...newUpdate, [name]: value });
    }
  };

  const handleCreateUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch('http://localhost:8000/api/updates/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(newUpdate)
      });

      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('is_staff');
        navigate('/login');
        return;
      }
      
      if (response.ok) {
        const createdUpdate = await response.json();
        setUpdates([createdUpdate, ...updates]);
        setNewUpdate({
          title: "",
          content: "",
          date: new Date().toISOString().split('T')[0]
        });
        setShowUpdateModal(false);
        setStatusMessage({ type: 'success', message: 'Update published successfully!' });
      } else {
        throw new Error('Failed to create update');
      }
    } catch (error) {
      setStatusMessage({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUpdate = (updateId) => {
    setEditingUpdateId(updateId);
    const updateToEdit = updates.find(update => update.id === updateId);
    setNewUpdate({
      title: updateToEdit.title,
      content: updateToEdit.content,
      date: updateToEdit.date
    });
    setShowUpdateModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`http://localhost:8000/api/updates/${editingUpdateId}/`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(newUpdate)
      });

      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('is_staff');
        navigate('/login');
        return;
      }
      
      if (response.ok) {
        setStatusMessage({ type: 'success', message: 'Update saved successfully!' });
        setEditingUpdateId(null);
        setShowUpdateModal(false);
        fetchUpdates();
      } else {
        throw new Error('Failed to save update');
      }
    } catch (error) {
      setStatusMessage({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingUpdateId(null);
    setShowUpdateModal(false);
    setNewUpdate({
      title: "",
      content: "",
      date: new Date().toISOString().split('T')[0]
    });
  };

  const openUpdateModal = () => {
    setShowUpdateModal(true);
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    if (editingUpdateId) {
      setEditingUpdateId(null);
      setNewUpdate({
        title: "",
        content: "",
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  // Only render the component if authentication is confirmed
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Loading updates...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout activeNavItem="Updates">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
                <button 
                  onClick={cancelDelete}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mt-4">
                <p className="text-gray-600">
                  Are you sure you want to delete this update?
                </p>
                {itemToDelete.title && (
                  <p className="mt-2 font-medium text-gray-900">
                    "{itemToDelete.title}"
                  </p>
                )}
                <p className="mt-2 text-sm text-red-600">
                  This action cannot be undone.
                </p>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeDelete}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center"
                >
                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  {isLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Update Modal */}
        {showUpdateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 transform transition-all">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingUpdateId ? 'Edit Update' : 'Create New Update'}
                </h3>
                <button 
                  onClick={closeUpdateModal}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={editingUpdateId ? handleSaveEdit : handleCreateUpdate}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={newUpdate.title}
                      onChange={handleUpdateInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="What's new?"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={newUpdate.date}
                      onChange={handleUpdateInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea
                      id="content"
                      name="content"
                      rows="6"
                      value={newUpdate.content}
                      onChange={handleUpdateInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="Write your update here..."
                      required
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center"
                    >
                      {isLoading ? (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      {isLoading ? (editingUpdateId ? 'Saving...' : 'Publishing...') : (editingUpdateId ? 'Save Changes' : 'Publish Update')}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Bell className="w-6 h-6 text-indigo-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Updates</h1>
          </div>
          <button
            onClick={openUpdateModal}
            className="px-4 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md flex items-center"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            New Update
          </button>
        </div>

        {statusMessage.message && (
          <div className={`mb-6 p-4 rounded-lg shadow-sm ${
            statusMessage.type === 'success' 
              ? 'bg-green-50 border-l-4 border-green-500 text-green-700' 
              : 'bg-red-50 border-l-4 border-red-500 text-red-700'
          }`}>
            <div className="flex justify-between items-center">
              <p className="font-medium">{statusMessage.message}</p>
              <button 
                onClick={() => setStatusMessage({ type: '', message: '' })}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {isLoading && updates.length === 0 && (
          <div className="flex justify-center items-center py-20">
            <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
          
        {/* List of Existing Updates */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Published Updates</h2>
                <p className="text-sm text-gray-500 mt-1">{updates.length} updates published</p>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {updates.length === 0 && !isLoading ? (
              <div className="p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No updates yet</h3>
                <p className="text-gray-500 mb-6">Share news and announcements with your users</p>
                <button
                  onClick={openUpdateModal}
                  className="px-4 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm flex items-center mx-auto"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Create Your First Update
                </button>
              </div>
            ) : (
              updates.map((update) => (
                <div key={update.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">{update.title}</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditUpdate(update.id)}
                            className="p-1 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit update"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => confirmDelete(update.id, 'update', update.title)}
                            className="p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete update"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 flex items-center">
                        <Calendar className="w-4 h-4 mr-1.5" />
                        {formatDate(update.date)}
                        {update.author && (
                          <span className="ml-3">Posted by: {update.author}</span>
                        )}
                      </p>
                      <p className="text-gray-700 mt-3 whitespace-pre-line">{update.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}