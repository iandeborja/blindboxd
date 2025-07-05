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
    gridTemplateColumns: 'repeat(2, 1fr)', // 2 columns for mobile by default
    gridTemplateRows: 'repeat(5, auto)',
    gap: 8,
    width: '100%',
    maxWidth: 1000,
    margin: '0 auto',
    boxSizing: 'border-box',
    justifyItems: 'center',
    alignItems: 'center',
  };

  return (
    <>
      <style>
        {`
          @media (min-width: 601px) {
            .results-grid-mobile {
              grid-template-columns: repeat(5, 1fr) !important;
              grid-template-rows: repeat(2, auto) !important;
              gap: 18px !important;
            }
            .results-grid-mobile .poster-img {
              width: 120px !important;
              height: 180px !important;
              margin-bottom: 10px !important;
            }
            .results-grid-mobile .rank-number {
              font-size: 24px !important;
            }
          }
          @media (max-width: 600px) {
            .results-grid-mobile {
              grid-template-columns: repeat(2, 1fr) !important;
              grid-template-rows: repeat(5, auto) !important;
              gap: 4px !important;
              padding: 0 !important;
            }
            .results-grid-mobile .poster-img {
              width: 60px !important;
              height: 90px !important;
              margin-bottom: 2px !important;
            }
            .results-grid-mobile .rank-number {
              font-size: 14px !important;
              margin-top: 0 !important;
              margin-bottom: 0 !important;
            }
            .results-grid-mobile .result-cell {
              min-height: 0 !important;
              margin: 2px !important;
              padding: 0 !important;
            }
          }
        `}
      </style>
      <div className="results-grid-mobile" style={gridStyle}>
        {rankToMovie.map((movie, i) =>
          movie ? (
            <div className="result-cell" key={movie.id} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 14,
              padding: 0,
              minHeight: 220,
              minWidth: 120,
              width: 140,
              margin: 8,
            }}>
              <img
                className="poster-img"
                src={movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : ''}
                alt={movie.title}
                style={{
                  width: 120,
                  height: 180,
                  objectFit: 'cover',
                  borderRadius: 8,
                  marginBottom: 10,
                  background: '#eee',
                  transition: 'width 0.2s, height 0.2s',
                }}
              />
              <div className="rank-number" style={{
                color: '#444',
                fontSize: 24,
                fontWeight: 800,
                textAlign: 'center',
                letterSpacing: 1,
              }}>
                {i + 1}
              </div>
            </div>
          ) : (
            <div className="result-cell" key={`placeholder-${i + 1}`} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 220,
              minWidth: 120,
              width: 140,
              margin: 8,
              fontSize: 32,
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