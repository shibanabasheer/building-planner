import React, { useState } from 'react';
import DrawingCanvas from './components/DrawingCanvas';
import Toolbar from './components/Toolbar';
import './App.css';

function App() {
  const [selectedTool, setSelectedTool] = useState('line');
  const [showAnnotations, setShowAnnotations] = useState(true);

  return (
    <div className="app">
      <Toolbar
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        showAnnotations={showAnnotations}
        setShowAnnotations={setShowAnnotations}
      />
      <DrawingCanvas selectedTool={selectedTool} showAnnotations={showAnnotations} />
    </div>
  );
}

export default App;