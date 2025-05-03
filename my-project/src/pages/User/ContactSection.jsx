import { useState } from 'react';
import { MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    email: '',
    message: ''
  });
  
  const [status, setStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/contact/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus({
          submitted: true,
          success: true,
          message: 'Your message has been sent successfully!'
        });
        // Reset form
        setFormData({
          title: '',
          name: '',
          email: '',
          message: ''
        });
      } else {
        setStatus({
          submitted: true,
          success: false,
          message: data.message || 'Something went wrong. Please try again.'
        });
      }
    } catch (error) {
      setStatus({
        submitted: true,
        success: false,
        message: 'Network error. Please check your connection and try again.'
      });
    }
    
    setLoading(false);
  };
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-md mb-8 border border-gray-100">
      <div className="flex items-center mb-5">
        <div className="bg-teal-50 p-3 rounded-full">
          <MessageSquare size={22} className="text-teal-700" />
        </div>
        <h3 className="text-xl font-semibold ml-3">Contact Us</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p className="text-gray-700 mb-4">
            Have questions, concerns, or need to report an incident? Send us a message and our team will respond to you as soon as possible.
          </p>
          <div className="bg-teal-50 p-5 rounded-xl">
            <h4 className="font-medium text-teal-800 mb-2">We're here to help</h4>
            <p className="text-gray-700 text-sm">
              All communications are treated with the utmost confidentiality. Your safety and well-being are our priority.
            </p>
          </div>
        </div>
        
        <div>
          {status.submitted && (
            <div className={`mb-6 p-4 rounded-lg flex items-start ${status.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <div className="mt-0.5 mr-3">
                {status.success ? 
                  <CheckCircle size={18} className="text-green-600" /> : 
                  <AlertCircle size={18} className="text-red-600" />
                }
              </div>
              <p>{status.message}</p>
            </div>
          )}
          
          <div onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Message subject"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Your name"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="your.email@example.com"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Your message here..."
                required
              ></textarea>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md flex items-center justify-center ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-teal-600 hover:bg-teal-700 focus:ring-2 focus:ring-offset-2 focus:ring-teal-500'
              } text-white font-medium transition-colors`}
            >
              {loading ? (
                <>Processing<span className="ml-2 animate-pulse">...</span></>
              ) : (
                <>
                  Send Message
                  <Send size={16} className="ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}