import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Send, 
  X, 
  Trash2, 
  Mail, 
  MailOpen, 
  Clock, 
  Search, 
  PlusCircle 
} from 'lucide-react';
import AdminLayout from '/src/pages/Admin/AdminLayout.jsx';

export default function Support() {
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
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState({ id: null, type: null, title: null });
  const [replyTo, setReplyTo] = useState({ id: null, name: '', email: '', subject: '' });
  const [replyMessage, setReplyMessage] = useState('');

  // Get auth token with validation
  const getAuthToken = () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/login');
      return null;
    }
    return token;
  };

  // Fetch data function
  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch('http://localhost:8000/api/contact-messages/', {
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

  useEffect(() => {
    if (authChecked) {
      fetchMessages();
    }
  }, [authChecked]);

  // Helper function
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
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
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`http://localhost:8000/api/contact-messages/${itemToDelete.id}/`, {
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
        setMessages(messages.filter(msg => msg.id !== itemToDelete.id));
        setStatusMessage({ type: 'success', message: 'Message deleted successfully!' });
      } else {
        throw new Error('Failed to delete message');
      }
    } catch (error) {
      setStatusMessage({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
      setItemToDelete({ id: null, type: null, title: null });
    }
  };

  // Reply handlers with auth checks
  const openReplyModal = (message) => {
    setReplyTo({
      id: message.id,
      name: message.name,
      email: message.email,
      subject: message.subject
    });
    setReplyMessage(`\n\n---\nOriginal message from ${message.name}:\n${message.message}`);
    setShowReplyModal(true);
    
    // If message is unread, mark it as read
    if (message.status === 'unread') {
      handleMarkAsRead(message.id, 'unread');
    }
  };

  const cancelReply = () => {
    setShowReplyModal(false);
    setReplyTo({ id: null, name: '', email: '', subject: '' });
    setReplyMessage('');
  };

  const sendReply = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`http://localhost:8000/api/send-email/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ 
          message_id: replyTo.id,
          to_email: replyTo.email,
          subject: `Re: ${replyTo.subject}`,
          message: replyMessage
        })
      });

      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('is_staff');
        navigate('/login');
        return;
      }
      
      if (response.ok) {
        setMessages(messages.map(msg => 
          msg.id === replyTo.id ? { ...msg, status: 'replied' } : msg
        ));
        setStatusMessage({ type: 'success', message: `Reply sent to ${replyTo.name} successfully!` });
        cancelReply();
      } else {
        throw new Error('Failed to send reply');
      }
    } catch (error) {
      setStatusMessage({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Message handlers with auth checks
  const handleMarkAsRead = async (messageId, currentStatus) => {
    const newStatus = currentStatus === 'unread' ? 'read' : 'unread';
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`http://localhost:8000/api/support-messages/${messageId}/`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('is_staff');
        navigate('/login');
        return;
      }
      
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

  // Filter and search (unchanged)
  const filteredMessages = messages.filter(message => {
    if (!message) return false;
    
    const subject = message.subject?.toLowerCase() || '';
    const name = message.name?.toLowerCase() || '';
    const email = message.email?.toLowerCase() || '';
    const messageText = message.message?.toLowerCase() || '';
    const searchLower = searchQuery.toLowerCase();
    
    const matchesSearch = searchQuery === '' || 
      subject.includes(searchLower) || 
      name.includes(searchLower) || 
      email.includes(searchLower) || 
      messageText.includes(searchLower);
    
    if (filterStatus === 'all') return matchesSearch;
    return message.status === filterStatus && matchesSearch;
  });

  // Only render the component if authentication is confirmed
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Loading support messages...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout activeNavItem="Support">
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
                  Are you sure you want to delete this message?
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

        {/* Reply Modal */}
        {showReplyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 transform transition-all">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Reply to {replyTo.name}</h3>
                <button 
                  onClick={cancelReply}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={sendReply}>
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">To: {replyTo.name} &lt;{replyTo.email}&gt;</p>
                    <p className="text-sm text-gray-600 mt-1">Subject: Re: {replyTo.subject}</p>
                  </div>
                  
                  <div>
                    <label htmlFor="reply-message" className="block text-sm font-medium text-gray-700 mb-1">Your Reply</label>
                    <textarea
                      id="reply-message"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      rows={8}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="Write your reply here..."
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={cancelReply}
                      className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !replyMessage.trim()}
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
                      {isLoading ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <MessageSquare className="w-6 h-6 text-indigo-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Support Messages</h1>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </select>
          </div>
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

        {isLoading && messages.length === 0 && (
          <div className="flex justify-center items-center py-20">
            <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
          
        {/* List of Messages */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Customer Messages</h2>
                <p className="text-sm text-gray-500 mt-1">{messages.length} total messages</p>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {filteredMessages.length === 0 && !isLoading ? (
              <div className="p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery ? 'No messages match your search' : 'Customer messages will appear here'}
                </p>
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <div key={msg.id} className={`p-6 hover:bg-gray-50 transition-colors ${
                  msg.status === 'unread' ? 'bg-blue-50' : ''
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-lg font-semibold ${
                          msg.status === 'unread' ? 'text-indigo-800' : 'text-gray-800'
                        }`}>
                          {msg.subject}
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openReplyModal(msg)}
                            className="p-1 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Reply"
                          >
                            <Send className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => confirmDelete(msg.id, 'message', msg.subject)}
                            className="p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 flex items-center">
                        <span className="font-medium text-gray-700">{msg.name}</span>
                        <span className="mx-2">•</span>
                        <span>{msg.email}</span>
                        <span className="mx-2">•</span>
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(msg.created_at)}
                      </p>
                      <p className="text-gray-700 mt-3 whitespace-pre-line">{msg.message}</p>
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