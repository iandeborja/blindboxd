import React from 'react';
import html2canvas from 'html2canvas';

export default function ResultsGrid({ rankings, movies, selectedCategory }) {
  // Build an array of 10 slots, one for each rank 1-10
  const rankToMovie = Array(10).fill(null);
  Object.entries(rankings).forEach(([movieIdx, rank]) => {
    if (rank >= 1 && rank <= 10) {
      rankToMovie[rank - 1] = movies[Number(movieIdx)];
    }
  });

  const copyImage = async () => {
    const element = document.getElementById('results-grid-container');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        width: element.offsetWidth,
        height: element.offsetHeight,
      });

      if (navigator.clipboard && window.ClipboardItem) {
        canvas.toBlob(async (blob) => {
          try {
            await navigator.clipboard.write([
              new window.ClipboardItem({ 'image/png': blob })
            ]);
            alert('Image copied to clipboard!');
          } catch (err) {
            // fallback to download
            const link = document.createElement('a');
            link.download = `blindboxd-${selectedCategory?.type || 'ranking'}-${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
          }
        }, 'image/png');
      } else {
        // fallback to download
        const link = document.createElement('a');
        link.download = `blindboxd-${selectedCategory?.type || 'ranking'}-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    } catch (error) {
      console.error('Error copying image:', error);
    }
  };

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
              grid-template-columns: repeat(5, 1fr) !important;
              grid-template-rows: repeat(2, auto) !important;
              gap: 4px !important;
              padding: 0 !important;
            }
            .results-grid-mobile .poster-img {
              width: 48px !important;
              height: 72px !important;
              margin-bottom: 2px !important;
            }
            .results-grid-mobile .rank-number {
              font-size: 13px !important;
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
      <div id="results-grid-container" style={{
        background: '#fff',
        padding: '18px 8px 16px 8px',
        borderRadius: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        marginBottom: '10px',
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '12px',
        }}>
          <h1 style={{
            fontSize: '22px',
            fontWeight: '900',
            color: '#111',
            margin: '0 0 2px 0',
            letterSpacing: '2px',
          }}>
            BLINDBOXD
          </h1>
          <p style={{
            fontSize: '13px',
            color: '#666',
            margin: '0',
            fontWeight: '500',
          }}>
            {selectedCategory?.type === 'greatest'
              ? 'The Greatest Films of All Time'
              : selectedCategory?.type === 'genre' 
              ? selectedCategory.value 
              : selectedCategory?.type === 'decade' 
              ? selectedCategory.value 
              : selectedCategory?.type === 'oscar' 
              ? `Oscar Winners: ${selectedCategory.value}`
              : 'Movie Ranking'}
          </p>
        </div>
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
                minWidth: 70,
                width: 70,
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
      </div>
      <button
        onClick={copyImage}
        style={{
          padding: '8px 18px',
          fontSize: '15px',
          fontWeight: '600',
          borderRadius: '7px',
          border: '2px solid #111',
          background: '#fff',
          color: '#111',
          cursor: 'pointer',
          transition: 'all 0.2s',
          marginTop: '8px',
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#111';
          e.target.style.color = '#fff';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = '#fff';
          e.target.style.color = '#111';
        }}
      >
        📋 Copy Image
      </button>
    </>
  );
} 