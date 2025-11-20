import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          <Link to="/" className="title-link">
            <h1>Sikyon Survey Project</h1>
          </Link>
        </div>

        <nav className="header-nav">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/map"
            className={`nav-link ${location.pathname === '/map' ? 'active' : ''}`}
          >
            Map
          </Link>
          <Link
            to="/database"
            className={`nav-link ${location.pathname === '/database' ? 'active' : ''}`}
          >
            Query
          </Link>
          <Link
            to="/bibliography"
            className={`nav-link ${location.pathname === '/bibliography' ? 'active' : ''}`}
          >
            Bibliography
          </Link>
          <Link
            to="/data"
            className={`nav-link ${location.pathname === '/data' ? 'active' : ''}`}
          >
            Data
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
