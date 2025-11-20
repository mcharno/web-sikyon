import React from 'react';
import '../styles/BibliographyPage.css';

const BibliographyPage = () => {
  // Sample bibliography entries - these should be replaced with actual publications
  const publications = [
    {
      id: 1,
      authors: 'Author, A., Author, B.',
      year: 2020,
      title: 'Archaeological Survey at Sikyon: Methods and Preliminary Results',
      publication: 'Journal of Archaeological Science',
      volume: '45',
      pages: '123-145',
      doi: '10.1000/example.doi.001',
      type: 'article'
    },
    {
      id: 2,
      authors: 'Editor, C. (ed.)',
      year: 2019,
      title: 'The Sikyon Survey Project: Final Report',
      publication: 'Archaeological Reports Series',
      volume: '12',
      publisher: 'University Press',
      type: 'book'
    },
    {
      id: 3,
      authors: 'Author, D., Author, E., Author, F.',
      year: 2018,
      title: 'Pottery Distribution Patterns in the Sikyon Survey Area',
      publication: 'Annual of the British School at Athens',
      volume: '113',
      pages: '234-267',
      doi: '10.1000/example.doi.002',
      type: 'article'
    },
    {
      id: 4,
      authors: 'Author, G.',
      year: 2017,
      title: 'Geophysical Survey Results from Sikyon',
      publication: 'In: C. Editor (ed.), Archaeological Geophysics in Greece',
      pages: '89-112',
      publisher: 'Academic Press',
      type: 'chapter'
    },
    {
      id: 5,
      authors: 'Author, H., Author, I.',
      year: 2016,
      title: 'Numismatic Evidence from the Sikyon Survey',
      publication: 'Numismatic Chronicle',
      volume: '176',
      pages: '45-78',
      type: 'article'
    }
  ];

  const formatCitation = (pub) => {
    let citation = `${pub.authors} (${pub.year}). "${pub.title}." `;

    if (pub.type === 'article' || pub.type === 'chapter') {
      citation += `${pub.publication}`;
      if (pub.volume) citation += ` ${pub.volume}`;
      if (pub.pages) citation += `: ${pub.pages}`;
    } else if (pub.type === 'book') {
      citation += `${pub.publication}`;
      if (pub.volume) citation += ` ${pub.volume}`;
      if (pub.publisher) citation += `. ${pub.publisher}`;
    }

    citation += '.';
    return citation;
  };

  return (
    <div className="bibliography-page">
      <div className="bibliography-hero">
        <h1>Bibliography</h1>
        <p>Publications and research from the Sikyon Survey Project</p>
      </div>

      <div className="bibliography-container">
        <section className="bibliography-section">
          <h2>Project Publications</h2>
          <p>
            The following publications present research findings, methodologies, and data
            from the Sikyon Survey Project. For more information about any publication,
            please refer to the DOI link where available.
          </p>
        </section>

        <section className="bibliography-section">
          <div className="publications-list">
            {publications.map(pub => (
              <div key={pub.id} className="publication-item">
                <div className="publication-content">
                  <div className="publication-citation">
                    {formatCitation(pub)}
                  </div>
                  {pub.doi && (
                    <div className="publication-links">
                      <a
                        href={`https://doi.org/${pub.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="doi-link"
                      >
                        DOI: {pub.doi}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bibliography-section">
          <h2>Data Citation</h2>
          <p>
            If you use data from the Sikyon Survey Project in your research, please cite
            the dataset as follows:
          </p>
          <div className="citation-box">
            Sikyon Survey Project. (2017). Sikyon Survey Project Dataset.
            Zenodo. <a href="https://doi.org/10.5281/zenodo.1054450" target="_blank" rel="noopener noreferrer">
              https://doi.org/10.5281/zenodo.1054450
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BibliographyPage;
