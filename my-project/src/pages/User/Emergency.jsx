// Emergency.jsx
import { AlertTriangle, Phone } from 'lucide-react';

export default function EmergencyContacts() {
  const contacts = [
    { name: "Security Office", number: "0725 471487", urgent: true },
    { name: "Director of Students' Affairs", number: "020 8704470", urgent: false },
    { name: "Private Advisor for Sexual Assault", number: "0798 416091", urgent: true },
    { name: "Health Unit (24/7)", number: "0712 345678", urgent: true },
    { name: "Fire Emergency", number: "999", urgent: true },
    { name: "Accommodation Office", number: "0723 456789", urgent: false },
    { name: "National GBV Hotline", number: "1195", urgent: true },
    { name: "Police Emergency", number: "999 / 112", urgent: true }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-md">
        <h2 className="text-xl font-bold text-red-700 mb-3 flex items-center">
          <AlertTriangle size={24} className="mr-2" />
          Emergency Contacts
        </h2>
        <p className="text-gray-700 mb-4">
          If you're in immediate danger, please contact one of these emergency numbers:
        </p>
        
        <div className="space-y-3">
          {contacts.filter(c => c.urgent).map((contact, index) => (
            <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border-l-4 border-red-500">
              <div>
                <p className="font-medium">{contact.name}</p>
              </div>
              <a 
                href={`tel:${contact.number}`} 
                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center"
              >
                <Phone size={16} className="mr-2" />
                {contact.number}
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-md">
        <h3 className="text-lg font-semibold mb-3">Other Support Contacts</h3>
        <div className="space-y-3">
          {contacts.filter(c => !c.urgent).map((contact, index) => (
            <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <div>
                <p className="font-medium">{contact.name}</p>
              </div>
              <a 
                href={`tel:${contact.number}`} 
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center"
              >
                <Phone size={16} className="mr-2" />
                {contact.number}
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Email Support</h3>
        <p className="text-gray-700 mb-3">
          For non-emergency inquiries or follow-ups, you can email:
        </p>
        <a 
          href="mailto:director-gender@ku.ac.ke"
          className="block bg-white text-blue-700 px-4 py-3 rounded-lg text-center shadow-sm hover:bg-blue-50 transition-colors"
        >
          director-gender@ku.ac.ke
        </a>
      </div>
    </div>
  );
}