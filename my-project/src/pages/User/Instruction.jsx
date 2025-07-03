
// import React, { useState, useEffect } from 'react';
// import { AlertTriangle, LocateFixed, Info, ShieldAlert } from 'lucide-react';

// export default function InstructionsComponent({ category }) {
//     const [instructions, setInstructions] = useState('');
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [showError, setShowError] = useState(false);

//     useEffect(() => {
//         const fetchInstructions = async () => {
//             if (!category) return;
            
//             setIsLoading(true);
//             setError(null);
//             setShowError(false);
            
//             try {
//                 const response = await fetch('http://localhost:8000/api/instructions', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({ category })
//                 });
                
//                 const data = await response.json();
                
//                 if (!response.ok) {
//                     let errorMessage = data.error || 'Failed to load instructions';
                    
//                     // Handle specific error cases based on status code
//                     switch (response.status) {
//                         case 401:
//                             errorMessage = "API authentication failed. Please contact support.";
//                             break;
//                         case 402:
//                             errorMessage = "API usage limit reached. Please try again later.";
//                             break;
//                         case 429:
//                             errorMessage = "Too many requests. Please try again later.";
//                             break;
//                         case 503:
//                             errorMessage = "Service is currently unavailable. Please try again later.";
//                             break;
//                         default:
//                             // Use the error message from the backend
//                             break;
//                     }
                    
//                     throw new Error(errorMessage);
//                 }
                
//                 setInstructions(data.instructions);
                
//             } catch (err) {
//                 console.error("Error fetching instructions:", err);
                
//                 let errorMessage = err.message;
                
//                 // Handle network errors
//                 if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
//                     errorMessage = 'Network error. Please check your connection and try again.';
//                 }
                
//                 setError(errorMessage);
//                 setShowError(true);
//             } finally {
//                 setIsLoading(false);
//             }
//         };
    
//         fetchInstructions();
//     }, [category]);

//     // Function to dismiss error message
//     const dismissError = () => {
//         setShowError(false);
//     };

//     // Parse instructions into an array for display
//     const instructionsList = instructions ? instructions.split('\n').filter(item => item.trim() !== '') : [];

//     const renderErrorAlert = () => (
//         <div className="mb-6 rounded-lg bg-red-50 border-l-4 border-red-500 p-4 animate-fade-in-down">
//             <div className="flex items-start">
//                 <div className="flex-shrink-0">
//                     <AlertTriangle className="h-5 w-5 text-red-500" />
//                 </div>
//                 <div className="ml-3 flex-1 md:flex md:justify-between">
//                     <p className="text-sm text-red-700">{error}</p>
//                     <button 
//                         onClick={dismissError}
//                         className="ml-3 flex-shrink-0 text-red-500 hover:text-red-700 transition-colors"
//                     >
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                             <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//                         </svg>
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );

//     const renderLoadingState = () => (
//         <div className="flex flex-col items-center justify-center py-8">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//             <p className="text-indigo-600 mt-4 font-medium">Loading safety instructions...</p>
//         </div>
//     );

//     const renderErrorState = () => (
//         <div className="bg-red-50 rounded-xl p-4 text-center">
//             <p className="text-red-700 font-medium">Unable to load safety instructions</p>
//             <button 
//                 onClick={() => setShowError(true)} 
//                 className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
//             >
//                 Show details
//             </button>
//         </div>
//     );

//     const renderInstructionsList = () => (
//         <div className="space-y-4">
//             {instructionsList.map((item, index) => (
//                 <div key={index} className="flex items-start group rounded-xl p-3 hover:bg-white/70 transition-colors">
//                     <div className="flex-shrink-0 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 shadow-sm group-hover:shadow-md transition-shadow">
//                         <span className="font-bold text-sm">{index + 1}</span>
//                     </div>
//                     <div className="text-gray-700 leading-relaxed">{item.replace(/^\d+\.\s*/, '')}</div>
//                 </div>
//             ))}
//         </div>
//     );

//     const renderNoInstructions = () => (
//         <div className="text-center py-6">
//             <p className="text-gray-500">No safety instructions available for this category.</p>
//         </div>
//     );

//     const renderEmergencyNotice = () => (
//         <div className="mt-6 pt-4 border-t border-indigo-100">
//             <div className="flex items-start">
//                 <div className="flex-shrink-0">
//                     <ShieldAlert className="h-5 w-5 text-amber-500" />
//                 </div>
//                 <p className="ml-3 text-sm text-gray-600">
//                     <strong className="text-amber-600 font-medium">Important:</strong> These are general recommendations. For immediate danger, contact local emergency services.
//                 </p>
//             </div>
//         </div>
//     );

//     return (
//         <div className="max-w-4xl mx-auto p-4">
//             <div className="flex items-center gap-3 mb-6">
//                 <Info className="w-7 h-7 text-indigo-600" />
//                 <h1 className="text-2xl font-bold text-gray-800">Safety Instructions</h1>
//             </div>

//             <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 shadow-lg border border-blue-100">
//                 <h3 className="text-xl font-bold text-indigo-800 mb-4 flex items-center">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                         <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     Safety Instructions: <span className="font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 ml-1">{category}</span>
//                 </h3>
                
//                 {/* Error Alert */}
//                 {error && showError && renderErrorAlert()}
                
//                 {/* Loading State */}
//                 {isLoading ? renderLoadingState() : 
//                  error && !showError ? renderErrorState() : 
//                  instructionsList.length > 0 ? renderInstructionsList() : 
//                  renderNoInstructions()}
                
//                 {renderEmergencyNotice()}
//             </div>
//         </div>
//     );
// }

import React, { useState, useEffect } from 'react';
import { AlertTriangle, LocateFixed, Info, ShieldAlert } from 'lucide-react';

export default function InstructionsComponent({ category }) {
    const [instructions, setInstructions] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        const fetchInstructions = async () => {
            if (!category) return;
            
            setIsLoading(true);
            setError(null);
            setShowError(false);
            
            try {
                const response = await fetch('http://localhost:8000/api/instructions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ category })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    let errorMessage = data.error || 'Failed to load instructions';
                    
                    switch (response.status) {
                        case 401:
                            errorMessage = "API authentication failed. Please contact support.";
                            break;
                        case 402:
                            errorMessage = "API usage limit reached. Please try again later.";
                            break;
                        case 429:
                            errorMessage = "Too many requests. Please try again later.";
                            break;
                        case 503:
                            errorMessage = "Service is currently unavailable. Please try again later.";
                            break;
                        default:
                            break;
                    }
                    
                    throw new Error(errorMessage);
                }
                
                setInstructions(data.instructions);
                
            } catch (err) {
                console.error("Error fetching instructions:", err);
                
                let errorMessage = err.message;
                
                if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
                    errorMessage = 'Network error. Please check your connection and try again.';
                }
                
                setError(errorMessage);
                setShowError(true);
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchInstructions();
    }, [category]);

    const dismissError = () => {
        setShowError(false);
    };

    const instructionsList = instructions ? instructions.split('\n').filter(item => item.trim() !== '') : [];

    const renderErrorAlert = () => (
        <div className="mb-6 rounded-xl bg-red-50/80 backdrop-blur-sm p-4 border border-red-100 shadow-sm animate-fade-in">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1 space-y-2">
                    <p className="text-sm text-red-900 font-medium">{error}</p>
                    <button 
                        onClick={dismissError}
                        className="text-xs font-medium text-red-600 hover:text-red-800 transition-colors px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );

    const renderLoadingState = () => (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
                <div className="h-14 w-14 rounded-full border-2 border-indigo-100"></div>
                <div className="absolute top-0 left-0 h-14 w-14 rounded-full border-t-2 border-indigo-600 animate-spin"></div>
            </div>
            <p className="text-indigo-600 font-medium tracking-wide">Loading safety instructions...</p>
            <p className="text-sm text-gray-500 max-w-xs text-center">Preparing the best safety practices for {category}</p>
        </div>
    );

    const renderErrorState = () => (
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 text-center border border-red-100 shadow-inner">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-red-800 font-medium mb-3">Unable to load safety instructions</p>
            <button 
                onClick={() => setShowError(true)} 
                className="text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
            >
                Show details
            </button>
        </div>
    );

    const renderInstructionsList = () => (
        <div className="space-y-3">
            {instructionsList.map((item, index) => (
                <div key={index} className="flex items-start group rounded-xl p-4 hover:bg-white transition-colors duration-200 shadow-sm hover:shadow-md bg-white/50 backdrop-blur-sm">
                    <div className="flex-shrink-0 bg-white border border-indigo-100 text-indigo-600 rounded-lg w-8 h-8 flex items-center justify-center mr-3 shadow-sm group-hover:shadow transition-all duration-200 font-bold">
                        {index + 1}
                    </div>
                    <div className="text-gray-800 leading-relaxed font-medium">{item.replace(/^\d+\.\s*/, '')}</div>
                </div>
            ))}
        </div>
    );

    const renderNoInstructions = () => (
        <div className="text-center py-8 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-4 text-gray-500">
                <Info className="h-5 w-5" />
            </div>
            <p className="text-gray-600 font-medium">No safety instructions available for this category.</p>
            <p className="text-sm text-gray-500 mt-1">Please check back later or contact support</p>
        </div>
    );

    const renderEmergencyNotice = () => (
        <div className="mt-8 pt-6 border-t border-gray-200/70">
            <div className="flex items-start gap-3 bg-amber-50/70 backdrop-blur-sm rounded-xl p-4 border border-amber-100">
                <div className="flex-shrink-0 mt-0.5">
                    <ShieldAlert className="h-5 w-5 text-amber-600" />
                </div>
                <p className="text-sm text-amber-900">
                    <strong className="font-semibold">Emergency notice:</strong> These are general recommendations. In case of immediate danger, please contact your local emergency services immediately.
                </p>
            </div>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-indigo-600/10">
                    <Info className="w-6 h-6 text-indigo-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Safety Instructions</h1>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 overflow-hidden relative">
                {/* Decorative elements */}
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-indigo-100/50 blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-purple-100/50 blur-3xl"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-indigo-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                            Safety procedures for <span className="text-indigo-600">{category}</span>
                        </h3>
                    </div>
                    
                    {error && showError && renderErrorAlert()}
                    
                    {isLoading ? renderLoadingState() : 
                     error && !showError ? renderErrorState() : 
                     instructionsList.length > 0 ? renderInstructionsList() : 
                     renderNoInstructions()}
                    
                    {renderEmergencyNotice()}
                </div>
            </div>
        </div>
    );
}