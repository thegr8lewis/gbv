// Report.jsx
import { Shield, Upload } from 'lucide-react';

export default function ReportForm({ step, setStep, formData, handleInputChange }) {
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