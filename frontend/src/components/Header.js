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
            Database
          </Link>
          <a
            href="https://zenodo.org/records/1054450"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link external"
          >
            Data Source
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
