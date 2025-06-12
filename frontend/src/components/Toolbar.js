import React from 'react';

export default function Toolbar({ selectedTool, setSelectedTool, showAnnotations, setShowAnnotations }) {
  return (
    <div className="toolbar">
      <button onClick={() => setSelectedTool('line')} className={selectedTool === 'line' ? 'active' : ''}>Line</button>
      <button onClick={() => setSelectedTool('rectangle')} className={selectedTool === 'rectangle' ? 'active' : ''}>Rectangle</button>
      <button onClick={() => setSelectedTool('circle')} className={selectedTool === 'circle' ? 'active' : ''}>Circle</button>
      <button onClick={() => setSelectedTool('select')} className={selectedTool === 'select' ? 'active' : ''}>Select</button>
      <button onClick={() => setShowAnnotations(!showAnnotations)}>
        {showAnnotations ? 'Hide Annotations' : 'Show Annotations'}
      </button>
    </div>
  );
}