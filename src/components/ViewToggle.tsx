"use client";

import { useState } from "react";

export default function ViewToggle() {
  const [isGoogleView, setIsGoogleView] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    setIsSubmitted(false);
    setTimeout(() => {
      setIsGoogleView(!isGoogleView);
    }, 400);
    setTimeout(() => {
      setIsAnimating(false);
    }, 800);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  return (
    <>
      {/* Page Fold Button - Bottom Right / Top Left */}
      <button
        onClick={handleToggle}
        disabled={isAnimating}
        className={`fixed z-[60] group transition-all duration-700 ease-in-out ${
          isGoogleView 
            ? 'top-8 left-8' 
            : 'bottom-8 right-8'
        }`}
        title={isGoogleView ? "Return to Modern View" : "See Old Google Forms"}
      >
        <div className="relative w-14 h-14">
          {/* Main button with page fold corner */}
          <div 
            className={`absolute inset-0 rounded-lg shadow-2xl transition-all duration-500 ${
              isGoogleView
                ? 'bg-gradient-to-br from-purple-600 to-violet-700 shadow-purple-500/50'
                : 'bg-gradient-to-br from-slate-800 to-slate-900 shadow-slate-900/50'
            } group-hover:scale-110`}
          >
            {/* Icon - Back Arrow in Google mode, ? in modern mode */}
            <div className="absolute inset-0 flex items-center justify-center">
              {isGoogleView ? (
                <svg 
                  className="w-6 h-6 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2.5} 
                    d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                  />
                </svg>
              ) : (
                <span className="text-white text-2xl font-bold">?</span>
              )}
            </div>
          </div>

          {/* Page curl triangle */}
          <div 
            className={`absolute transition-all duration-500 ${
              isGoogleView
                ? 'top-0 left-0'
                : 'bottom-0 right-0'
            }`}
            style={{
              width: 0,
              height: 0,
              borderStyle: 'solid',
              ...(isGoogleView 
                ? {
                    borderWidth: '20px 20px 0 0',
                    borderColor: 'rgba(255,255,255,0.3) transparent transparent transparent'
                  }
                : {
                    borderWidth: '0 0 20px 20px',
                    borderColor: 'transparent transparent rgba(255,255,255,0.3) transparent'
                  }
              ),
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))'
            }}
          />
        </div>
      </button>

      {/* Hide Navbar in Google View */}
      <style jsx global>{`
        ${isGoogleView ? 'nav { display: none !important; }' : ''}
      `}</style>

      {/* Skewed Panel Animation Container */}
      <div className={`fixed inset-0 z-50 pointer-events-none ${isAnimating ? 'pointer-events-auto' : ''}`}>
        {/* Panel 1 */}
        <div 
          className="absolute h-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl transition-all duration-700 ease-in-out"
          style={{
            width: '30%',
            transform: isAnimating 
              ? 'skewX(-5deg) translateX(0)' 
              : 'skewX(-5deg) translateX(-150%)',
            left: 0,
            opacity: isAnimating ? 1 : 0
          }}
        />
        
        {/* Panel 2 */}
        <div 
          className="absolute h-full bg-gradient-to-br from-gray-200 to-gray-300 shadow-2xl transition-all duration-700 ease-in-out"
          style={{
            width: '30%',
            transform: isAnimating 
              ? 'skewX(-5deg) translateX(0)' 
              : 'skewX(-5deg) translateX(-150%)',
            left: '25%',
            transitionDelay: '50ms',
            opacity: isAnimating ? 1 : 0
          }}
        />
        
        {/* Panel 3 */}
        <div 
          className="absolute h-full bg-gradient-to-br from-gray-300 to-white shadow-2xl transition-all duration-700 ease-in-out"
          style={{
            width: '30%',
            transform: isAnimating 
              ? 'skewX(-5deg) translateX(0)' 
              : 'skewX(-5deg) translateX(-150%)',
            left: '50%',
            transitionDelay: '100ms',
            opacity: isAnimating ? 1 : 0
          }}
        />
        
        {/* Panel 4 */}
        <div 
          className="absolute h-full bg-gradient-to-br from-white to-gray-100 shadow-2xl transition-all duration-700 ease-in-out"
          style={{
            width: '30%',
            transform: isAnimating 
              ? 'skewX(-5deg) translateX(0)' 
              : 'skewX(-5deg) translateX(-150%)',
            left: '75%',
            transitionDelay: '150ms',
            opacity: isAnimating ? 1 : 0
          }}
        />
      </div>

      {/* Google Forms Style Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-white transition-opacity duration-500 ${
          isGoogleView && !isAnimating
            ? 'opacity-100 pointer-events-auto' 
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="h-full overflow-y-auto">
          {!isSubmitted ? (
            <>
              {/* Google Forms Header */}
              <div className="bg-[#673ab7] h-3"></div>
              <div className="max-w-3xl mx-auto py-8 px-4">
                
                {/* Form Container */}
                <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-4">
                  <div className="p-6 border-l-8 border-[#673ab7]">
                    <h1 className="text-3xl font-normal text-gray-800 mb-2">
                      VIT Student Feedback Form
                    </h1>
                    <p className="text-sm text-gray-600">
                      Please fill out this feedback form for your instructor
                    </p>
                    <p className="text-sm text-red-600 mt-2">* Required</p>
                  </div>
                </div>

                {/* Question 1 */}
                <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-4 p-6">
                  <label className="block text-gray-800 font-normal mb-4">
                    Your Email <span className="text-red-600">*</span>
                  </label>
                  <input 
                    type="email" 
                    className="w-full max-w-md border-b border-gray-300 focus:border-[#673ab7] outline-none py-2 text-gray-800"
                    placeholder="Your email"
                  />
                </div>

                {/* Question 2 */}
                <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-4 p-6">
                  <label className="block text-gray-800 font-normal mb-4">
                    Rate the instructor&apos;s teaching quality <span className="text-red-600">*</span>
                  </label>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <div key={rating} className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="rating" 
                          className="w-4 h-4 text-[#673ab7]"
                          id={`rating-${rating}`}
                        />
                        <label htmlFor={`rating-${rating}`} className="text-gray-700">
                          {rating} - {rating === 1 ? "Poor" : rating === 5 ? "Excellent" : ""}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Question 3 */}
                <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-4 p-6">
                  <label className="block text-gray-800 font-normal mb-4">
                    Additional Comments <span className="text-red-600">*</span>
                  </label>
                  <textarea 
                    className="w-full border border-gray-300 rounded p-3 focus:border-[#673ab7] outline-none text-gray-800"
                    rows={4}
                    placeholder="Your answer"
                  ></textarea>
                </div>

                {/* Question 4 */}
                <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-4 p-6">
                  <label className="block text-gray-800 font-normal mb-4">
                    Which aspects need improvement? (Check all that apply) <span className="text-red-600">*</span>
                  </label>
                  <div className="space-y-2">
                    {[
                      "Communication",
                      "Course Material",
                      "Teaching Methods",
                      "Availability",
                      "Assignment Quality"
                    ].map((aspect) => (
                      <div key={aspect} className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-[#673ab7]"
                          id={aspect}
                        />
                        <label htmlFor={aspect} className="text-gray-700">
                          {aspect}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 items-center py-6">
                  <button 
                    className="px-6 py-2 bg-[#673ab7] hover:bg-[#7c4dff] text-white rounded font-medium shadow-sm transition-colors"
                    onClick={handleSubmit}
                  >
                    Submit
                  </button>
                  <button 
                    className="px-6 py-2 text-[#673ab7] hover:bg-gray-100 rounded font-medium transition-colors"
                  >
                    Clear form
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Google Forms Submission Confirmation */
            <div className="h-full flex items-center justify-center bg-white">
              <div className="max-w-md text-center px-6">
                {/* Checkmark Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-[#673ab7] flex items-center justify-center">
                    <svg 
                      className="w-12 h-12 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={3} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                  </div>
                </div>

                {/* Success Message */}
                <h2 className="text-2xl font-normal text-gray-800 mb-3">
                  Your response has been recorded
                </h2>
                
                <p className="text-gray-600 mb-8">
                  Thank you for your feedback!
                </p>

                {/* Actions */}
                <div className="space-y-3">
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="w-full px-6 py-2 text-[#673ab7] hover:bg-purple-50 rounded font-medium transition-colors border border-gray-300"
                  >
                    Submit another response
                  </button>
                </div>

                {/* Footer text */}
                <p className="text-xs text-gray-500 mt-8">
                  This content is created by the owner of the form. The data you submit is sent to the form owner.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
