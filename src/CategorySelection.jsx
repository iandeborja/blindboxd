import React from 'react';

const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi'];
const decades = ['1980s', '1990s', '2000s', '2010s', '2020s'];
const oscarDecades = ['1980s', '1990s', '2000s', '2010s', '2020s'];

export default function CategorySelection({ onCategorySelect }) {
  // Build a unified list of options with group labels
  const options = [
    ...genres.map((g) => ({ label: g, type: 'genre', value: g, group: 'Genres' })),
    ...decades.map((d) => ({ label: d, type: 'decade', value: d, group: 'Decades' })),
    ...oscarDecades.map((d) => ({ label: d, type: 'oscar', value: d, group: 'Oscar Winners' })),
  ];

  // For section labels in the grid
  const groupOrder = ['Genres', 'Decades', 'Oscar Winners'];

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
      </nav>
      <main style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '0 8px',
        marginTop: 10,
        textAlign: 'left',
      }}>
        <style>
          {`
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
          `}
        </style>
        <div className="category-grid">
          {groupOrder.map((group) => [
            <div className="category-label" key={group}>{group}</div>,
            ...options.filter((opt) => opt.group === group).map((opt) => (
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
            ))
          ])}
        </div>
      </main>
    </div>
  );
} 