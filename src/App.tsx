// src/App.tsx
import React from 'react';
import './index.css';
import PhotoCollage from './components/PhotoCollage';

const App: React.FC = () => {
  return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <PhotoCollage />
      </div>
  );
};

export default App;
