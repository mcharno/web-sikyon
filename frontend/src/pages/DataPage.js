import React from 'react';
import '../styles/DataPage.css';

const DataPage = () => {
  return (
    <div className="data-page">
      <div className="data-header">
        <h1>Archaeological Data</h1>
        <p>Comprehensive dataset from the Sikyon Survey Project with GIS files, databases, and documentation</p>
      </div>

      <div className="data-container">
        <section className="data-section">
          <h2>About the Dataset</h2>
          <p>
            The Sikyon Survey Project dataset is a comprehensive collection of archaeological survey data
            from the ancient Greek city of Sikyon in the northeastern Peloponnese. The dataset includes
            spatial data, artifact inventories, photographic documentation, and detailed metadata spanning
            multiple historical periods from the Archaic through Byzantine eras.
          </p>
          <p>
            This open-access dataset was published on Zenodo in 2017 and is freely available for research,
            education, and reuse under the Creative Commons Attribution 4.0 International license.
          </p>
        </section>

        <section className="data-section">
          <h2>Dataset Contents</h2>
          <div className="dataset-contents-grid">
            <div className="content-item">
              <h3>GIS Shapefiles</h3>
              <p>Spatial data for archaeological features including:</p>
              <ul>
                <li>Survey tracts and excavation squares</li>
                <li>Architectural features and building remains</li>
                <li>Pottery distribution points</li>
                <li>Numismatic find locations</li>
                <li>Geophysical survey results</li>
              </ul>
            </div>
            <div className="content-item">
              <h3>Database Files</h3>
              <p>Structured data tables containing:</p>
              <ul>
                <li>Artifact catalogs (pottery, coins, small finds)</li>
                <li>Feature descriptions and classifications</li>
                <li>Chronological attributions</li>
                <li>Photographic references</li>
                <li>Bibliographic citations</li>
              </ul>
            </div>
            <div className="content-item">
              <h3>Documentation</h3>
              <p>Supporting materials including:</p>
              <ul>
                <li>Data dictionary and field descriptions</li>
                <li>Survey methodology documentation</li>
                <li>Coordinate system information (Greek Grid EPSG:2100)</li>
                <li>Data collection protocols</li>
                <li>Quality control procedures</li>
              </ul>
            </div>
            <div className="content-item">
              <h3>Photographs</h3>
              <p>Digital images documenting:</p>
              <ul>
                <li>Archaeological features in situ</li>
                <li>Artifact photography</li>
                <li>Survey area landscapes</li>
                <li>Excavation contexts</li>
                <li>Comparative material</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="data-section">
          <h2>Download the Data</h2>
          <p>
            The complete Sikyon Survey Project dataset is archived on Zenodo, a research data repository
            operated by CERN. The dataset is permanently preserved with a DOI (Digital Object Identifier)
            for persistent citation and access.
          </p>
          <div className="download-info">
            <div className="download-details">
              <h4>Dataset Information</h4>
              <dl className="info-list">
                <dt>Title:</dt>
                <dd>Sikyon Survey Project Dataset</dd>
                <dt>DOI:</dt>
                <dd>10.5281/zenodo.1054450</dd>
                <dt>Published:</dt>
                <dd>2017</dd>
                <dt>License:</dt>
                <dd>CC BY 4.0</dd>
                <dt>Format:</dt>
                <dd>Shapefiles, CSV, JPEG, PDF</dd>
                <dt>Size:</dt>
                <dd>~250 MB</dd>
              </dl>
            </div>
            <div className="download-actions">
              <a
                href="https://zenodo.org/records/1054450"
                target="_blank"
                rel="noopener noreferrer"
                className="download-button primary"
              >
                View on Zenodo
              </a>
              <a
                href="https://zenodo.org/records/1054450/files/sikyon-dataset.zip"
                target="_blank"
                rel="noopener noreferrer"
                className="download-button secondary"
              >
                Download Dataset
              </a>
            </div>
          </div>
        </section>

        <section className="data-section">
          <h2>Working with the Data</h2>
          <p>
            The Sikyon dataset can be integrated into various GIS and database applications for analysis,
            visualization, and further research. Here's how to get started working with the data on your
            own system.
          </p>

          <div className="work-section">
            <h3>GIS Software</h3>
            <p>
              The shapefiles can be opened directly in GIS applications such as:
            </p>
            <ul>
              <li><strong>QGIS</strong> (free, open-source) - Recommended for most users</li>
              <li><strong>ArcGIS</strong> - Professional GIS platform</li>
              <li><strong>MapInfo</strong> - Alternative commercial option</li>
            </ul>
            <p>
              <strong>Important:</strong> The spatial data uses the Greek Grid coordinate system (EPSG:2100).
              You may need to reproject to WGS84 (EPSG:4326) for web mapping applications.
            </p>
          </div>

          <div className="work-section">
            <h3>Database Applications</h3>
            <p>
              The CSV database files can be imported into:
            </p>
            <ul>
              <li><strong>Excel/LibreOffice Calc</strong> - For basic viewing and filtering</li>
              <li><strong>Access/Base</strong> - For relational database management</li>
              <li><strong>PostgreSQL/MySQL</strong> - For advanced querying and integration</li>
              <li><strong>R/Python</strong> - For statistical analysis and visualization</li>
            </ul>
          </div>

          <div className="work-section">
            <h3>Web Development</h3>
            <p>
              This web application serves as an example of how to present the data online. The source code
              demonstrates:
            </p>
            <ul>
              <li>Converting shapefiles to GeoJSON for web mapping</li>
              <li>Coordinate transformation using proj4js</li>
              <li>Interactive mapping with MapLibre GL JS</li>
              <li>Searchable database interface with React</li>
              <li>Media integration (images and PDFs)</li>
            </ul>
          </div>
        </section>

        <section className="data-section">
          <h2>Citation and Reuse</h2>
          <p>
            The Sikyon Survey Project dataset is published under the Creative Commons Attribution 4.0
            International license (CC BY 4.0). You are free to share, adapt, and build upon this data
            for any purpose, including commercial use, as long as you provide appropriate attribution.
          </p>

          <div className="citation-block">
            <h4>How to Cite</h4>
            <p>When using this dataset in your research or applications, please cite as:</p>
            <div className="citation-box">
              Sikyon Survey Project. (2017). Sikyon Survey Project Dataset [Data set]. Zenodo.
              <a href="https://doi.org/10.5281/zenodo.1054450" target="_blank" rel="noopener noreferrer">
                https://doi.org/10.5281/zenodo.1054450
              </a>
            </div>
          </div>

          <div className="reuse-examples">
            <h4>Potential Uses</h4>
            <p>The dataset can support various research and educational applications:</p>
            <ul>
              <li>Comparative archaeological studies of Greek cities</li>
              <li>Spatial analysis of artifact distribution patterns</li>
              <li>Chronological modeling of settlement development</li>
              <li>GIS training and methodology courses</li>
              <li>Development of archaeological databases and web portals</li>
              <li>Integration with other regional survey datasets</li>
            </ul>
          </div>
        </section>

        <section className="data-section">
          <h2>Questions and Support</h2>
          <p>
            For questions about the dataset, data interpretation, or technical issues, please refer to
            the documentation included in the download package. For additional inquiries, you may contact
            the project team through the information provided on Zenodo.
          </p>
        </section>
      </div>
    </div>
  );
};

export default DataPage;
