import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <div className="landing-hero">
        <div className="hero-content">
          <h1 className="hero-title">The Sikyon Survey Project</h1>
          <p className="hero-subtitle">
            Exploring the Ancient Greek City of Sikyon Through Archaeological Survey
          </p>
        </div>
      </div>

      <div className="landing-container">
        <section className="landing-section">
          <h2>About the Project</h2>
          <p>
            The Sikyon Survey Project is a comprehensive archaeological survey of the ancient Greek
            city of Sikyon, located in the northeastern Peloponnese. This web application provides
            access to the survey's archaeological data, including pottery finds, architectural features,
            numismatic evidence, and geophysical survey results.
          </p>
          <p>
            Sikyon was one of the most important city-states in ancient Greece, known for its artists,
            craftsmen, and political influence. The survey data spans multiple historical periods from
            the Archaic through Byzantine eras, offering insights into the city's long history of
            occupation and development.
          </p>
        </section>

        <section className="landing-section">
          <h2>Explore the Data</h2>
          <div className="explore-grid">
            <Link to="/map" className="explore-card">
              <div className="card-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <h3>Interactive Map</h3>
              <p>
                Explore archaeological features spatially on an interactive map.
                Toggle layers, filter data, and click on features for detailed information.
              </p>
            </Link>

            <Link to="/database" className="explore-card">
              <div className="card-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                </svg>
              </div>
              <h3>Database Query</h3>
              <p>
                Search and filter the complete database of archaeological finds.
                Export results as CSV or visualize them on the map.
              </p>
            </Link>
          </div>
        </section>

        <section className="landing-section">
          <h2>Data Categories</h2>
          <div className="categories-grid">
            <div className="category-item">
              <h4>Pottery</h4>
              <p>Ceramic artifacts including fine wares, coarse wares, cooking vessels, and storage containers from various periods.</p>
            </div>
            <div className="category-item">
              <h4>Architecture</h4>
              <p>Architectural features including building foundations, city walls, roads, and other structural remains.</p>
            </div>
            <div className="category-item">
              <h4>Coins</h4>
              <p>Numismatic finds spanning from Classical Greek to Byzantine periods, providing chronological markers.</p>
            </div>
            <div className="category-item">
              <h4>Survey Data</h4>
              <p>Geophysical survey results, survey tracts, excavation squares, and topographical features.</p>
            </div>
          </div>
        </section>

        <section className="landing-section">
          <h2>Data Source</h2>
          <p>
            The archaeological data presented in this application is based on the Sikyon Survey Project
            dataset published on Zenodo. The complete dataset includes GIS shapefiles, database files,
            photographs, and documentation.
          </p>
          <div className="data-links">
            <a
              href="https://zenodo.org/records/1054450"
              target="_blank"
              rel="noopener noreferrer"
              className="data-link-button"
            >
              View Original Dataset on Zenodo
            </a>
          </div>
        </section>

        <section className="landing-section credits">
          <h2>Credits</h2>
          <p>
            Data from the Sikyon Survey Project. This web application was created to provide
            interactive access to the published archaeological survey data.
          </p>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
