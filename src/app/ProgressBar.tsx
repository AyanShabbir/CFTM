import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
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

export default ProgressBar;