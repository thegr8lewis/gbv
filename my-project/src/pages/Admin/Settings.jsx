// pages/admin/settings.jsx
import { useState } from 'react';
import { Settings } from 'lucide-react';
import AdminLayout from '/src/pages/Admin/AdminLayout';

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    notificationEmail: 'admin@kucgee.com',
    reportNotifications: true,
    messageNotifications: true,
    eventReminders: true,
    darkMode: false,
    timezone: 'Africa/Nairobi'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save settings logic here
    alert('Settings saved successfully!');
  };

  return (
    <AdminLayout activeNavItem="Settings">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">Settings</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">Notification Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="reportNotifications"
                      name="reportNotifications"
                      type="checkbox"
                      checked={formData.reportNotifications}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="reportNotifications" className="ml-3 block text-sm text-gray-700">
                      New Report Notifications
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="messageNotifications"
                      name="messageNotifications"
                      type="checkbox"
                      checked={formData.messageNotifications}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="messageNotifications" className="ml-3 block text-sm text-gray-700">
                      Support Message Notifications
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="eventReminders"
                      name="eventReminders"
                      type="checkbox"
                      checked={formData.eventReminders}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="eventReminders" className="ml-3 block text-sm text-gray-700">
                      Event Reminders
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">General Settings</h3>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label htmlFor="notificationEmail" className="block text-sm font-medium text-gray-700">
                      Notification Email
                    </label>
                    <input
                      type="email"
                      name="notificationEmail"
                      id="notificationEmail"
                      value={formData.notificationEmail}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="sm:col-span-4">
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                      Timezone
                    </label>
                    <select
                      id="timezone"
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="Africa/Nairobi">East Africa Time (Nairobi)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time (New York)</option>
                      <option value="Europe/London">London</option>
                    </select>
                  </div>
                  
                  <div className="sm:col-span-4">
                    <div className="flex items-center">
                      <input
                        id="darkMode"
                        name="darkMode"
                        type="checkbox"
                        checked={formData.darkMode}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="darkMode" className="ml-3 block text-sm text-gray-700">
                        Dark Mode
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}