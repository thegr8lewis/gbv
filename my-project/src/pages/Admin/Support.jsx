// pages/admin/support-messages.jsx
import { useState, useEffect } from 'react';
import { MessageSquare, Calendar, Bell, Edit2, Trash2, X, Plus, Send, MapPin, Clock } from 'lucide-react';
import AdminLayout from '/src/pages/Admin/AdminLayout.jsx';

export default function SupportMessages() {
  // State management
  const [messages, setMessages] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [events, setEvents] = useState([]);
  const [newUpdate, setNewUpdate] = useState({
    title: "",
    content: "",
    date: new Date().toISOString().split('T')[0]
  });
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    time: "18:00",
    location: ""
  });
  const [editingUpdateId, setEditingUpdateId] = useState(null);
  const [editingEventId, setEditingEventId] = useState(null);
  const [activeTab, setActiveTab] = useState('messages');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState({ id: null, type: null, title: null });

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('auth_token');
  };

  // Fetch data functions (unchanged from previous version)
  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/support-messages/', {
        headers: { 'Authorization': `Token ${getAuthToken()}` }
      });
      if (response.ok) {
        setMessages(await response.json());
      } else {
        throw new Error('Failed to fetch messages');
      }
    } catch (error) {
      setStatusMessage({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUpdates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/updates/', {
        headers: { 'Authorization': `Token ${getAuthToken()}` }
      });
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

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/events/', {
        headers: { 'Authorization': `Token ${getAuthToken()}` }
      });
      if (response.ok) {
        setEvents(await response.json());
      } else {
        throw new Error('Failed to fetch events');
      }
    } catch (error) {
      setStatusMessage({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'messages') {
      fetchMessages();
    } else if (activeTab === 'updates') {
      fetchUpdates();
    } else if (activeTab === 'events') {
      fetchEvents();
    }
  }, [activeTab]);

  // Helper functions (unchanged from previous version)
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Delete confirmation handlers
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
      let endpoint = '';
      if (itemToDelete.type === 'event') {
        endpoint = `http://localhost:8000/api/events/${itemToDelete.id}/`;
      } else if (itemToDelete.type === 'update') {
        endpoint = `http://localhost:8000/api/updates/${itemToDelete.id}/`;
      } else if (itemToDelete.type === 'message') {
        endpoint = `http://localhost:8000/api/support-messages/${itemToDelete.id}/`;
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${getAuthToken()}` }
      });
      
      if (response.ok) {
        if (itemToDelete.type === 'event') {
          setEvents(events.filter(event => event.id !== itemToDelete.id));
        } else if (itemToDelete.type === 'update') {
          setUpdates(updates.filter(update => update.id !== itemToDelete.id));
        } else if (itemToDelete.type === 'message') {
          setMessages(messages.filter(msg => msg.id !== itemToDelete.id));
        }
        
        setStatusMessage({ type: 'success', message: `${itemToDelete.type.charAt(0).toUpperCase() + itemToDelete.type.slice(1)} deleted successfully!` });
      } else {
        throw new Error(`Failed to delete ${itemToDelete.type}`);
      }
    } catch (error) {
      setStatusMessage({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
      setItemToDelete({ id: null, type: null, title: null });
    }
  };

  // Update handlers (unchanged except for delete which now uses confirmDelete)
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
      const response = await fetch('http://localhost:8000/api/updates/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Token ${getAuthToken()}`
        },
        body: JSON.stringify(newUpdate)
      });
      
      if (response.ok) {
        const createdUpdate = await response.json();
        setUpdates([createdUpdate, ...updates]);
        setNewUpdate({
          title: "",
          content: "",
          date: new Date().toISOString().split('T')[0]
        });
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
  };

  const handleSaveEdit = async () => {
    setIsLoading(true);
    try {
      const updateToSave = updates.find(update => update.id === editingUpdateId);
      const response = await fetch(`http://localhost:8000/api/updates/${editingUpdateId}/`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Token ${getAuthToken()}`
        },
        body: JSON.stringify(updateToSave)
      });
      
      if (response.ok) {
        setStatusMessage({ type: 'success', message: 'Update saved successfully!' });
        setEditingUpdateId(null);
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
    fetchUpdates();
  };

  // Event handlers (unchanged except for delete which now uses confirmDelete)
  const handleEventInputChange = (e) => {
    const { name, value } = e.target;
    if (editingEventId) {
      setEvents(events.map(event => 
        event.id === editingEventId ? { ...event, [name]: value } : event
      ));
    } else {
      setNewEvent({ ...newEvent, [name]: value });
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/events/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Token ${getAuthToken()}`
        },
        body: JSON.stringify(newEvent)
      });
      
      if (response.ok) {
        const createdEvent = await response.json();
        setEvents([createdEvent, ...events]);
        setNewEvent({
          title: "",
          description: "",
          date: new Date().toISOString().split('T')[0],
          time: "18:00",
          location: ""
        });
        setStatusMessage({ type: 'success', message: 'Event created successfully!' });
      } else {
        throw new Error('Failed to create event');
      }
    } catch (error) {
      setStatusMessage({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEvent = (eventId) => {
    const eventToEdit = events.find(event => event.id === eventId);
    if (eventToEdit) {
      setEditingEventId(eventId);
    }
  };

  const handleSaveEvent = async () => {
    setIsLoading(true);
    try {
      const eventToSave = events.find(event => event.id === editingEventId);
      const response = await fetch(`http://localhost:8000/api/events/${editingEventId}/`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Token ${getAuthToken()}`
        },
        body: JSON.stringify(eventToSave)
      });
      
      if (response.ok) {
        setStatusMessage({ type: 'success', message: 'Event saved successfully!' });
        setEditingEventId(null);
        fetchEvents();
      } else {
        throw new Error('Failed to save event');
      }
    } catch (error) {
      setStatusMessage({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEventEdit = () => {
    setEditingEventId(null);
    fetchEvents();
  };

  // Message handlers (unchanged except for delete which now uses confirmDelete)
  const handleMarkAsRead = async (messageId, currentStatus) => {
    const newStatus = currentStatus === 'unread' ? 'read' : 'unread';
    try {
      const response = await fetch(`http://localhost:8000/api/support-messages/${messageId}/`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Token ${getAuthToken()}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setMessages(messages.map(msg => 
          msg.id === messageId ? { ...msg, status: newStatus } : msg
        ));
      } else {
        throw new Error('Failed to update message status');
      }
    } catch (error) {
      setStatusMessage({ type: 'error', message: error.message });
    }
  };

  return (
    <AdminLayout activeNavItem="Support Messages">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
                <button 
                  onClick={cancelDelete}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mt-4">
                <p className="text-gray-600">
                  Are you sure you want to delete this {itemToDelete.type}?
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

        {/* Rest of the UI remains the same as before, except for delete buttons which now use confirmDelete */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => setActiveTab('messages')}
              className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                activeTab === 'messages' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Messages
            </button>
            <button 
              onClick={() => setActiveTab('updates')}
              className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                activeTab === 'updates' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Bell className="w-5 h-5 mr-2" />
              Updates
            </button>
            <button 
              onClick={() => setActiveTab('events')}
              className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                activeTab === 'events' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Events
            </button>
          </div>
        </div>

        {statusMessage.message && (
          <div className={`mb-6 p-4 rounded-lg shadow-sm ${
            statusMessage.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
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

        {isLoading && activeTab === 'messages' && messages.length === 0 && (
          <div className="text-center py-12 text-gray-500">Loading messages...</div>
        )}

        {isLoading && activeTab === 'updates' && updates.length === 0 && (
          <div className="text-center py-12 text-gray-500">Loading updates...</div>
        )}

        {isLoading && activeTab === 'events' && events.length === 0 && (
          <div className="text-center py-12 text-gray-500">Loading events...</div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">Support Messages</h2>
              <p className="text-sm text-gray-500 mt-1">Manage customer inquiries and feedback</p>
            </div>
            
            <div className="divide-y divide-gray-100">
              {messages.length === 0 && !isLoading ? (
                <div className="p-8 text-center text-gray-500">
                  No messages found
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`p-6 hover:bg-gray-50 transition-colors ${
                    msg.status === 'unread' ? 'bg-blue-50' : ''
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">{msg.subject}</h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                            {formatDate(msg.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">{msg.name}</span> &lt;{msg.email}&gt;
                        </p>
                        <p className="text-sm text-gray-700 mt-3">{msg.message}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-4">
                      <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center">
                        <Send className="w-4 h-4 mr-1" /> Reply
                      </button>
                      <button 
                        onClick={() => handleMarkAsRead(msg.id, msg.status)}
                        className="text-sm font-medium text-gray-600 hover:text-gray-800"
                      >
                        Mark as {msg.status === 'unread' ? 'read' : 'unread'}
                      </button>
                      <button
                        onClick={() => confirmDelete(msg.id, 'message', msg.subject)}
                        className="text-sm font-medium text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'updates' && (
          <div className="space-y-8">
            {/* Create New Update Form */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingUpdateId ? 'Edit Update' : 'Create New Update'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {editingUpdateId ? 'Modify your update content' : 'Share news and announcements with your users'}
                </p>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleCreateUpdate}>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={editingUpdateId 
                          ? updates.find(u => u.id === editingUpdateId)?.title 
                          : newUpdate.title}
                        onChange={handleUpdateInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        placeholder="What's new?"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          id="date"
                          name="date"
                          value={editingUpdateId 
                            ? updates.find(u => u.id === editingUpdateId)?.date 
                            : newUpdate.date}
                          onChange={handleUpdateInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                      <textarea
                        id="content"
                        name="content"
                        rows="5"
                        value={editingUpdateId 
                          ? updates.find(u => u.id === editingUpdateId)?.content 
                          : newUpdate.content}
                        onChange={handleUpdateInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        placeholder="Write your update here..."
                        required
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-2">
                      {editingUpdateId ? (
                        <>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            disabled={isLoading}
                            className="px-4 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center"
                          >
                            {isLoading ? (
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : null}
                            {isLoading ? 'Saving...' : 'Save Changes'}
                          </button>
                        </>
                      ) : (
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
                          {isLoading ? 'Publishing...' : 'Publish Update'}
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
            
            {/* List of Existing Updates */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Published Updates</h2>
                  <p className="text-sm text-gray-500 mt-1">{updates.length} updates published</p>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {updates.length === 0 && !isLoading ? (
                  <div className="p-8 text-center text-gray-500">
                    No updates published yet. Create your first update!
                  </div>
                ) : (
                  updates.map((update) => (
                    <div key={update.id} className={`p-6 hover:bg-gray-50 transition-colors ${
                      editingUpdateId === update.id ? 'bg-blue-50' : ''
                    }`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">{update.title}</h3>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditUpdate(update.id)}
                                className="text-gray-400 hover:text-indigo-600 transition-colors"
                                title="Edit update"
                              >
                                <Edit2 className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => confirmDelete(update.id, 'update', update.title)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
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
        )}

        {activeTab === 'events' && (
          <div className="space-y-8">
            {/* Create New Event Form */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingEventId ? 'Edit Event' : 'Create New Event'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {editingEventId ? 'Modify your event details' : 'Organize and schedule upcoming events'}
                </p>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleCreateEvent}>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="event-title" className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                      <input
                        type="text"
                        id="event-title"
                        name="title"
                        value={editingEventId 
                          ? events.find(e => e.id === editingEventId)?.title 
                          : newEvent.title}
                        onChange={handleEventInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        placeholder="Event name"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="event-date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          id="event-date"
                          name="date"
                          value={editingEventId 
                            ? events.find(e => e.id === editingEventId)?.date 
                            : newEvent.date}
                          onChange={handleEventInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="event-time" className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                        <input
                          type="time"
                          id="event-time"
                          name="time"
                          value={editingEventId 
                            ? events.find(e => e.id === editingEventId)?.time 
                            : newEvent.time}
                          onChange={handleEventInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="event-location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        id="event-location"
                        name="location"
                        value={editingEventId 
                          ? events.find(e => e.id === editingEventId)?.location 
                          : newEvent.location}
                        onChange={handleEventInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        placeholder="Where is the event?"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="event-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        id="event-description"
                        name="description"
                        rows="5"
                        value={editingEventId 
                          ? events.find(e => e.id === editingEventId)?.description 
                          : newEvent.description}
                        onChange={handleEventInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        placeholder="Describe the event details..."
                        required
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-2">
                      {editingEventId ? (
                        <>
                          <button
                            type="button"
                            onClick={handleCancelEventEdit}
                            className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveEvent}
                            disabled={isLoading}
                            className="px-4 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center"
                          >
                            {isLoading ? (
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : null}
                            {isLoading ? 'Saving...' : 'Save Changes'}
                          </button>
                        </>
                      ) : (
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
                            <Plus className="w-4 h-4 mr-2" />
                          )}
                          {isLoading ? 'Creating...' : 'Create Event'}
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
            
            {/* List of Existing Events */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Upcoming Events</h2>
                  <p className="text-sm text-gray-500 mt-1">{events.length} events scheduled</p>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {events.length === 0 && !isLoading ? (
                  <div className="p-8 text-center text-gray-500">
                    No events scheduled yet. Create your first event!
                  </div>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className={`p-6 hover:bg-gray-50 transition-colors ${
                      editingEventId === event.id ? 'bg-blue-50' : ''
                    }`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditEvent(event.id)}
                                className="text-gray-400 hover:text-indigo-600 transition-colors"
                                title="Edit event"
                              >
                                <Edit2 className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => confirmDelete(event.id, 'event', event.title)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete event"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                              {formatDate(event.date)} • {formatTime(event.time)}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                              {event.location}
                            </div>
                          </div>
                          
                          <p className="mt-3 text-gray-700 whitespace-pre-line">{event.description}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}