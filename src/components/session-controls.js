import React from 'react';

const SessionControls = ({ 
  cropperActive, 
  onToggleCropper, 
  onGeneratePreview,
  onDownloadJSON
}) => {
  return (
    <div className="bg-gray-800 p-6 flex justify-between items-center">
      <div className="flex space-x-4">
        <button
          onClick={onToggleCropper}
          className={`px-6 py-3 rounded-md text-white font-medium ${
            cropperActive 
              ? 'bg-purple-600 hover:bg-purple-700' 
              : 'bg-purple-500 hover:bg-purple-600'
          }`}
        >
          {cropperActive ? 'Remove Cropper' : 'Start Cropper'}
        </button>
        
        {cropperActive && (
          <button
            onClick={onGeneratePreview}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-md text-white font-medium"
          >
            Generate Preview
          </button>
        )}
      </div>
      
      <button
        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-md text-white font-medium"
      >
        Cancel
      </button>
    </div>
  );
};

export default SessionControls;
