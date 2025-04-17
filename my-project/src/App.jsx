import { useState } from 'react'
import './App.css'
import kenyanFlag from './assets/kenyanflag.png';
import { 
  Home, 
  Phone, 
  Info, 
  Bell, 
  Send, 
  Shield, 
  Upload,
  AlertTriangle
} from 'lucide-react';

export default function SGBVApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    description: '',
    gender: '',
    perpetratorDetails: '',
    contactPhone: '',
    contactEmail: '',
    location: '',
    anonymous: false,
  });

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen setActiveTab={setActiveTab} />;
      case 'report':
        return <ReportForm step={step} setStep={setStep} formData={formData} handleInputChange={handleInputChange} />;
      case 'emergency':
        return <EmergencyContacts />;
      case 'info':
        return <InformationScreen />;
      case 'updates':
        return <UpdatesScreen />;
      default:
        return <HomeScreen setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="relative flex flex-col h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="relative py-5 px-4 text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0E3692] to-transparent opacity-90"></div>
        <div className="relative z-10 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src={kenyanFlag} 
              alt="Kenyan Flag" 
              className="h-12 w-auto"
            />
            <h1 className="text-2xl font-bold">SafeSpace</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        {renderContent()}
      </main>

      {/* Footer Navigation - Always visible */}
      <footer className="bg-white border-t border-gray-200 shadow-inner">
        <div className="flex justify-around py-3">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center p-2 ${activeTab === 'home' ? 'text-[#0E3692]' : 'text-gray-600'}`}
          >
            <Home size={20} />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button 
            onClick={() => setActiveTab('report')}
            className={`flex flex-col items-center p-2 ${activeTab === 'report' ? 'text-[#0E3692]' : 'text-gray-600'}`}
          >
            <Send size={20} />
            <span className="text-xs mt-1">Report</span>
          </button>
          <button 
            onClick={() => setActiveTab('emergency')}
            className={`flex flex-col items-center p-2 ${activeTab === 'emergency' ? 'text-[#0E3692]' : 'text-gray-600'}`}
          >
            <AlertTriangle size={20} />
            <span className="text-xs mt-1">Emergency</span>
          </button>
          <button 
            onClick={() => setActiveTab('info')}
            className={`flex flex-col items-center p-2 ${activeTab === 'info' ? 'text-[#0E3692]' : 'text-gray-600'}`}
          >
            <Info size={20} />
            <span className="text-xs mt-1">About</span>
          </button>
          <button 
            onClick={() => setActiveTab('updates')}
            className={`flex flex-col items-center p-2 ${activeTab === 'updates' ? 'text-[#0E3692]' : 'text-gray-600'}`}
          >
            <Bell size={20} />
            <span className="text-xs mt-1">Updates</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

// Home Screen Component
function HomeScreen({ setActiveTab }) {
  return (
    <div className="space-y-6">
      <div className="bg-[#0E3692] rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Welcome to SafeSpace</h2>
        <p className="mb-4">A secure platform to report and address sexual and gender-based violence.</p>
        <button 
          onClick={() => setActiveTab('report')}
          className="bg-white text-[#0E3692] px-6 py-2 rounded-lg font-medium shadow-md hover:bg-gray-100 transition-colors"
        >
          Report an Incident
        </button>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-md">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <AlertTriangle size={20} className="mr-2 text-red-500" />
          Emergency Support
        </h3>
        <p className="text-gray-600 mb-3">Need immediate help? Access emergency contacts directly.</p>
        <button 
          onClick={() => setActiveTab('emergency')}
          className="text-red-500 border border-red-500 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center"
        >
          <Phone size={16} className="mr-2" />
          Access Emergency Contacts
        </button>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-md">
        <h3 className="text-lg font-semibold mb-3">Resources & Information</h3>
        <p className="text-gray-600 mb-3">Learn about gender equity, support services, and how to identify SGBV.</p>
        <button 
          onClick={() => setActiveTab('info')}
          className="text-[#0E3692] border border-[#0E3692] px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
        >
          Learn More
        </button>
      </div>

      <div className="bg-gray-100 rounded-xl p-5">
        <h3 className="text-lg font-semibold mb-2">Latest Updates</h3>
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <p className="text-sm font-medium">New reporting features available</p>
            <p className="text-xs text-gray-500">2 days ago</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <p className="text-sm font-medium">Awareness workshop scheduled</p>
            <p className="text-xs text-gray-500">1 week ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Report Form Component
function ReportForm({ step, setStep, formData, handleInputChange }) {
  const categories = [
    "Sexual Harassment",
    "Sexual Assault",
    "Domestic Violence",
    "Stalking",
    "Verbal Abuse",
    "Emotional Abuse",
    "Other"
  ];

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Incident Details</h3>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category of Incident*
                </label>
                <select 
                  className="w-full max-w-xs p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E3692] focus:border-[#0E3692] focus:outline-none"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat, index) => (
                    <option key={index} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description of Incident*
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E3692] focus:border-[#0E3692] focus:outline-none h-32"
                placeholder="Please describe what happened..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender of Affected Person
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={() => handleInputChange('gender', 'female')}
                    className="mr-2"
                  />
                  Female
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={() => handleInputChange('gender', 'male')}
                    className="mr-2"
                  />
                  Male
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    checked={formData.gender === 'other'}
                    onChange={() => handleInputChange('gender', 'other')}
                    className="mr-2"
                  />
                  Other
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location of Incident
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E3692] focus:border-[#0E3692] focus:outline-none"
                placeholder="Where did this happen?"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="bg-[#0E3692] text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-900 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Perpetrator Details (Optional)
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E3692] focus:border-[#0E3692] focus:outline-none h-24"
                placeholder="Any details about the perpetrator that might be helpful..."
                value={formData.perpetratorDetails}
                onChange={(e) => handleInputChange('perpetratorDetails', e.target.value)}
              ></textarea>
            </div>
            
            <div className="p-4 bg-gray-100 rounded-lg">
              <div className="flex items-start mb-4">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={formData.anonymous}
                  onChange={(e) => handleInputChange('anonymous', e.target.checked)}
                  className="mt-1 mr-2"
                />
                <label htmlFor="anonymous" className="text-sm">
                  Submit this report anonymously
                  <p className="text-xs text-gray-500 mt-1">
                    Your identity will be kept confidential. However, providing contact details helps us follow up if needed.
                  </p>
                </label>
              </div>
              
              {!formData.anonymous && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E3692] focus:border-[#0E3692] focus:outline-none"
                      placeholder="Your phone number"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email (Optional)
                    </label>
                    <input
                      type="email"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E3692] focus:border-[#0E3692] focus:outline-none"
                      placeholder="Your email address"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Evidence (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF up to 10MB</p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="bg-[#0E3692] text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-900 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center p-2 rounded-full bg-green-100 w-16 h-16 mx-auto mb-4">
                <Shield className="text-green-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-2">Report Submitted</h3>
              <p className="text-green-700 mb-4">
                Thank you for your report. It has been submitted securely.
              </p>
              {!formData.anonymous && (
                <p className="text-sm text-gray-600">
                  A representative will contact you soon via the contact information provided.
                </p>
              )}
              {formData.anonymous && (
                <p className="text-sm text-gray-600">
                  You've submitted this report anonymously. The appropriate team will review and take action.
                </p>
              )}
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium mb-2">Next Steps</h4>
              <ul className="text-sm space-y-2 list-disc pl-5">
                <li>Your report will be reviewed by trained professionals</li>
                <li>All information is kept strictly confidential</li>
                <li>Support resources are available through the "Resources" section</li>
              </ul>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Report Another Incident
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-md">
      {step < 3 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Report an Incident</h2>
          <div className="flex items-center mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#0E3692] text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-[#0E3692]' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#0E3692] text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-[#0E3692]' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-[#0E3692] text-white' : 'bg-gray-200'}`}>
              3
            </div>
          </div>
        </div>
      )}
      {renderStepContent()}
    </div>
  );
}

// Emergency Contacts Component
function EmergencyContacts() {
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

// Information Screen Component
function InformationScreen() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-5 shadow-md">
        <h2 className="text-xl font-bold mb-3">About SafeSpace</h2>
        <p className="text-gray-700 mb-4">
          SafeSpace is a secure platform developed by the Centre for Gender Equity & Empowerment to help university community members report cases of Sexual and Gender-Based Violence (SGBV) securely and anonymously.
        </p>
        <p className="text-gray-700">
          Our mission is to create a safe, equitable environment free from all forms of gender-based violence and discrimination. We provide support services, educational resources, and confidential reporting mechanisms.
        </p>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-md">
        <h3 className="text-lg font-semibold mb-3">What is SGBV?</h3>
        <p className="text-gray-700 mb-3">
          Sexual and Gender-Based Violence (SGBV) refers to any act that is perpetrated against a person's will and is based on gender norms and unequal power relationships.
        </p>
        
        <div className="space-y-3 mt-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-800">Forms of SGBV include:</h4>
            <ul className="list-disc pl-5 mt-2 text-gray-700 space-y-1 text-sm">
              <li>Sexual harassment and assault</li>
              <li>Physical violence</li>
              <li>Emotional and psychological abuse</li>
              <li>Verbal abuse</li>
              <li>Stalking and cyber harassment</li>
              <li>Economic abuse</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-md">
        <h3 className="text-lg font-semibold mb-3">Our Commitment</h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full mr-3 mt-1">
              <Shield size={16} className="text-[#0E3692]" />
            </div>
            <div>
              <h4 className="font-medium">Confidentiality</h4>
              <p className="text-sm text-gray-600">All reports are handled with strict confidentiality to protect the identity of those involved.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full mr-3 mt-1">
              <Shield size={16} className="text-[#0E3692]" />
            </div>
            <div>
              <h4 className="font-medium">Support</h4>
              <p className="text-sm text-gray-600">We provide comprehensive support services including counseling, medical assistance, and legal advice.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full mr-3 mt-1">
              <Shield size={16} className="text-[#0E3692]" />
            </div>
            <div>
              <h4 className="font-medium">Justice</h4>
              <p className="text-sm text-gray-600">We are committed to fair investigation and appropriate action against perpetrators.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full mr-3 mt-1">
              <Shield size={16} className="text-[#0E3692]" />
            </div>
            <div>
              <h4 className="font-medium">Education</h4>
              <p className="text-sm text-gray-600">We provide ongoing education to prevent SGBV and promote gender equity.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 rounded-xl p-5">
        <h3 className="text-lg font-semibold mb-3">Resources</h3>
        <div className="space-y-3">
          <a href="#" className="block bg-white p-3 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
            <h4 className="font-medium">SGBV Prevention Guide</h4>
            <p className="text-sm text-gray-600">Learn how to recognize warning signs and protect yourself</p>
          </a>
          <a href="#" className="block bg-white p-3 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
            <h4 className="font-medium">Support Services Directory</h4>
            <p className="text-sm text-gray-600">Comprehensive list of available support services</p>
          </a>
          <a href="#" className="block bg-white p-3 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
            <h4 className="font-medium">Legal Rights Information</h4>
            <p className="text-sm text-gray-600">Know your legal rights regarding SGBV cases</p>
          </a>
        </div>
      </div>
    </div>
  );
}

// Updates Screen Component
function UpdatesScreen() {
  const updates = [
    {
      title: "New reporting features available",
      date: "April 15, 2025",
      content: "We've added anonymous reporting options and improved the form interface for easier reporting."
    },
    {
      title: "Awareness workshop scheduled",
      date: "April 10, 2025",
      content: "Join us for an SGBV awareness workshop on April 25th at the Main Campus from 2-4pm."
    },
    {
      title: "Partnership with counseling services",
      date: "April 3, 2025",
      content: "We've partnered with professional counseling services to provide better support for SGBV survivors."
    },
    {
      title: "New resources added",
      date: "March 28, 2025",
      content: "Check out our updated resources section with new guides on supporting survivors and preventing SGBV."
    },
    {
      title: "Community dialogue forum",
      date: "March 20, 2025",
      content: "Join our monthly community dialogue on addressing the root causes of gender-based violence."
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-5 shadow-md">
        <h2 className="text-xl font-bold mb-4">Latest Updates</h2>
        <p className="text-gray-600 mb-4">
          Stay informed about recent developments, upcoming events, and new resources.
        </p>
        
        <div className="space-y-4">
          {updates.map((update, index) => (
            <div key={index} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
              <h3 className="font-medium text-lg">{update.title}</h3>
              <p className="text-xs text-gray-500 mb-2">{update.date}</p>
              <p className="text-gray-700">{update.content}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
        <h3 className="text-lg font-semibold mb-3">Subscribe to Updates</h3>
        <p className="text-gray-700 mb-4">
          Receive notifications about new resources, events, and important information.
        </p>
        <div className="flex">
          <input 
            type="email" 
            placeholder="Your email address"
            className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-[#0E3692] focus:border-[#0E3692] focus:outline-none" 
          />
          <button className="bg-[#0E3692] text-white px-4 py-2 rounded-r-lg font-medium hover:bg-blue-900 transition-colors">
            Subscribe
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-md">
        <h3 className="text-lg font-semibold mb-3">Upcoming Events</h3>
        <div className="space-y-3">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">SGBV Awareness Workshop</h4>
              <span className="text-xs bg-blue-100 text-[#0E3692] px-2 py-1 rounded-full">Apr 25</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Main Campus, 2:00 PM - 4:00 PM
            </p>
            <button className="text-sm text-[#0E3692] hover:text-blue-900 transition-colors">
              Add to calendar
            </button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">Self-Defense Training</h4>
              <span className="text-xs bg-blue-100 text-[#0E3692] px-2 py-1 rounded-full">May 5</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Sports Complex, 10:00 AM - 12:00 PM
            </p>
            <button className="text-sm text-[#0E3692] hover:text-blue-900 transition-colors">
              Add to calendar
            </button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">Community Dialogue Forum</h4>
              <span className="text-xs bg-blue-100 text-[#0E3692] px-2 py-1 rounded-full">May 15</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Virtual Meeting, 6:00 PM - 8:00 PM
            </p>
            <button className="text-sm text-[#0E3692] hover:text-blue-900 transition-colors">
              Add to calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}