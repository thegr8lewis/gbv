// About.jsx
import { Shield } from 'lucide-react';

export default function InformationScreen() {
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