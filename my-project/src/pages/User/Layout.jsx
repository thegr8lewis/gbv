// import { Link } from 'react-router-dom';
// import { Home, Send, AlertTriangle, Info, Bell } from 'lucide-react';
// import kenyanFlag from "/src/assets/kenyanflag.png";
// import { useState, useEffect, useRef } from 'react';

// export default function Layout({ children, activeTab }) {
//   const [headerVisible, setHeaderVisible] = useState(true);
//   const lastScrollY = useRef(0);

//   useEffect(() => {
//     const handleScroll = () => {
//       const currentScrollY = window.scrollY;
      
//       if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
//         setHeaderVisible(false);
//       } else if (currentScrollY < lastScrollY.current) {
//         setHeaderVisible(true);
//       }
      
//       lastScrollY.current = currentScrollY;
//     };

//     window.addEventListener('scroll', handleScroll, { passive: true });
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
//       {/* Header - Animated based on scroll */}
//       <header className={`fixed top-0 left-0 right-0 py-5 px-4 text-white transition-transform duration-300 z-20 ${
//         headerVisible ? 'translate-y-0' : '-translate-y-full'
//       }`}>
//         <div className="absolute inset-0 bg-gradient-to-b from-[#0E3692] to-transparent opacity-90"></div>
//         <div className="relative z-10 flex justify-between items-center">
//           <div className="flex items-center space-x-3">
//             <img 
//               src={kenyanFlag} 
//               alt="Kenyan Flag" 
//               className="h-12 w-auto"
//             />
//             <h1 className="text-2xl font-bold">SafeSpace</h1>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="flex-1 overflow-y-auto pt-16 pb-16 px-4">
//         {children}
//       </main>

//       {/* Fixed Footer Navigation */}
//       <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-inner z-10">
//         <div className="flex justify-around py-3">
//           <Link 
//             to="/"
//             className={`flex flex-col items-center p-2 ${activeTab === 'home' ? 'text-[#0E3692]' : 'text-gray-600'}`}
//           >
//             <Home size={20} />
//             <span className="text-xs mt-1">Home</span>
//           </Link>
//           <Link 
//             to="/report"
//             className={`flex flex-col items-center p-2 ${activeTab === 'report' ? 'text-[#0E3692]' : 'text-gray-600'}`}
//           >
//             <Send size={20} />
//             <span className="text-xs mt-1">Report</span>
//           </Link>
//           <Link 
//             to="/emergency"
//             className={`flex flex-col items-center p-2 ${activeTab === 'emergency' ? 'text-[#0E3692]' : 'text-gray-600'}`}
//           >
//             <AlertTriangle size={20} />
//             <span className="text-xs mt-1">Emergency</span>
//           </Link>
//           <Link 
//             to="/about"
//             className={`flex flex-col items-center p-2 ${activeTab === 'about' ? 'text-[#0E3692]' : 'text-gray-600'}`}
//           >
//             <Info size={20} />
//             <span className="text-xs mt-1">About</span>
//           </Link>
//           <Link 
//             to="/updates"
//             className={`flex flex-col items-center p-2 ${activeTab === 'updates' ? 'text-[#0E3692]' : 'text-gray-600'}`}
//           >
//             <Bell size={20} />
//             <span className="text-xs mt-1">Updates</span>
//           </Link>
//         </div>
//       </footer>
//     </div>
//   );
// }


import { Link } from 'react-router-dom';
import { Home, Send, AlertTriangle, Info, Bell } from 'lucide-react';
import kenyanFlag from "/src/assets/kenyanflag.png";
import { useState, useEffect, useRef } from 'react';

export default function Layout({ children, activeTab }) {
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setHeaderVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setHeaderVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      {/* Header - Animated based on scroll */}
      <header className={`fixed top-0 left-0 right-0 py-5 px-4 text-white transition-transform duration-300 z-20 ${
        headerVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0E3692] to-transparent opacity-90"></div>
        <div className="relative z-10 flex justify-between items-center max-w-4xl mx-auto">
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
      <main className="flex-1 overflow-y-auto pt-16 pb-20 px-4 max-w-4xl mx-auto w-full">
        {children}
      </main>

      {/* Fixed Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-around py-3 px-4">
            <Link 
              to="/"
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                activeTab === 'home' 
                  ? 'text-[#0E3692] bg-blue-50' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Home size={20} />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link 
              to="/report"
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                activeTab === 'report' 
                  ? 'text-[#0E3692] bg-blue-50' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Send size={20} />
              <span className="text-xs mt-1">Report</span>
            </Link>
            <Link 
              to="/emergency"
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                activeTab === 'emergency' 
                  ? 'text-[#0E3692] bg-blue-50' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <AlertTriangle size={20} />
              <span className="text-xs mt-1">Emergency</span>
            </Link>
            <Link 
              to="/about"
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                activeTab === 'about' 
                  ? 'text-[#0E3692] bg-blue-50' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Info size={20} />
              <span className="text-xs mt-1">About</span>
            </Link>
            <Link 
              to="/updates"
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                activeTab === 'updates' 
                  ? 'text-[#0E3692] bg-blue-50' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Bell size={20} />
              <span className="text-xs mt-1">Updates</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}