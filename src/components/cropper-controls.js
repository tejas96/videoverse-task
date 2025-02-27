import React from 'react';

const CropperControls = ({ 
  playbackRate, 
  aspectRatio, 
  onPlaybackChange,
  onAspectRatioChange
}) => {
  const playbackRates = [0.5, 1, 1.5, 2];
  const aspectRatios = ['9:16', '9:18', '4:3', '3:4', '1:1', '4:5'];
  
  return (
    <div className="flex space-x-4">
      <div className="relative">
        <button 
          className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700"
        >
          <span>Playback speed {playbackRate}x</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div className="absolute top-full left-0 mt-1 w-full bg-gray-800 rounded-md shadow-lg z-10 hidden">
          {playbackRates.map(rate => (
            <button
              key={rate}
              className={`block w-full text-left px-4 py-2 text-sm ${
                playbackRate === rate ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => onPlaybackChange(rate)}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>
      
      <div className="relative">
        <button 
          className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700"
        >
          <span>Cropper Aspect Ratio {aspectRatio}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div className="absolute top-full left-0 mt-1 w-full bg-gray-800 rounded-md shadow-lg z-10 hidden">
          {aspectRatios.map(ratio => (
            <button
              key={ratio}
              className={`block w-full text-left px-4 py-2 text-sm ${
                aspectRatio === ratio ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => onAspectRatioChange(ratio)}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CropperControls;
