import React from 'react';
import { ChevronLeft, X, Check } from 'lucide-react';
import ProgressBar from './ProgressBar';

interface Step3ConfirmationProps {
  offerAccepted: boolean;
  onConfirm: () => void;
  onBack: () => void;
  onClose: () => void;
  loading: boolean;
}

const Step3Confirmation: React.FC<Step3ConfirmationProps> = ({ 
  offerAccepted, 
  onConfirm, 
  onBack, 
  onClose, 
  loading 
}) => {
  return (
    <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full mx-auto flex overflow-hidden min-h-[500px]">
      {/* Left Content */}
      <div className="flex-1 p-12 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="text-gray-500 hover:text-gray-700 transition-colors flex items-center"
              disabled={loading}
            >
              <ChevronLeft size={24} />
              <span className="ml-1">Back</span>
            </button>
            <h1 className="text-xl font-medium text-gray-800">Subscription Cancellation</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <ProgressBar currentStep={offerAccepted ? 2 : 3} totalSteps={3} />
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center max-w-lg">
          {offerAccepted ? (
            // Success state when offer was accepted
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-600" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-800">Great choice!</h2>
              
              <p className="text-lg text-gray-600">
                You're all set with $10 off until you find a job. We're rooting for you!
              </p>
              
              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <h3 className="font-semibold text-gray-800 mb-2">Your new plan:</h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-2xl font-bold text-green-600">$15.00</span>
                  <span className="text-gray-600">/month</span>
                  <span className="text-sm text-gray-400 line-through">$25/month</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Discount applies until you update us about your job status
                </p>
              </div>
              
              <button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-2xl text-lg transition-all duration-200"
              >
                Continue with discount
              </button>
            </div>
          ) : (
            // Cancellation confirmation state
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-800">
                We're sorry to see you go
              </h2>
              
              <p className="text-lg text-gray-600">
                Are you sure you want to cancel your subscription? This action cannot be undone.
              </p>
              
              <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                <h3 className="font-semibold text-red-800 mb-2">What you'll lose:</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Access to premium job search tools</li>
                  <li>• Visa sponsorship database</li>
                  <li>• Resume optimization features</li>
                  <li>• Interview preparation resources</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-4 px-6 rounded-2xl text-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      Cancelling...
                    </>
                  ) : (
                    'Yes, cancel my subscription'
                  )}
                </button>
                
                <button
                  onClick={onBack}
                  disabled={loading}
                  className="w-full text-gray-700 font-medium py-4 px-6 rounded-2xl text-lg hover:bg-gray-50 disabled:bg-gray-100 transition-all duration-200"
                >
                  Keep my subscription
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Image - Same NYC skyline */}
      <div className="flex-1 relative">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-blue-700"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent"></div>

    {/* NYC skyline image */}
      <img
        src="/images/empire-state-compressed.jpg"
        alt="Empire State"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
    </div>
  );
};

export default Step3Confirmation;