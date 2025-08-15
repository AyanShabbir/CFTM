import React from 'react';
import { ChevronLeft, X } from 'lucide-react';
import ProgressBar from './ProgressBar';

interface Step2DownsellProps {
  onAccept: () => void;
  onDecline: () => void;
  onBack: () => void;
  onClose: () => void;
  loading?: boolean;
}

const Step2Downsell: React.FC<Step2DownsellProps> = ({ 
  onAccept, 
  onDecline, 
  onBack, 
  onClose,
  loading = false 
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
            <ProgressBar currentStep={1} totalSteps={3} />
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
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 leading-tight mb-6">
                We built this to help you land the job, this makes it a little easier.
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                We've been there and we're here to help you.
              </p>
            </div>

            {/* Offer Card - Updated to $10 off as specified */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 border-2 border-purple-100">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Here's <span className="underline">$10 off</span> until you find a job.
                </h3>
                <div className="flex items-baseline justify-center gap-4">
                  <span className="text-4xl font-bold text-purple-600">$15.00</span>
                  <span className="text-xl text-gray-600">/month</span>
                  <span className="text-lg text-gray-400 line-through">$25/month</span>
                </div>
              </div>

              <button
                onClick={onAccept}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-4 px-6 rounded-2xl text-lg transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 mb-4 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    Applying discount...
                  </>
                ) : (
                  'Get $10 off'
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                You wont be charged until your next billing date.
              </p>
            </div>

            {/* Decline Option */}
            <button
              onClick={onDecline}
              disabled={loading}
              className="w-full p-6 text-lg text-gray-700 bg-gray-50 hover:bg-gray-100 disabled:bg-gray-100 rounded-2xl border border-gray-200 transition-all duration-200"
            >
              No thanks
            </button>
          </div>
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

export default Step2Downsell;