import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import MapPage from './pages/MapPage';
import DatabaseView from './pages/DatabaseView';
import BibliographyPage from './pages/BibliographyPage';
import DataPage from './pages/DataPage';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/database" element={<DatabaseView />} />
          <Route path="/bibliography" element={<BibliographyPage />} />
          <Route path="/data" element={<DataPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
