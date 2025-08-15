import React, { useState, useEffect } from 'react';
import { ChevronLeft, X } from 'lucide-react';

// Types
interface ABTestVariant {
  variant: 'A' | 'B';
  showDownsell: boolean;
}

// Mock API functions (replace with your actual backend calls)
const api = {
  getABTestVariant: async (): Promise<ABTestVariant> => {
    // For demo purposes, let's always show variant B (with downsell)
    // In production, you'd use proper A/B testing logic
    return { variant: 'B', showDownsell: true };
  },
  
  submitCancellation: async (data: any) => {
    return new Promise(resolve => setTimeout(resolve, 1000));
  },
  
  applyDiscount: async (userId: string) => {
    return new Promise(resolve => setTimeout(resolve, 800));
  }
};

// Progress Bar Component
const ProgressBar: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <div className="flex gap-1">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`w-8 h-1 rounded-full transition-all duration-300 ${
              i < currentStep ? 'bg-gray-800' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <span className="ml-2">Step {currentStep} of {totalSteps}</span>
    </div>
  );
};

// Step 1: Initial Question
const Step1Initial: React.FC<{ onNext: (answer: string) => void; onClose: () => void }> = ({ onNext, onClose }) => {
  return (
    <div className="bg-white rounded-3xl shadow-lg w-full max-w-7xl mx-auto flex overflow-hidden min-h-[600px]">
      {/* Left Content */}
      <div className="flex-1 p-10 flex flex-col justify-center">
        {/* Header */}
        <div className="relative mb-8">
          <h1 className="text-center text-xl font-medium text-gray-800">Subscription Cancellation</h1>
          <button 
            onClick={onClose}
            className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">
            Hey mate,<br />
            Quick one before you go.
          </h2>
          <h3 className="text-xl font-medium text-gray-800 italic">
            Have you found a job yet?
          </h3>
          <p className="text-sm text-gray-600">
            Whatever your answer, we just want to help you take the next step.<br />
            With visa support, or by hearing how we can do better.
          </p>

          {/* Answer Options */}
          <div className="space-y-2 mt-4">
            <button
              onClick={() => onNext('found_job')}
              className="w-full p-3 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
            >
              Yes, I've found a job
            </button>
            
            <button
              onClick={() => onNext('still_looking')}
              className="w-full p-3 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
            >
              Not yet - I'm still looking
            </button>
          </div>
        </div>
      </div>

      {/* Right Image */}
      <div className="flex-1 p-6 flex justify-center items-center">
        <div className="w-full rounded-2xl overflow-hidden shadow-md">
          <img
            src="/images/empire-state-compressed.jpg"
            alt="Empire State"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </div>
  );
};

// Step 2: Downsell Offer (only shown for Variant B)
const Step2Downsell: React.FC<{
  onAccept: () => void;
  onDecline: () => void;
  onBack: () => void;
  onClose: () => void;
}> = ({ onAccept, onDecline, onBack, onClose }) => {
  return (
    <div className="bg-white rounded-3xl shadow-lg w-full max-w-7xl mx-auto flex overflow-hidden min-h-[600px]">
      {/* Left Content */}
      <div className="flex-1 p-10 flex flex-col justify-center">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
            >
              <ChevronLeft size={20} />
              <span>Back</span>
            </button>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="text-center mb-3">
            <h1 className="text-xl font-medium text-gray-800">Subscription Cancellation</h1>
            <p className="text-xs text-gray-400 mt-1">
              Special Offer
            </p>
          </div>
          
          <div className="flex justify-center">
            <ProgressBar currentStep={2} totalSteps={3} />
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4 max-w-lg mx-auto w-full">
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">
            We built this to help you land the job, this makes it a little easier.
          </h2>
          <p className="text-sm text-gray-600">
            We've been there and we're here to help you.
          </p>

          {/* Offer Card */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Here's <span className="underline">50% off</span> until you find a job.
              </h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-2xl font-bold text-purple-600">$12.50</span>
                <span className="text-sm text-gray-600">/month</span>
                <span className="text-xs text-gray-400 line-through">$25/month</span>
              </div>
            </div>

            <button
              onClick={onAccept}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl text-base transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5 mb-3"
            >
              Get 50% off
            </button>

            <p className="text-center text-xs text-gray-500">
              You won't be charged until your next billing date.
            </p>
          </div>

          {/* Decline Option */}
          <button
            onClick={onDecline}
            className="w-full p-3 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all duration-200"
          >
            No thanks
          </button>
        </div>
      </div>

      {/* Right Image - Same as Step 1 */}
      <div className="flex-1 p-6 flex justify-center items-center">
        <div className="w-full rounded-2xl overflow-hidden shadow-md">
          <img
            src="/images/empire-state-compressed.jpg"
            alt="Empire State"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </div>
  );
};

// Step 3: Final Confirmation
const Step3Confirmation: React.FC<{
  offerAccepted: boolean;
  onConfirm: () => void;
  onBack: () => void;
  onClose: () => void;
  loading: boolean;
}> = ({ offerAccepted, onConfirm, onBack, onClose, loading }) => {
  return (
    <div className="bg-white rounded-3xl shadow-lg w-full max-w-7xl mx-auto flex overflow-hidden min-h-[600px]">
      {/* Left Content */}
      <div className="flex-1 p-10 flex flex-col justify-center">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <ChevronLeft size={20} />
              <span>Back</span>
            </button>
            
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="text-center mb-3">
            <h1 className="text-xl font-medium text-gray-800">Subscription Cancellation</h1>
            <p className="text-xs text-gray-400 mt-1">
              {offerAccepted ? 'Offer Accepted' : 'Final Confirmation'}
            </p>
          </div>
          
          <div className="flex justify-center">
            <ProgressBar currentStep={3} totalSteps={3} />
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4 max-w-lg mx-auto w-full">
          {offerAccepted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">Great choice!</h2>
              <p className="text-sm text-gray-600">
                You're all set with 50% off until you find a job. We're rooting for you!
              </p>
              <button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl text-base transition-all duration-200"
              >
                Continue with discount
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                We're sorry to see you go
              </h2>
              <p className="text-sm text-gray-600">
                Are you sure you want to cancel your subscription? This action cannot be undone.
              </p>
              <div className="space-y-2">
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-3 px-4 rounded-xl text-base transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Cancelling...
                    </>
                  ) : (
                    'Yes, cancel my subscription'
                  )}
                </button>
                <button
                  onClick={onBack}
                  disabled={loading}
                  className="w-full text-gray-700 font-medium py-3 px-4 rounded-xl text-base hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                >
                  Keep my subscription
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 flex justify-center items-center">
        <div className="w-full rounded-2xl overflow-hidden shadow-md">
          <img
            src="/images/empire-state-compressed.jpg"
            alt="Empire State"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </div>
  );
};

// Main App Component with Demo Flow
const CancellationFlow = () => {
  const [currentStep, setCurrentStep] = useState<'step1' | 'step2' | 'step3'>('step1');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [offerAccepted, setOfferAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [abTestVariant, setAbTestVariant] = useState<ABTestVariant>({ variant: 'B', showDownsell: true });

  useEffect(() => {
    // Initialize A/B test variant
    api.getABTestVariant().then(setAbTestVariant);
  }, []);

  const handleStep1Next = (answer: string) => {
    setUserAnswer(answer);
    if (abTestVariant.showDownsell) {
      setCurrentStep('step2');
    } else {
      setCurrentStep('step3');
    }
  };

  const handleOfferAccept = async () => {
    setOfferAccepted(true);
    // Apply discount logic here
    try {
      await api.applyDiscount('user-123');
      setCurrentStep('step3');
    } catch (error) {
      console.error('Error applying discount:', error);
      setCurrentStep('step3');
    }
  };

  const handleOfferDecline = () => {
    setOfferAccepted(false);
    setCurrentStep('step3');
  };

  const handleFinalConfirm = async () => {
    setLoading(true);
    try {
      await api.submitCancellation({ userAnswer, offerAccepted });
      setLoading(false);
      // Handle post-cancellation logic
      alert('Subscription cancelled successfully');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      setLoading(false);
      alert('Error cancelling subscription. Please try again.');
    }
  };

  const handleClose = () => {
    // Handle modal close
    if (offerAccepted) {
      alert('Continuing with 50% discount!');
    } else {
      alert('Modal closed - subscription remains active');
    }
  };

  const handleBack = () => {
    if (currentStep === 'step3') {
      if (abTestVariant.showDownsell) {
        setCurrentStep('step2');
      } else {
        setCurrentStep('step1');
      }
    } else if (currentStep === 'step2') {
      setCurrentStep('step1');
    }
    // Reset offer acceptance when going back
    if (currentStep === 'step3' && offerAccepted) {
      setOfferAccepted(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-2">
      {/* Debug info */}
      {/* <div className="fixed top-4 left-4 bg-white p-4 rounded-lg shadow-lg text-xs max-w-xs">
        <div><strong>Debug Info:</strong></div>
        <div>Current Step: {currentStep}</div>
        <div>User Answer: {userAnswer}</div>
        <div>Offer Accepted: {offerAccepted.toString()}</div>
        <div>Variant: {abTestVariant.variant}</div>
        <div>Show Downsell: {abTestVariant.showDownsell.toString()}</div>
      </div> */}

      {currentStep === 'step1' && (
        <Step1Initial onNext={handleStep1Next} onClose={handleClose} />
      )}
      
      {currentStep === 'step2' && abTestVariant.showDownsell && (
        <Step2Downsell 
          onAccept={handleOfferAccept}
          onDecline={handleOfferDecline}
          onBack={handleBack}
          onClose={handleClose}
        />
      )}
      
      {currentStep === 'step3' && (
        <Step3Confirmation
          offerAccepted={offerAccepted}
          onConfirm={handleFinalConfirm}
          onBack={handleBack}
          onClose={handleClose}
          loading={loading}
        />
      )}
    </div>
  );
};

export default CancellationFlow;