import { Shield, Upload } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function ReportForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const initialFormData = {
    category: '',
    description: '',
    gender: '',
    location: '',
    perpetratorDetails: '',
    anonymous: false,
    contactPhone: '',
    contactEmail: '',
    evidence: null
  };
  
  const [formData, setFormData] = useState(initialFormData);
  
  const categories = [
    "Sexual Harassment",
    "Sexual Assault",
    "Domestic Violence",
    "Stalking",
    "Verbal Abuse",
    "Emotional Abuse",
    "Other"
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setSubmitError('File size must be less than 10MB');
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setSubmitError('Only JPG, PNG, or PDF files are allowed');
        return;
      }
      
      handleInputChange('evidence', file);
      setSubmitError(null);
    }
  };

  const handleSubmitReport = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const formDataToSend = new FormData();
      
      // Append all form data to FormData object
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          // Map frontend keys to backend keys
          let backendKey = key;
          if (key === 'perpetratorDetails') backendKey = 'perpetrator_details';
          if (key === 'anonymous') backendKey = 'is_anonymous';
          if (key === 'contactPhone') backendKey = 'contact_phone';
          if (key === 'contactEmail') backendKey = 'contact_email';
          
          formDataToSend.append(backendKey, value);
        }
      });
      
      const response = await fetch('http://localhost:8000/api/reports/', {
        method: 'POST',
        body: formDataToSend,
        // Don't set Content-Type header - let the browser set it with boundary
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit report');
      }

      setStep(3); // Move to success step
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError(error.message || 'An error occurred while submitting the report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    // Step 1 just goes to Step 2
    if (step === 1) {
      setStep(2);
      return;
    }
  
    // Step 2: validate before submitting
    if (step === 2) {
      // Simple validation
      if (!formData.category || !formData.description || (!formData.anonymous && (!formData.contactPhone && !formData.contactEmail))) {
        setSubmitError('Please fill in all required fields or choose to remain anonymous.');
        MySwal.fire({
          title: 'Submission Failed',
          text: 'Please fill in all required details before submitting.',
          icon: 'error',
          confirmButtonText: 'Try Again'
        });
        return;
      }
      
      handleSubmitReport();
    }
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-7">
            <h3 className="text-xl font-semibold text-gray-800">Incident Details</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category of Incident*
              </label>
              <select 
                className="w-full max-w-md p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-gray-50 transition-all duration-200 shadow-sm hover:bg-white"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description of Incident*
              </label>
              <textarea
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-gray-50 transition-all duration-200 shadow-sm h-36 hover:bg-white"
                placeholder="Please describe what happened..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender of Affected Person
              </label>
              <div className="flex flex-wrap gap-4">
                {['female', 'male', 'other'].map((gender) => (
                  <label key={gender} className="relative flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value={gender}
                      checked={formData.gender === gender}
                      onChange={() => handleInputChange('gender', gender)}
                      className="absolute opacity-0 w-0 h-0"
                    />
                    <span className={`px-4 py-2 rounded-full cursor-pointer transition-all duration-200 border ${
                      formData.gender === gender 
                        ? 'bg-blue-100 border-blue-500 text-blue-800 font-medium' 
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}>
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location of Incident
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-gray-50 transition-all duration-200 shadow-sm hover:bg-white"
                placeholder="Where did this happen?"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
              >
                <span>Continue</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Additional Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Perpetrator Details (Optional)
              </label>
              <textarea
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-gray-50 transition-all duration-200 shadow-sm h-28 hover:bg-white"
                placeholder="Any details about the perpetrator that might be helpful..."
                value={formData.perpetratorDetails}
                onChange={(e) => handleInputChange('perpetratorDetails', e.target.value)}
              ></textarea>
            </div>
            
            <div className="p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm">
              <div className="flex items-start mb-4">
                <div className="flex items-center h-6">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={formData.anonymous}
                    onChange={(e) => handleInputChange('anonymous', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="anonymous" className="font-medium">
                    Submit this report anonymously
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    Your identity will be kept confidential. However, providing contact details helps us follow up if needed.
                  </p>
                </div>
              </div>
              
              {!formData.anonymous && (
                <div className="space-y-4 mt-4 pl-7">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white transition-all duration-200 shadow-sm"
                      placeholder="Your phone number"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email (Optional)
                    </label>
                    <input
                      type="email"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white transition-all duration-200 shadow-sm"
                      placeholder="Your email address"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="border border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 relative cursor-pointer group">
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
                  <Upload className="text-blue-500" size={28} />
                </div>
                <p className="font-medium text-gray-700">Upload Evidence</p>
                <p className="text-sm text-gray-500 mt-1">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF up to 10MB</p>
              </div>
              {formData.evidence && (
                <div className="mt-4 py-2 px-4 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                  <p className="text-sm text-blue-700 font-medium truncate">
                    {formData.evidence.name}
                  </p>
                  <span className="text-xs bg-blue-600 text-white py-1 px-2 rounded-full">Selected</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200 shadow-sm flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                <span>Back</span>
              </button>
              <button
                onClick={handleContinue}
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8 text-center shadow-sm">
              <div className="flex items-center justify-center p-4 rounded-full bg-green-100 w-20 h-20 mx-auto mb-4 shadow-inner border border-green-200">
                <Shield className="text-green-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-green-800 mb-3">Report Submitted</h3>
              <p className="text-green-700 mb-4 text-lg">
                Thank you for your report. It has been submitted securely.
              </p>
              <div className="bg-white bg-opacity-70 rounded-lg p-4 max-w-md mx-auto">
                {!formData.anonymous ? (
                  <p className="text-gray-700">
                    A representative will contact you soon via the contact information provided.
                  </p>
                ) : (
                  <p className="text-gray-700">
                    You've submitted this report anonymously. The appropriate team will review and take action.
                  </p>
                )}
              </div>
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-5 shadow-sm">
              <h4 className="font-semibold text-blue-800 mb-3 text-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Next Steps
              </h4>
              <ul className="text-blue-900 space-y-2 pl-5">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Your report will be reviewed by trained professionals
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  All information is kept strictly confidential
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Support resources are available through the "Resources" section
                </li>
              </ul>
            </div>
            
            <div className="flex justify-center pt-4">
              <button
                onClick={() => {
                  setFormData(initialFormData);
                  setStep(1);
                  setSubmitError(null);
                }}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v2h2a1 1 0 110 2h-2v2a1 1 0 11-2 0v-2H7a1 1 0 110-2h2V7z" clipRule="evenodd" />
                </svg>
                <span>Report Another Incident</span>
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl">
      {step < 3 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
            </svg>
            Report an Incident
          </h2>
          <div className="relative">
            <div className="flex items-center justify-between mb-4 relative z-10">
              {[1, 2].map((stepNumber) => (
                <div key={stepNumber} className="flex flex-col items-center">
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                      step >= stepNumber 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {stepNumber}
                  </div>
                  <span className={`text-sm font-medium ${step >= stepNumber ? 'text-blue-600' : 'text-gray-500'}`}>
                    {stepNumber === 1 ? 'Incident Details' : 'Additional Info'}
                  </span>
                </div>
              ))}
            </div>
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-10">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: step === 1 ? '0%' : '100%' }}
              ></div>
            </div>
          </div>
        </div>
      )}
      
      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {submitError}
        </div>
      )}
      
      {renderStepContent()}
    </div>
  );
}