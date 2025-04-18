// Updates.jsx
export default function UpdatesScreen() {
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