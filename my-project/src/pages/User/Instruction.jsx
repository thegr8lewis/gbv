import React, { useState, useEffect } from 'react';

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
                    
                    // Handle specific error cases based on status code
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
                            // Use the error message from the backend
                            break;
                    }
                    
                    throw new Error(errorMessage);
                }
                
                setInstructions(data.instructions);
                
            } catch (err) {
                console.error("Error fetching instructions:", err);
                
                let errorMessage = err.message;
                
                // Handle network errors
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

    // Function to dismiss error message
    const dismissError = () => {
        setShowError(false);
    };

    // Parse instructions into an array for display
    const instructionsList = instructions ? instructions.split('\n').filter(item => item.trim() !== '') : [];

    return (
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 mt-6 shadow-lg border border-blue-100">
            <h3 className="text-xl font-bold text-indigo-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Safety Instructions: <span className="font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 ml-1">{category}</span>
            </h3>
            
            {/* Error Alert */}
            {error && showError && (
                <div className="mb-6 rounded-lg bg-red-50 border-l-4 border-red-500 p-4 animate-fade-in-down">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3 flex-1 md:flex md:justify-between">
                            <p className="text-sm text-red-700">{error}</p>
                            <button 
                                onClick={dismissError}
                                className="ml-3 flex-shrink-0 text-red-500 hover:text-red-700 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Loading State */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="text-indigo-600 mt-4 font-medium">Loading safety instructions...</p>
                </div>
            ) : error && !showError ? (
                <div className="bg-red-50 rounded-xl p-4 text-center">
                    <p className="text-red-700 font-medium">Unable to load safety instructions</p>
                    <button 
                        onClick={() => setShowError(true)} 
                        className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
                    >
                        Show details
                    </button>
                </div>
            ) : instructionsList.length > 0 ? (
                <div className="space-y-4">
                    {instructionsList.map((item, index) => (
                        <div key={index} className="flex items-start group rounded-xl p-3 hover:bg-white/70 transition-colors">
                            <div className="flex-shrink-0 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 shadow-sm group-hover:shadow-md transition-shadow">
                                <span className="font-bold text-sm">{index + 1}</span>
                            </div>
                            <div className="text-gray-700 leading-relaxed">{item.replace(/^\d+\.\s*/, '')}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-6">
                    <p className="text-gray-500">No safety instructions available for this category.</p>
                </div>
            )}
            
            {/* Footer with emergency notice */}
            <div className="mt-6 pt-4 border-t border-indigo-100">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <p className="ml-3 text-sm text-gray-600">
                        <strong className="text-amber-600 font-medium">Important:</strong> These are general recommendations. For immediate danger, contact local emergency services.
                    </p>
                </div>
            </div>
        </div>
    );
}