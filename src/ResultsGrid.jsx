import React from 'react';

export default function ResultsGrid({ rankings, movies }) {
  // Build an array of 10 slots, one for each rank 1-10
  const rankToMovie = Array(10).fill(null);
  Object.entries(rankings).forEach(([movieIdx, rank]) => {
    if (rank >= 1 && rank <= 10) {
      rankToMovie[rank - 1] = movies[Number(movieIdx)];
    }
  });

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gridTemplateRows: 'repeat(2, auto)',
        gap: 18,
        width: '100%',
        maxWidth: 1000,
        margin: '0 auto',
        boxSizing: 'border-box',
        justifyItems: 'center',
        alignItems: 'center',
      }}
    >
      {rankToMovie.map((movie, i) =>
        movie ? (
          <div key={movie.id} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 14,
            padding: 0,
            minHeight: 220,
            minWidth: 120,
            width: 140,
            margin: 8,
            // No background, no box shadow
          }}>
            <img
              src={movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : ''}
              alt={movie.title}
              style={{
                width: 120,
                height: 180,
                objectFit: 'cover',
                borderRadius: 8,
                marginBottom: 10,
                background: '#eee',
              }}
            />
            <div style={{
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
          <div key={`placeholder-${i + 1}`} style={{
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
  );
} 