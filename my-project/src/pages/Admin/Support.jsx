// pages/admin/support-messages.jsx
import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import AdminLayout from '/src/pages/Admin/AdminLayout';;

export default function SupportMessages() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      name: 'Jane Doe',
      email: 'jane@example.com',
      subject: 'Need help with reporting',
      message: 'I tried to submit a report but the form keeps giving me an error. Can you help?',
      date: '2023-05-15T10:30:00Z',
      status: 'unread'
    },
    {
      id: 2,
      name: 'John Smith',
      email: 'john@example.com',
      subject: 'Question about workshop',
      message: 'When is the next self-defense workshop scheduled?',
      date: '2023-05-14T15:45:00Z',
      status: 'read'
    },
    {
      id: 3,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      subject: 'Feedback on app',
      message: 'I love the new features in the latest update!',
      date: '2023-05-12T09:15:00Z',
      status: 'read'
    }
  ]);

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <AdminLayout activeNavItem="Support Messages">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">Support Messages</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No messages found
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`p-4 hover:bg-gray-50 ${msg.status === 'unread' ? 'bg-blue-50' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{msg.subject}</h3>
                      <p className="text-sm text-gray-500 mt-1">{msg.name} &lt;{msg.email}&gt;</p>
                      <p className="text-sm text-gray-700 mt-2">{msg.message}</p>
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap ml-4">
                      {formatDate(msg.date)}
                    </div>
                  </div>
                  <div className="mt-3 flex space-x-3">
                    <button className="text-sm text-blue-600 hover:underline">
                      Reply
                    </button>
                    <button className="text-sm text-gray-600 hover:underline">
                      Mark as {msg.status === 'unread' ? 'read' : 'unread'}
                    </button>
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