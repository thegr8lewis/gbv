// Emergency.jsx
import { AlertTriangle, Phone, Mail, ExternalLink, Shield } from 'lucide-react';

export default function EmergencyContacts() {
  const contacts = [
    // { name: "Security Office", number: "0725 471487", urgent: true },
    // { name: "Director of Students' Affairs", number: "020 8704470", urgent: false },
    { name: "Private Advisor for Sexual Assault", number: "0798 416091", urgent: true },
    { name: "Health Unit (24/7)", number: "0712 345678", urgent: true },
    { name: "Fire Emergency", number: "999", urgent: true },
    // { name: "Accommodation Office", number: "0723 456789", urgent: false },
    { name: "National GBV Hotline", number: "1195", urgent: true },
    { name: "Police Emergency", number: "999 / 112", urgent: true }
  ];

  return (
    <div className="max-w-4xl mx-auto px-1 py-8 space-y-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        
        <p className="text-gray-600 max-w-2xl mx-auto">
          Access immediate help and support services. Your safety is our priority.
        </p>
      </div>

      {/* Emergency Alert Banner */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 bg-red-100 rounded-full transform translate-x-16 -translate-y-16 opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle size={28} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-700 ml-3">
              Emergency Contacts
            </h2>
          </div>
          <p className="text-gray-700 mb-6 text-lg">
            If you're in immediate danger, please contact one of these emergency numbers immediately:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contacts.filter(c => c.urgent).map((contact, index) => (
              <div 
                key={index} 
                className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 mb-1">{contact.name}</p>
                    <p className="text-gray-500 text-sm">Direct call</p>
                  </div>
                  <a 
                    href={`tel:${contact.number}`} 
                    className="flex items-center justify-center bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors min-w-32"
                  >
                    <Phone size={16} className="mr-2" />
                    {contact.number}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Other Support Contacts */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex items-center mb-5">
          <div className="bg-blue-50 p-3 rounded-full">
            <Shield size={22} className="text-blue-700" />
          </div>
          <h3 className="text-xl font-semibold ml-3">Other Support Contacts</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.filter(c => !c.urgent).map((contact, index) => (
            <div 
              key={index} 
              className="flex justify-between items-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-300"
            >
              <div>
                <p className="font-medium text-gray-800">{contact.name}</p>
              </div>
              <a 
                href={`tel:${contact.number}`} 
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:border-blue-300 hover:text-blue-700 transition-all duration-300 flex items-center"
              >
                <Phone size={16} className="mr-2" />
                {contact.number}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Email Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Mail size={22} className="text-blue-700" />
            </div>
            <h3 className="text-xl font-semibold text-blue-800 ml-3">Email Support</h3>
          </div>
          <p className="text-gray-700 mb-4">
            For non-emergency inquiries or follow-ups, you can reach us at:
          </p>
          <a 
            href="mailto:director-gender@kenya.ac.ke"
            className="block bg-white text-blue-700 px-4 py-3 rounded-lg text-center shadow-sm hover:bg-blue-50 hover:shadow transition-all duration-300 font-medium"
          >
            director-gender@kenya.ac.ke
          </a>
        </div>

        {/* Additional Resources Block */}
        <div className="bg-green-50 rounded-xl p-6 border border-green-200 shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <ExternalLink size={22} className="text-green-700" />
            </div>
            <h3 className="text-xl font-semibold text-green-800 ml-3">Additional Resources</h3>
          </div>
          <p className="text-gray-700 mb-4">
            Find more support information and resources on our dedicated help pages.
          </p>
          <a 
            href="#/resources"
            className="block bg-white text-green-700 px-4 py-3 rounded-lg text-center shadow-sm hover:bg-green-50 hover:shadow transition-all duration-300 font-medium"
          >
            Browse Resources
          </a>
        </div>
      </div>

      {/* Quick Guidance */}
      <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200 shadow-md">
        <h3 className="text-xl font-semibold text-yellow-800 mb-3">Quick Guidance</h3>
        <ul className="space-y-2">
          <li className="flex items-start">
            <div className="bg-yellow-100 p-1 rounded-full mr-3 mt-1">
              <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
            </div>
            <p className="text-gray-700">If you're in immediate danger, call emergency services first before anything else.</p>
          </li>
          <li className="flex items-start">
            <div className="bg-yellow-100 p-1 rounded-full mr-3 mt-1">
              <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
            </div>
            <p className="text-gray-700">When possible, try to move to a safe location before making your call.</p>
          </li>
          <li className="flex items-start">
            <div className="bg-yellow-100 p-1 rounded-full mr-3 mt-1">
              <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
            </div>
            <p className="text-gray-700">All calls to support services are confidential and handled with care.</p>
          </li>
        </ul>
      </div>
    </div>
  );
}