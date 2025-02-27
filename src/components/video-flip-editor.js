import React, { useState } from 'react';
import VideoPlayer from './video-player';
import VideoControls from './video-controls';
import CropperControls from './cropper-controls';
import PreviewPanel from './preview-panel';
import SessionControls from './session-controls';

const VideoFlipEditor = () => {
  const [videoState, setVideoState] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 900, // 15:00 in seconds
    volume: 0.5,
    playbackRate: 1,
    isMuted: false
  });

  const [cropperState, setCropperState] = useState({
    isActive: false,
    aspectRatio: '9:16',
    position: { x: 0, y: 0 },
    dimensions: { width: 0, height: 0 },
  });

  const [recordedData, setRecordedData] = useState([]);
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' or 'preview'

  const toggleCropper = () => {
    setCropperState({
      ...cropperState,
      isActive: !cropperState.isActive
    });
  };

  const handleAspectRatioChange = (ratio) => {
    setCropperState({
      ...cropperState,
      aspectRatio: ratio
    });
  };

  const handlePlaybackChange = (rate) => {
    setVideoState({
      ...videoState,
      playbackRate: rate
    });
  };

  const togglePlay = () => {
    setVideoState({
      ...videoState,
      isPlaying: !videoState.isPlaying
    });
  };

  const handleTimeUpdate = (time) => {
    setVideoState({
      ...videoState,
      currentTime: time
    });
  };

  const handleVolumeChange = (volume) => {
    setVideoState({
      ...videoState,
      volume: volume,
      isMuted: volume === 0
    });
  };

  const toggleMute = () => {
    setVideoState({
      ...videoState,
      isMuted: !videoState.isMuted,
      volume: videoState.isMuted ? 0.5 : 0
    });
  };

  const generatePreview = () => {
    const newData = {
      timeStamp: videoState.currentTime,
      coordinates: [
        cropperState.position.x,
        cropperState.position.y,
        cropperState.dimensions.width,
        cropperState.dimensions.height
      ],
      volume: videoState.volume,
      playbackRate: videoState.playbackRate
    };
    
    setRecordedData([...recordedData, newData]);
  };

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

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden shadow-xl">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Cropper</h2>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'preview' 
                  ? 'bg-gray-700 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Preview Session
            </button>
            <button 
              onClick={() => setActiveTab('generate')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'generate' 
                  ? 'bg-gray-700 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Generate Session
            </button>
          </div>
        </div>
        
        <div className="flex space-x-6">
          <div className="w-3/5">
            <div className="relative">
              <VideoPlayer 
                isPlaying={videoState.isPlaying}
                currentTime={videoState.currentTime}
                playbackRate={videoState.playbackRate}
                isMuted={videoState.isMuted}
                volume={videoState.volume}
                cropperState={cropperState}
                setCropperState={setCropperState}
                onTimeUpdate={handleTimeUpdate}
              />
              
              <VideoControls 
                currentTime={videoState.currentTime}
                duration={videoState.duration}
                isPlaying={videoState.isPlaying}
                isMuted={videoState.isMuted}
                volume={videoState.volume}
                onPlay={togglePlay}
                onTimeChange={handleTimeUpdate}
                onVolumeChange={handleVolumeChange}
                onMuteToggle={toggleMute}
              />
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <CropperControls 
                playbackRate={videoState.playbackRate}
                aspectRatio={cropperState.aspectRatio}
                onPlaybackChange={handlePlaybackChange}
                onAspectRatioChange={handleAspectRatioChange}
              />
            </div>
          </div>
          
          <div className="w-2/5">
            <PreviewPanel 
              cropperState={cropperState}
              isActive={cropperState.isActive}
            />
          </div>
        </div>
      </div>
      
      <SessionControls 
        cropperActive={cropperState.isActive}
        onToggleCropper={toggleCropper}
        onGeneratePreview={generatePreview}
        onDownloadJSON={downloadJSON}
      />
    </div>
  );
};

export default VideoFlipEditor;
