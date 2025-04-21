// About.jsx
import { Shield, Info, BookOpen, Scale, Heart, FileText, Award, ExternalLink } from 'lucide-react';

export default function InformationScreen() {
  return (
    <div className="max-w-4xl mx-auto px-1 py-8">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <p className="text-gray-600 max-w-2xl mx-auto">
          Empowering our community to create a safer environment for everyone
        </p>
      </div>

      {/* Mission Section */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl p-8 text-white shadow-lg mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-500 opacity-10 rounded-full scale-150 translate-x-1/2 -translate-y-1/4"></div>
        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Shield size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold ml-3">Our Mission</h2>
          </div>
          <p className="text-lg mb-4 opacity-90">
            SafeSpace is a secure platform developed by the Centre for Gender Equity & Empowerment to help university community members report cases of Sexual and Gender-Based Violence (SGBV) securely and anonymously.
          </p>
          <p className="text-lg opacity-90">
            We are committed to creating a safe, equitable environment free from all forms of gender-based violence and discrimination through support services, educational resources, and confidential reporting mechanisms.
          </p>
        </div>
      </div>

      {/* What is SGBV Section */}
      <div className="bg-white rounded-xl p-6 shadow-md mb-8 border border-gray-100">
        <div className="flex items-center mb-5">
          <div className="bg-blue-50 p-3 rounded-full">
            <Info size={22} className="text-blue-700" />
          </div>
          <h3 className="text-xl font-semibold ml-3">What is SGBV?</h3>
        </div>
        
        <p className="text-gray-700 mb-6">
          Sexual and Gender-Based Violence (SGBV) refers to any act that is perpetrated against a person's will and is based on gender norms and unequal power relationships. These acts can cause physical, sexual, psychological, or economic harm.
        </p>
        
        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
          <h4 className="font-medium text-blue-800 mb-3 text-lg">Forms of SGBV include:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="h-2 w-2 bg-red-500 rounded-full mr-2"></div>
                <h5 className="font-medium">Sexual harassment and assault</h5>
              </div>
              <p className="text-sm text-gray-600 mt-1 pl-4">Unwanted sexual advances or contact</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="h-2 w-2 bg-red-500 rounded-full mr-2"></div>
                <h5 className="font-medium">Physical violence</h5>
              </div>
              <p className="text-sm text-gray-600 mt-1 pl-4">Hitting, slapping, punching, or other physical harm</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="h-2 w-2 bg-red-500 rounded-full mr-2"></div>
                <h5 className="font-medium">Emotional and psychological abuse</h5>
              </div>
              <p className="text-sm text-gray-600 mt-1 pl-4">Threats, intimidation, and controlling behavior</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="h-2 w-2 bg-red-500 rounded-full mr-2"></div>
                <h5 className="font-medium">Verbal abuse</h5>
              </div>
              <p className="text-sm text-gray-600 mt-1 pl-4">Humiliation, insults, and degrading language</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="h-2 w-2 bg-red-500 rounded-full mr-2"></div>
                <h5 className="font-medium">Stalking and cyber harassment</h5>
              </div>
              <p className="text-sm text-gray-600 mt-1 pl-4">Unwanted attention, monitoring, online harassment</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="h-2 w-2 bg-red-500 rounded-full mr-2"></div>
                <h5 className="font-medium">Economic abuse</h5>
              </div>
              <p className="text-sm text-gray-600 mt-1 pl-4">Controlling access to finances and resources</p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Commitment Section */}
      <div className="bg-white rounded-xl p-6 shadow-md mb-8 border border-gray-100">
        <div className="flex items-center mb-5">
          <div className="bg-purple-50 p-3 rounded-full">
            <Award size={22} className="text-purple-700" />
          </div>
          <h3 className="text-xl font-semibold ml-3">Our Commitment</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <div className="bg-blue-200 p-2 rounded-full">
                <Shield size={18} className="text-blue-700" />
              </div>
              <h4 className="font-medium ml-3 text-blue-800">Confidentiality</h4>
            </div>
            <p className="text-gray-700">All reports are handled with strict confidentiality to protect the identity of those involved. Your privacy is our utmost concern.</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <div className="bg-green-200 p-2 rounded-full">
                <Heart size={18} className="text-green-700" />
              </div>
              <h4 className="font-medium ml-3 text-green-800">Support</h4>
            </div>
            <p className="text-gray-700">We provide comprehensive support services including counseling, medical assistance, and legal advice for all affected individuals.</p>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <div className="bg-amber-200 p-2 rounded-full">
                <Scale size={18} className="text-amber-700" />
              </div>
              <h4 className="font-medium ml-3 text-amber-800">Justice</h4>
            </div>
            <p className="text-gray-700">We are committed to fair investigation and appropriate action against perpetrators to ensure justice is served.</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <div className="bg-purple-200 p-2 rounded-full">
                <BookOpen size={18} className="text-purple-700" />
              </div>
              <h4 className="font-medium ml-3 text-purple-800">Education</h4>
            </div>
            <p className="text-gray-700">We provide ongoing education to prevent SGBV and promote gender equity through workshops, seminars and awareness campaigns.</p>
          </div>
        </div>
      </div>

      {/* Resources Section */}
      <div className="bg-gray-50 rounded-xl p-6 shadow-md border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center">
            <div className="bg-indigo-50 p-3 rounded-full">
              <FileText size={22} className="text-indigo-700" />
            </div>
            <h3 className="text-xl font-semibold ml-3">Resources</h3>
          </div>
          <a href="#/resources" className="text-blue-700 text-sm font-medium hover:underline flex items-center">
            View all resources
            <ExternalLink size={14} className="ml-1" />
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="#" className="group block bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border-l-4 border-blue-500">
            <h4 className="font-medium text-gray-800 group-hover:text-blue-700 transition-colors">SGBV Prevention Guide</h4>
            <p className="text-sm text-gray-600 mt-2">Learn how to recognize warning signs and protect yourself</p>
            <div className="mt-4 flex justify-end">
              <div className="bg-blue-50 p-2 rounded-full group-hover:bg-blue-100 transition-colors">
                <ExternalLink size={16} className="text-blue-700" />
              </div>
            </div>
          </a>
          
          <a href="#" className="group block bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border-l-4 border-green-500">
            <h4 className="font-medium text-gray-800 group-hover:text-green-700 transition-colors">Support Services Directory</h4>
            <p className="text-sm text-gray-600 mt-2">Comprehensive list of available support services on and off campus</p>
            <div className="mt-4 flex justify-end">
              <div className="bg-green-50 p-2 rounded-full group-hover:bg-green-100 transition-colors">
                <ExternalLink size={16} className="text-green-700" />
              </div>
            </div>
          </a>
          
          <a href="#" className="group block bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border-l-4 border-purple-500">
            <h4 className="font-medium text-gray-800 group-hover:text-purple-700 transition-colors">Legal Rights Information</h4>
            <p className="text-sm text-gray-600 mt-2">Know your legal rights regarding SGBV cases and reporting processes</p>
            <div className="mt-4 flex justify-end">
              <div className="bg-purple-50 p-2 rounded-full group-hover:bg-purple-100 transition-colors">
                <ExternalLink size={16} className="text-purple-700" />
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}