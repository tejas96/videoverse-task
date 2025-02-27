import React from 'react';
import VideoFlipEditorV2 from './components/app-container';
import VideoFlipEditorV1 from './VideoFlipEditor';
import './index.css';


function App() {
  const [activeTab, setActiveTab] = React.useState('v1');
  const toggleTab = () => {
    setActiveTab(activeTab === 'v1' ? 'v2' : 'v1');
  };
  const renderActiveTab = () => {
    return activeTab === 'v1' ? <VideoFlipEditorV1 /> : <VideoFlipEditorV2 />;
  };

    return (
      <div>
        <button onClick={toggleTab} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          {activeTab === 'v1' ? 'V2 Editor' : 'V1 Editor'}
        </button>
        <h1 className="text-2xl font-bold text-center mt-4"> 
          {activeTab === 'v1' ? 'App V1 Editor' : 'App V2 Editor'}
        </h1>
        {renderActiveTab()}
      </div>
    );
}

export default App;