import React from 'react';
import '../styles/Header.css';

const Header = ({ toggleSidebar }) => {
  return (
    <header className="header">
      <div className="header-content">
        <button className="menu-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div className="header-title">
          <h1>Sikyon Survey Project</h1>
          <p className="subtitle">Archaeological Data Visualization</p>
        </div>

        <div className="header-info">
          <a
            href="https://zenodo.org/records/1054450"
            target="_blank"
            rel="noopener noreferrer"
            className="data-source-link"
          >
            Data Source
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
