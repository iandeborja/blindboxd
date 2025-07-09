import React, { useState } from 'react';

const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi'];
const decades = ['2020s', '2010s', '2000s', '1990s', '1980s', '1970s', '1960s'];
const oscarDecades = ['2020s', '2010s', '2000s', '1990s', '1980s', '1970s', '1960s'];
const podcasts = [
  { label: 'The Rewatchables', type: 'podcast', value: 'rewatchables', group: 'Podcasts' },
  { label: 'Blank Check', type: 'podcast', value: 'blankslate', group: 'Podcasts' },
  { label: '70mm', type: 'podcast', value: 'seventymm', group: 'Podcasts' },
  { label: 'Escape Hatch', type: 'podcast', value: 'escapehatch', group: 'Podcasts' },
];

export default function CategorySelection({ onCategorySelect, difficulty, onDifficultyChange }) {
  // Build a unified list of options with group labels
  const options = [
    { label: 'The GOATs', type: 'greatest', value: 'alltime', group: 'The GOATs' },
    ...decades.map((d) => ({ label: d, type: 'decade', value: d, group: 'Decades' })),
    ...oscarDecades.map((d) => ({ label: d, type: 'oscar', value: d, group: 'Oscar Winners' })),
    ...genres.map((g) => ({ label: g, type: 'genre', value: g, group: 'Genres' })),
    ...podcasts,
  ];

  const sectionOrder = ['The Greatest of All Time', 'Decades', 'Oscar Winners', 'Genres', 'Podcasts'];
  const [expandedSection, setExpandedSection] = useState('The Greatest of All Time');

  // Category descriptors
  const categoryDescriptors = {
    'The Greatest of All Time': "Every title on Letterboxd's Top 250 Narrative Films, IMDb's Top 250 Movies, and The New York Times' 100 Best Movies of the 21st Century lists.",
    'Decades': "Everyone says the 1970s was the best decade for cinema until they're forced to rank 'Jaws 2'.",
    'Oscar Winners': "Movies that thanked The Academy.",
    'Genres': "Admit it. It feels good to put 'Armageddon' ahead of 'Dune'.",
    'Podcasts': "Just like you've always wanted: The ability to blind rank movies that were talked about by your favorite podcasts that talk about movies."
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      fontFamily: 'Inter, Arial, Helvetica, sans-serif',
      color: '#111',
      padding: 0,
    }}>
      <nav style={{
        width: '100%',
        borderBottom: 'none',
        padding: '32px 0 0 0',
        marginBottom: 0,
        textAlign: 'left',
        maxWidth: 900,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        <span style={{
          fontWeight: 900,
          fontSize: 48,
          textTransform: 'uppercase',
          letterSpacing: -2,
          display: 'block',
        }}>
          BLINDBOXD
        </span>
        <span style={{
          fontSize: 22,
          color: '#444',
          fontWeight: 400,
          marginTop: 8,
          display: 'block',
        }}>
          Pick a category. Make a Top 10 List without knowing the movies.
        </span>
        <div style={{
        }}>
          <div style={{
          }}>
          </div>
        </div>
      </nav>
      <main style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '0 8px',
        marginTop: 24,
        textAlign: 'left',
      }}>
        <style>
          {`
            .category-tabs {
              display: flex;
              gap: 18px;
              margin-bottom: 18px;
              border-bottom: 2px solid #eee;
            }
            .category-tab {
              font-size: 20px;
              font-weight: 800;
              color: #888;
              background: none;
              border: none;
              border-bottom: 3px solid transparent;
              padding: 8px 0 10px 0;
              cursor: pointer;
              transition: color 0.2s, border-bottom 0.2s;
              outline: none;
            }
            .category-tab.selected {
              color: #111;
              border-bottom: 3px solid #111;
            }
            .category-grid {
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 16px;
              margin-bottom: 0;
            }
            @media (max-width: 900px) {
              .category-grid {
                grid-template-columns: repeat(3, 1fr);
              }
            }
            @media (max-width: 600px) {
              .category-grid {
                grid-template-columns: repeat(2, 1fr);
              }
            }
            @media (max-width: 400px) {
              .category-grid {
                grid-template-columns: 1fr;
              }
            }
            .category-label {
              grid-column: 1 / -1;
              font-size: 18px;
              font-weight: 700;
              margin: 8px 0 0 0;
              color: #888;
              letter-spacing: 1px;
              text-transform: uppercase;
              background: #fff;
              padding: 0;
            }
            .goat-desc {
              font-size: 13px;
              color: #666;
              font-weight: 400;
              margin-top: 2px;
              margin-bottom: 10px;
              line-height: 1.5;
              letter-spacing: 0;
              text-align: left;
              background: #fff;
            }
          `}
        </style>
        {/* Collapsible Sections */}
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {sectionOrder.map(section => {
            // Map display section to internal group name for logic and filtering
            const groupName = section === 'The Greatest of All Time' ? 'The GOATs' : section;
            return (
              <div key={section} style={{ marginBottom: 8 }}>
                <button
                  onClick={() => setExpandedSection(expandedSection === section ? null : section)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    fontWeight: 900,
                    fontSize: 24,
                    letterSpacing: -1,
                    background: '#fff',
                    border: 'none',
                    borderBottom: expandedSection === section ? '3px solid #111' : '1.5px solid #eee',
                    color: expandedSection === section ? '#111' : '#888',
                    padding: '16px 0 10px 0',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'color 0.2s, border-bottom 0.2s',
                  }}
                  aria-expanded={expandedSection === section}
                >
                  {section}
                  <span style={{ float: 'right', fontWeight: 400, fontSize: 18, color: '#bbb', marginRight: 8 }}>
                    {expandedSection === section ? '▲' : '▼'}
                  </span>
                </button>
                {expandedSection === section && (
                  <div style={{ padding: '0 0 18px 0' }}>
                    {categoryDescriptors[section] && (
                      <div className="goat-desc" style={{ marginTop: 2, marginBottom: 10 }}>
                        {categoryDescriptors[section]}
                      </div>
                    )}
                    <div className="category-grid">
                      {options.filter(opt => opt.group === groupName).map(opt => (
                        <button
                          key={opt.type + '-' + opt.value}
                          style={{
                            padding: '24px 0',
                            fontSize: 22,
                            fontWeight: 800,
                            border: '2px solid #111',
                            background: '#fff',
                            color: '#111',
                            letterSpacing: 1,
                            cursor: 'pointer',
                            transition: 'background 0.2s, color 0.2s',
                            outline: 'none',
                            borderRadius: 8,
                            marginBottom: 0,
                          }}
                          onMouseOver={e => {
                            e.currentTarget.style.background = '#111';
                            e.currentTarget.style.color = '#fff';
                          }}
                          onMouseOut={e => {
                            e.currentTarget.style.background = '#fff';
                            e.currentTarget.style.color = '#111';
                          }}
                          onClick={() => onCategorySelect({ type: opt.type, value: opt.value })}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
} 