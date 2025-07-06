import React, { useState } from 'react';
import CategorySelection from './CategorySelection';
import { fetchRandomMovies } from './api';
import ResultsGrid from './ResultsGrid';

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rankings, setRankings] = useState({});
  const [hoveredSlot, setHoveredSlot] = useState(null);

  // Fetch movies when category is selected
  React.useEffect(() => {
    if (!selectedCategory) return;
    setLoading(true);
    setError(null);
    fetchRandomMovies(selectedCategory)
      .then((results) => {
        setMovies(results);
        setCurrentIndex(0);
      })
      .catch((err) => setError('Failed to fetch movies.'))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  function handleRank(rank) {
    setRankings((prev) => ({ ...prev, [currentIndex]: rank }));
    setTimeout(() => {
      setCurrentIndex((idx) => idx + 1);
    }, 300); // Small delay for UX
  }

  function getUsedRanks() {
    return Object.values(rankings);
  }

  function getRankedMovies() {
    // Return movies sorted by assigned rank (1 is highest)
    return Object.entries(rankings)
      .map(([idx, rank]) => ({ ...movies[Number(idx)], rank }))
      .sort((a, b) => a.rank - b.rank);
  }

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 1000, margin: '0 auto' }}>
      {!selectedCategory ? (
        <CategorySelection onCategorySelect={setSelectedCategory} />
      ) : loading ? (
        <p>Loading movies...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : movies.length > 0 && currentIndex < movies.length ? (
        <div>
          <style>
            {`
              .vote-flex {
                display: flex;
                flex-direction: row;
                align-items: flex-start;
                justify-content: center;
                gap: 32px;
                width: 100%;
                max-width: 900px;
                margin: 0 auto;
                padding: 0 8px;
              }
              .vote-poster-col {
                flex: 1 1 320px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
              }
              .vote-poster-img {
                width: 320px;
                max-width: 80vw;
                height: auto;
                border-radius: 18px;
                box-shadow: 0 4px 24px rgba(0,0,0,0.10);
                margin-bottom: 0;
              }
              .vote-rank-col {
                flex: 1 1 320px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                min-width: 220px;
              }
              .vote-instructions {
                font-size: 20px;
                font-weight: 700;
                color: #111;
                margin-bottom: 18px;
                text-align: center;
                line-height: 1.3;
              }
              .vote-rank-slots {
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 12px;
                align-items: stretch;
              }
              .vote-rank-slot {
                border: 2px solid #111;
                border-radius: 1px;
                background: #fff;
                font-size: 18px;
                font-weight: 700;
                color: #111;
                padding: 6px 0;
                text-align: center;
                cursor: pointer;
                transition: background 0.2s, color 0.2s;
                outline: none;
                margin: 0;
                min-width: 0;
                min-height: 0;
                user-select: none;
              }
              .vote-rank-slot.filled {
                background: #111;
                color: #fff;
                cursor: default;
              }
              .vote-rank-slot:disabled {
                background: #eee;
                color: #aaa;
                cursor: not-allowed;
              }
              .vote-rank-slot.preview {
                background: #f5f5f5;
                color: #111;
                font-style: italic;
              }
              @media (max-width: 900px) {
                .vote-flex {
                  flex-direction: column;
                  align-items: center;
                  gap: 18px;
                }
                .vote-poster-img {
                  width: 220px;
                  max-width: 90vw;
                }
                .vote-rank-col {
                  min-width: 0;
                  width: 100%;
                }
              }
            `}
          </style>
          <div className="vote-instructions">
            Make your BLINDBOXD {selectedCategory.type === 'genre' ? selectedCategory.value : selectedCategory.type === 'decade' ? selectedCategory.value : selectedCategory.type === 'oscar' ? `Oscar Winners: ${selectedCategory.value}` : ''} Top 10.<br/>
            <span style={{ fontWeight: 400, fontSize: 18 }}>&quot;You must choose... but choose wisely.&quot;</span>
          </div>
          <div className="vote-flex">
            <div className="vote-poster-col">
              <img
                className="vote-poster-img"
                src={movies[currentIndex].poster_path ? `https://image.tmdb.org/t/p/w500${movies[currentIndex].poster_path}` : ''}
                alt={movies[currentIndex].title}
              />
            </div>
            <div className="vote-rank-col">
              <div className="vote-rank-slots">
                {[...Array(10)].map((_, i) => {
                  const slotRank = i + 1;
                  // Find which movie (if any) is assigned to this slot
                  const assignedIdx = Object.entries(rankings).find(([idx, rank]) => rank === slotRank);
                  const isFilled = assignedIdx !== undefined && assignedIdx !== null;
                  const isCurrent = !isFilled && currentIndex < movies.length;
                  const isPreview = hoveredSlot === slotRank && !isFilled && isCurrent;
                  return (
                    <button
                      key={slotRank}
                      className={`vote-rank-slot${isFilled ? ' filled' : ''}${isPreview ? ' preview' : ''}`}
                      disabled={isFilled || !isCurrent}
                      onClick={() => {
                        if (!isFilled && isCurrent) handleRank(slotRank);
                      }}
                      onMouseEnter={() => setHoveredSlot(slotRank)}
                      onMouseLeave={() => setHoveredSlot(null)}
                    >
                      {isFilled
                        ? movies[Number(assignedIdx[0])].title.toUpperCase()
                        : isPreview
                          ? movies[currentIndex].title.toUpperCase()
                          : `#${slotRank}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : movies.length > 0 && Object.keys(rankings).length === movies.length ? (
        <div style={{
          background: '#fff',
          minHeight: '100vh',
          padding: 0,
          overflowX: 'hidden',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: 12,
          paddingBottom: 12,
        }}>
          <div style={{
            maxWidth: 950,
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}>
            <h2 style={{ color: '#111', fontSize: 22, fontWeight: 800, textAlign: 'center', marginBottom: 10 }}>
              {`Here's your ${
                selectedCategory.type === 'genre'
                  ? selectedCategory.value
                  : selectedCategory.type === 'decade'
                  ? selectedCategory.value
                  : selectedCategory.type === 'oscar'
                  ? `Oscar Winners: ${selectedCategory.value}`
                  : ''
              } Blindboxd`}
            </h2>
            <ResultsGrid rankings={rankings} movies={movies} selectedCategory={selectedCategory} />
            <button
              style={{
                marginTop: 8,
                padding: '10px 20px',
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 8,
                border: 'none',
                background: '#111',
                color: '#fff',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                transition: 'background 0.2s',
                width: 'fit-content',
                alignSelf: 'center',
              }}
              onClick={() => {
                setSelectedCategory(null);
                setMovies([]);
                setRankings({});
                setCurrentIndex(0);
              }}
            >
              Start new BLINDBOXD ranking
            </button>
          </div>
        </div>
      ) : (
        <p>No movies found.</p>
      )}
    </div>
  );
}

export default App; 