import React, { useRef, useEffect, useState } from 'react';

const VideoPlayer = ({ 
  isPlaying, 
  currentTime, 
  playbackRate, 
  isMuted, 
  volume,
  cropperState,
  setCropperState,
  onTimeUpdate
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Initialize video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      onTimeUpdate(video.currentTime);
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [onTimeUpdate]);
  
  // Handle play/pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.play().catch(err => console.error('Error playing video:', err));
    } else {
      video.pause();
    }
  }, [isPlaying]);
  
  // Handle playback rate changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    video.playbackRate = playbackRate;
  }, [playbackRate]);
  
  // Handle volume changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    video.volume = volume;
    video.muted = isMuted;
  }, [volume, isMuted]);
  
  // Handle seeking
  useEffect(() => {
    const video = videoRef.current;
    if (!video || video.currentTime === currentTime) return;
    
    video.currentTime = currentTime;
  }, [currentTime]);
  
  // Initialize or update cropper dimensions when aspect ratio changes
  useEffect(() => {
    if (!videoRef.current || !cropperState.isActive) return;
    
    const video = videoRef.current;
    const videoRect = video.getBoundingClientRect();
    
    // Parse aspect ratio
    const [widthRatio, heightRatio] = cropperState.aspectRatio.split(':').map(Number);
    
    // Calculate cropper height (100% of video height in this design)
    const cropperHeight = videoRect.height;
    
    // Calculate width based on aspect ratio
    const cropperWidth = (cropperHeight * widthRatio) / heightRatio;
    
    // Center the cropper
    const centerX = (videoRect.width - cropperWidth) / 2;
    
    setCropperState(prev => ({
      ...prev,
      position: { x: centerX, y: 0 },
      dimensions: { width: cropperWidth, height: cropperHeight }
    }));
  }, [cropperState.isActive, cropperState.aspectRatio, setCropperState]);
  
  // Handle cropper dragging
  const startDrag = (e) => {
    if (!cropperState.isActive) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - cropperState.position.x,
      y: e.clientY - cropperState.position.y
    });
  };
  
  const handleDrag = (e) => {
    if (!isDragging || !cropperState.isActive) return;
    
    const videoRect = videoRef.current.getBoundingClientRect();
    
    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;
    
    // Constrain cropper within video boundaries
    newX = Math.max(0, Math.min(newX, videoRect.width - cropperState.dimensions.width));
    newY = Math.max(0, Math.min(newY, videoRect.height - cropperState.dimensions.height));
    
    setCropperState(prev => ({
      ...prev,
      position: { x: newX, y: newY }
    }));
  };
  
  const endDrag = () => {
    setIsDragging(false);
  };
  
  return (
    <div 
      ref={containerRef}
      className="relative bg-black rounded-md overflow-hidden"
      onMouseMove={handleDrag}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
    >
      <video 
        ref={videoRef}
        className="w-full h-auto object-contain"
        src="https://filesamples.com/samples/video/mp4/sample_960x540.mp4"
      />
      
      {cropperState.isActive && (
        <div 
          className="absolute border-2 border-white cursor-move"
          style={{
            left: `${cropperState.position.x}px`,
            top: `${cropperState.position.y}px`,
            width: `${cropperState.dimensions.width}px`,
            height: `${cropperState.dimensions.height}px`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
          }}
          onMouseDown={startDrag}
        >
          {/* Cropper grid lines */}
          <div className="absolute w-full h-px bg-white bg-opacity-50 top-1/3 left-0"></div>
          <div className="absolute w-full h-px bg-white bg-opacity-50 top-2/3 left-0"></div>
          <div className="absolute h-full w-px bg-white bg-opacity-50 left-1/3 top-0"></div>
          <div className="absolute h-full w-px bg-white bg-opacity-50 left-2/3 top-0"></div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
