import React, { useRef, useEffect } from 'react';

const PreviewPanel = ({ cropperState, isActive }) => {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  
  // Draw the preview when cropper changes
  useEffect(() => {
    if (!isActive || !cropperState.isActive) return;
    
    const canvas = canvasRef.current;
    const video = document.querySelector('video'); // Get the main video element
    
    if (!canvas || !video) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions based on aspect ratio
    const [widthRatio, heightRatio] = cropperState.aspectRatio.split(':').map(Number);
    const previewContainerWidth = canvas.parentNode.clientWidth; 
    const previewHeight = (previewContainerWidth * heightRatio) / widthRatio;
    
    canvas.width = previewContainerWidth;
    canvas.height = previewHeight;
    
    // Drawing function for the preview
    const drawPreview = () => {
      if (!cropperState.isActive) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      try {
        ctx.drawImage(
          video,
          cropperState.position.x,
          cropperState.position.y,
          cropperState.dimensions.width,
          cropperState.dimensions.height,
          0, 0, canvas.width, canvas.height
        );
      } catch (e) {
        console.error('Preview drawing error:', e);
      }
      
      requestAnimationFrame(drawPreview);
    };
    
    const animationId = requestAnimationFrame(drawPreview);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [cropperState, isActive]);
  
  return (
    <div className="h-full">
      <h3 className="text-lg font-medium text-white mb-3">Preview</h3>
      
      {(!isActive || !cropperState.isActive) ? (
        <div className="bg-gray-800 rounded-md flex flex-col items-center justify-center p-8 text-center h-64">
          <div className="w-16 h-16 mb-4 text-gray-500">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-gray-300 font-medium mb-1">Preview not available</div>
          <p className="text-gray-500 text-sm">
            Please click on "Start Cropper" <br />and then play video
          </p>
        </div>
      ) : (
        <div className="bg-black rounded-md overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-auto" />
        </div>
      )}
    </div>
  );
};

export default PreviewPanel;
