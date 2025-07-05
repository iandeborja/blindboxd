import React from 'react';

export default function ResultsGrid({ rankings, movies }) {
  // Build an array of 10 slots, one for each rank 1-10
  const rankToMovie = Array(10).fill(null);
  Object.entries(rankings).forEach(([movieIdx, rank]) => {
    if (rank >= 1 && rank <= 10) {
      rankToMovie[rank - 1] = movies[Number(movieIdx)];
    }
  });

  // Responsive grid style
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gridTemplateRows: 'repeat(2, auto)',
    gap: 12,
    width: '100%',
    maxWidth: 1000,
    margin: '0 auto',
    boxSizing: 'border-box',
    justifyItems: 'center',
    alignItems: 'center',
    minHeight: 0,
  };

  return (
    <>
      <style>
        {`
          @media (max-width: 900px) {
            .results-grid {
              grid-template-columns: repeat(3, 1fr) !important;
              gap: 8px !important;
            }
          }
          @media (max-width: 600px) {
            .results-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 6px !important;
            }
            .results-grid .poster-img {
              width: 70px !important;
              height: 105px !important;
            }
          }
          @media (max-width: 400px) {
            .results-grid {
              grid-template-columns: 1fr !important;
              gap: 4px !important;
            }
            .results-grid .poster-img {
              width: 60px !important;
              height: 90px !important;
            }
          }
        `}
      </style>
      <div className="results-grid" style={gridStyle}>
        {rankToMovie.map((movie, i) =>
          movie ? (
            <div key={movie.id} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 14,
              padding: 0,
              minHeight: 0,
              minWidth: 60,
              width: 80,
              margin: 4,
            }}>
              <img
                className="poster-img"
                src={movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : ''}
                alt={movie.title}
                style={{
                  width: 90,
                  height: 135,
                  objectFit: 'cover',
                  borderRadius: 8,
                  marginBottom: 6,
                  background: '#eee',
                  transition: 'width 0.2s, height 0.2s',
                }}
              />
              <div style={{
                color: '#444',
                fontSize: 18,
                fontWeight: 800,
                textAlign: 'center',
                letterSpacing: 1,
              }}>
                {i + 1}
              </div>
            </div>
          ) : (
            <div key={`placeholder-${i + 1}`} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 0,
              minWidth: 60,
              width: 80,
              margin: 4,
              fontSize: 24,
              fontWeight: 800,
              color: '#bbb',
              background: '#f5f5f5',
              border: '2px dashed #bbb',
            }}>
              {i + 1}
            </div>
          )
        )}
      </div>
    </>
  );
} 