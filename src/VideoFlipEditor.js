import React, { useState, useRef, useEffect } from 'react';
import './VideoFlipEditor.css';

const VideoFlipEditor = () => {
  // Video player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  
  // Cropper states
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("9:16");
  const [cropperPosition, setCropperPosition] = useState({ x: 0, y: 0 });
  const [cropperDimensions, setCropperDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Recording states
  const [recordedData, setRecordedData] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  
  // Refs
  const videoRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const cropperRef = useRef(null);
  const containerRef = useRef(null);
  const recordingInterval = useRef(null);
  
  // Aspect ratio options
  const aspectRatios = {
    "9:18": { width: 9, height: 18 },
    "9:16": { width: 9, height: 16 },
    "4:3": { width: 4, height: 3 },
    "3:4": { width: 3, height: 4 },
    "1:1": { width: 1, height: 1 },
    "4:5": { width: 4, height: 5 }
  };
  
  // Initialize cropper dimensions based on video size and aspect ratio
  useEffect(() => {
    if (videoRef.current && containerRef.current) {
      const video = videoRef.current;
      const container = containerRef.current;
      
      const updateCropperSize = () => {
        const videoRect = video.getBoundingClientRect();
        const { width: ratioWidth, height: ratioHeight } = aspectRatios[selectedAspectRatio];
        
        // Calculate cropper height (100% of video height)
        const cropperHeight = videoRect.height;
        
        // Calculate cropper width based on aspect ratio
        const cropperWidth = (cropperHeight * ratioWidth) / ratioHeight;
        
        // Ensure cropper remains within video boundaries
        const maxWidth = videoRect.width;
        const finalWidth = Math.min(cropperWidth, maxWidth);
        
        // Center cropper horizontally
        const centerX = (videoRect.width - finalWidth) / 2;
        
        setCropperDimensions({ width: finalWidth, height: cropperHeight });
        setCropperPosition({ x: centerX, y: 0 });
      };
      
      // Set dimensions when video metadata is loaded
      if (video.readyState >= 1) {
        updateCropperSize();
      } else {
        video.addEventListener('loadedmetadata', updateCropperSize);
      }
      
      return () => {
        video.removeEventListener('loadedmetadata', updateCropperSize);
      };
    }
  }, [selectedAspectRatio]);
  
  // Update preview canvas when video or cropper changes
  useEffect(() => {
    const video = videoRef.current;
    const canvas = previewCanvasRef.current;
    
    if (!video || !canvas) return;
    
    const updatePreview = () => {
      const ctx = canvas.getContext('2d');
      
      // Calculate the position and size for drawing the cropped region
      const sourceX = cropperPosition.x;
      const sourceY = cropperPosition.y;
      const sourceWidth = cropperDimensions.width;
      const sourceHeight = cropperDimensions.height;
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw the cropped region of the video onto the canvas
      ctx.drawImage(
        video,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, canvas.width, canvas.height
      );
    };
    
    // Set up preview dimensions based on cropper aspect ratio
    const { width: ratioWidth, height: ratioHeight } = aspectRatios[selectedAspectRatio];
    
    // Fixed preview container width
    const previewContainerWidth = 300;
    
    // Calculate preview height based on aspect ratio and fixed width
    const previewHeight = (previewContainerWidth * ratioHeight) / ratioWidth;
    
    canvas.width = previewContainerWidth;
    canvas.height = previewHeight;
    
    // Update preview initially and on each animation frame
    const animationFrameId = requestAnimationFrame(function updateFrame() {
      updatePreview();
      requestAnimationFrame(updateFrame);
    });
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [cropperPosition, cropperDimensions, selectedAspectRatio]);
  
  // Handle video playback and time updates
  useEffect(() => {
    const video = videoRef.current;
    
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    
    const handleDurationChange = () => {
      setDuration(video.duration);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);
  
  // Start/stop recording of cropper coordinates
  useEffect(() => {
    if (isRecording) {
      // Record initial state
      recordCoordinates();
      
      // Set up interval to record every second
      recordingInterval.current = setInterval(recordCoordinates, 1000);
    } else if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }
    
    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, [isRecording, cropperPosition, volume, playbackRate]);
  
  // Record current coordinates and settings
  const recordCoordinates = () => {
    const video = videoRef.current;
    if (!video) return;
    
    const videoRect = video.getBoundingClientRect();
    
    // Calculate coordinates as percentages of video dimensions
    const normalizedCoordinates = [
      (cropperPosition.x / videoRect.width) * 100,
      (cropperPosition.y / videoRect.height) * 100,
      (cropperDimensions.width / videoRect.width) * 100,
      (cropperDimensions.height / videoRect.height) * 100
    ];
    
    setRecordedData(prevData => [
      ...prevData,
      {
        timeStamp: video.currentTime,
        coordinates: normalizedCoordinates.map(coord => Number(coord.toFixed(6))),
        volume,
        playbackRate
      }
    ]);
  };
  
  // Handle video playback controls
  const togglePlay = () => {
    const video = videoRef.current;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const handleSeek = (e) => {
    const video = videoRef.current;
    const seekTime = parseFloat(e.target.value);
    
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };
  
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    const video = videoRef.current;
    
    video.volume = newVolume;
    setVolume(newVolume);
  };
  
  const handlePlaybackRateChange = (rate) => {
    const video = videoRef.current;
    
    video.playbackRate = rate;
    setPlaybackRate(rate);
  };
  
  // Format time for display (mm:ss)
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Handle cropper dragging
  const startDrag = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - cropperPosition.x,
      y: e.clientY - cropperPosition.y
    });
  };
  
  const handleDrag = (e) => {
    if (!isDragging) return;
    
    const video = videoRef.current;
    const videoRect = video.getBoundingClientRect();
    
    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;
    
    // Constrain cropper within video boundaries
    newX = Math.max(0, Math.min(newX, videoRect.width - cropperDimensions.width));
    newY = Math.max(0, Math.min(newY, videoRect.height - cropperDimensions.height));
    
    setCropperPosition({ x: newX, y: newY });
  };
  
  const endDrag = () => {
    setIsDragging(false);
  };
  
  // Change aspect ratio
  const changeAspectRatio = (ratio) => {
    setSelectedAspectRatio(ratio);
  };
  
  // Generate and download JSON data
  const downloadJSON = () => {
    const dataStr = JSON.stringify(recordedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'video-crop-data.json';
    link.click();
    
    URL.revokeObjectURL(url);
  };
  
  // Toggle recording state
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setRecordedData([]);
      setIsRecording(true);
    }
  };
  
  // Switch between editor and preview tabs
  const switchTab = (tab) => {
    setActiveTab(tab);
  };
  
  return (
    <div className="video-flip-editor">
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'editor' ? 'active' : ''}`}
          onClick={() => switchTab('editor')}
        >
          Editor
        </button>
        <button 
          className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => switchTab('preview')}
        >
          Preview
        </button>
      </div>
      
      {activeTab === 'editor' ? (
        <div className="editor-content">
          <div className="main-section">
            <div className="video-container" ref={containerRef}>
              <video 
                ref={videoRef}
                src="https://filesamples.com/samples/video/mp4/sample_960x540.mp4"
                onMouseMove={handleDrag}
                onMouseUp={endDrag}
                onMouseLeave={endDrag}
              />
              
              <div 
                className="cropper"
                ref={cropperRef}
                style={{
                  width: `${cropperDimensions.width}px`,
                  height: `${cropperDimensions.height}px`,
                  left: `${cropperPosition.x}px`,
                  top: `${cropperPosition.y}px`
                }}
                onMouseDown={startDrag}
              >
                <div className="cropper-grid">
                  <div className="grid-line horizontal"></div>
                  <div className="grid-line horizontal"></div>
                  <div className="grid-line vertical"></div>
                  <div className="grid-line vertical"></div>
                </div>
              </div>
              
              <div className="video-controls">
                <button className="play-button" onClick={togglePlay}>
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                
                <div className="timeline-container">
                  <span className="time-display">{formatTime(currentTime)}</span>
                  <input 
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={handleSeek}
                    className="timeline-slider"
                  />
                  <span className="time-display">{formatTime(duration)}</span>
                </div>
                
                <div className="volume-container">
                  <span className="volume-icon">🔊</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="volume-slider"
                  />
                </div>
                
                <div className="playback-rate-container">
                  <button 
                    className={`rate-button ${playbackRate === 0.5 ? 'active' : ''}`}
                    onClick={() => handlePlaybackRateChange(0.5)}
                  >
                    0.5x
                  </button>
                  <button 
                    className={`rate-button ${playbackRate === 1.0 ? 'active' : ''}`}
                    onClick={() => handlePlaybackRateChange(1.0)}
                  >
                    1x
                  </button>
                  <button 
                    className={`rate-button ${playbackRate === 1.5 ? 'active' : ''}`}
                    onClick={() => handlePlaybackRateChange(1.5)}
                  >
                    1.5x
                  </button>
                  <button 
                    className={`rate-button ${playbackRate === 2.0 ? 'active' : ''}`}
                    onClick={() => handlePlaybackRateChange(2.0)}
                  >
                    2x
                  </button>
                </div>
              </div>
            </div>
            
            <div className="preview-container">
              <h3>Preview</h3>
              <div className="canvas-container">
                <canvas ref={previewCanvasRef}></canvas>
              </div>
              
              <div className="aspect-ratio-selector">
                <h4>Aspect Ratio</h4>
                <div className="ratio-buttons">
                  {Object.keys(aspectRatios).map((ratio) => (
                    <button
                      key={ratio}
                      className={`ratio-button ${selectedAspectRatio === ratio ? 'active' : ''}`}
                      onClick={() => changeAspectRatio(ratio)}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="action-buttons">
                <button 
                  className={`record-button ${isRecording ? 'recording' : ''}`}
                  onClick={toggleRecording}
                >
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
                <button 
                  className="generate-button"
                  onClick={downloadJSON}
                  disabled={recordedData.length === 0}
                >
                  Generate Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="preview-mode">
          <h2>Recorded Session Preview</h2>
          <div className="preview-player">
            <p>This is where the recorded session would be played back using the recorded JSON coordinates.</p>
            <p>Data points: {recordedData.length}</p>
            <pre className="json-preview">
              {JSON.stringify(recordedData.slice(0, 2), null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoFlipEditor;