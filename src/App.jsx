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
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#444', marginBottom: 8, textAlign: 'center', letterSpacing: 1 }}>
            {selectedCategory.type === 'genre' && (
              <>Genre: {selectedCategory.value}</>
            )}
            {selectedCategory.type === 'decade' && (
              <>Decade: {selectedCategory.value}</>
            )}
            {selectedCategory.type === 'oscar' && (
              <>Oscar Winners: {selectedCategory.value}</>
            )}
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, textAlign: 'center' }}>
            Movie {currentIndex + 1} of {movies.length}
          </h2>
          <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, textAlign: 'center' }}>
            {movies[currentIndex].title}
          </h3>
          <img
            src={movies[currentIndex].poster_path ? `https://image.tmdb.org/t/p/w500${movies[currentIndex].poster_path}` : ''}
            alt={movies[currentIndex].title}
            style={{ maxWidth: 340, width: '100%', borderRadius: 16, marginBottom: 10, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}
          />
          <div style={{ margin: '2px 0', textAlign: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Assign a rank (1 = best, 10 = worst):</p>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              {[...Array(10)].map((_, i) => {
                const rank = i + 1;
                const used = getUsedRanks().includes(rank);
                return (
                  <button
                    key={rank}
                    onClick={() => handleRank(rank)}
                    disabled={used}
                    style={{
                      width: 38,
                      height: 38,
                      fontSize: 18,
                      fontWeight: 700,
                      border: '2px solid #111',
                      background: used ? '#eee' : '#fff',
                      color: '#111',
                      borderRadius: 8,
                      cursor: used ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s',
                    }}
                  >
                    {rank}
                  </button>
                );
              })}
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
        }}>
          <div style={{
            maxWidth: 950,
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingTop: 48,
            paddingBottom: 48,
          }}>
            <h2 style={{ color: '#111', fontSize: 32, fontWeight: 800, textAlign: 'center', marginBottom: 28 }}>
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
            <ResultsGrid rankings={rankings} movies={movies} />
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <button
                style={{
                  marginTop: 48,
                  padding: '16px 32px',
                  fontSize: 20,
                  fontWeight: 700,
                  borderRadius: 10,
                  border: 'none',
                  background: '#111',
                  color: '#fff',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                  transition: 'background 0.2s',
                }}
                onClick={() => {
                  setSelectedCategory(null);
                  setMovies([]);
                  setRankings({});
                  setCurrentIndex(0);
                }}
              >
                Start new Blindboxd ranking
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p>No movies found.</p>
      )}
    </div>
  );
}

export default App; 