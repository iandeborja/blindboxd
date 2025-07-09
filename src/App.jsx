import React, { useState, useRef } from 'react';
import CategorySelection from './CategorySelection';
import { fetchRandomMovies } from './api';
import ResultsGrid from './ResultsGrid';
import { AnimatePresence, motion } from 'framer-motion';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rankings, setRankings] = useState({});
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [difficulty, setDifficulty] = useState('cinephile'); // 'cinephile', 'film_buff', 'film_lover'
  const [pendingCategory, setPendingCategory] = useState(null); // category waiting for difficulty
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [skipsLeft, setSkipsLeft] = useState(0);
  const [skippedIndices, setSkippedIndices] = useState([]);
  const [extraMovies, setExtraMovies] = useState([]); // for replacement movies
  // Store preloaded poster images for the current movie set
  const preloadedPostersRef = useRef({});
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch movies when category is selected
  React.useEffect(() => {
    if (!selectedCategory) return;
    setLoading(true);
    setError(null);
    fetchRandomMovies(selectedCategory)
      .then((results) => {
        setMovies(results);
        setCurrentIndex(0);
        // Preload all poster images for the fetched movies
        preloadedPostersRef.current = {};
        results.forEach((movie) => {
          if (movie.poster_path) {
            let posterUrl = movie.poster_path;
            if (!posterUrl.startsWith('http')) {
              posterUrl = `/api/proxy?url=https://image.tmdb.org/t/p/w300${posterUrl}`;
            } else if (posterUrl.startsWith('https://image.tmdb.org/')) {
              posterUrl = `/api/proxy?url=${encodeURIComponent(posterUrl)}`;
            }
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.src = posterUrl;
            preloadedPostersRef.current[movie.id || movie.tmdb_id] = img;
          }
        });
        // Set skips left based on difficulty
        if (difficulty === 'film_buff') setSkipsLeft(5);
        else if (difficulty === 'film_lover') setSkipsLeft(Infinity);
        else setSkipsLeft(0);
        setSkippedIndices([]);
        setExtraMovies([]);
      })
      .catch((err) => setError('Failed to fetch movies.'))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  // Ranking route: fetch movies when route matches /rank/:type/:value/:difficulty
  React.useEffect(() => {
    const match = location.pathname.match(/^\/rank\/([^/]+)\/([^/]+)\/([^/]+)/);
    if (match) {
      const [, type, value, diff] = match;
      const cat = { type, value };
      setSelectedCategory(cat);
      setDifficulty(diff);
      setLoading(true);
      setError(null);
      fetchRandomMovies(cat)
        .then((results) => {
          setMovies(results);
          setCurrentIndex(0);
          // Preload all poster images for the fetched movies
          preloadedPostersRef.current = {};
          results.forEach((movie) => {
            if (movie.poster_path) {
              let posterUrl = movie.poster_path;
              if (!posterUrl.startsWith('http')) {
                posterUrl = `/api/proxy?url=https://image.tmdb.org/t/p/w300${posterUrl}`;
              } else if (posterUrl.startsWith('https://image.tmdb.org/')) {
                posterUrl = `/api/proxy?url=${encodeURIComponent(posterUrl)}`;
              }
              const img = new window.Image();
              img.crossOrigin = 'anonymous';
              img.src = posterUrl;
              preloadedPostersRef.current[movie.id || movie.tmdb_id] = img;
            }
          });
          // Set skips left based on difficulty
          if (diff === 'film_buff') setSkipsLeft(5);
          else if (diff === 'film_lover') setSkipsLeft(Infinity);
          else setSkipsLeft(0);
          setSkippedIndices([]);
          setExtraMovies([]);
        })
        .catch((err) => setError('Failed to fetch movies.'))
        .finally(() => setLoading(false));
    } else {
      setSelectedCategory(null);
      setMovies([]);
      setCurrentIndex(0);
      setRankings({});
      setSkippedIndices([]);
      setExtraMovies([]);
    }
  }, [location.pathname]);

  function handleRank(rank) {
    setRankings((prev) => ({ ...prev, [currentIndex]: rank }));
    setTimeout(() => {
      setCurrentIndex((idx) => idx + 1);
    }, 300); // Small delay for UX
  }

  // Handle skip logic
  async function handleSkip() {
    if (skipsLeft === 0) return;
    // Mark this index as skipped
    setSkippedIndices((prev) => [...prev, currentIndex]);
    // Try to get a new movie (not already in movies, not already skipped, not already ranked)
    let pool = extraMovies.length > 0 ? extraMovies : [];
    if (pool.length === 0) {
      // Fetch more movies from the same category
      try {
        const more = await fetchRandomMovies(selectedCategory);
        pool = more.filter(
          m =>
            !movies.some(existing => existing.id === m.id) &&
            !skippedIndices.includes(movies.length + pool.indexOf(m))
        );
        setExtraMovies(pool);
      } catch {}
    }
    if (pool.length > 0) {
      // Replace current movie with a new one
      setMovies((prev) => {
        const newMovies = [...prev];
        newMovies[currentIndex] = pool[0];
        return newMovies;
      });
      setExtraMovies(pool.slice(1));
      // Preload poster for new movie
      const movie = pool[0];
      if (movie && movie.poster_path) {
        let posterUrl = movie.poster_path;
        if (!posterUrl.startsWith('http')) {
          posterUrl = `/api/proxy?url=https://image.tmdb.org/t/p/w300${posterUrl}`;
        } else if (posterUrl.startsWith('https://image.tmdb.org/')) {
          posterUrl = `/api/proxy?url=${encodeURIComponent(posterUrl)}`;
        }
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = posterUrl;
        preloadedPostersRef.current[movie.id || movie.tmdb_id] = img;
      }
    } else {
      // No more movies to show
      setCurrentIndex((idx) => idx + 1);
    }
    if (difficulty === 'film_buff') setSkipsLeft((s) => Math.max(0, s - 1));
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

  // Custom handler to track Plausible event when a category is selected
  const handleCategorySelect = (category) => {
    setPendingCategory(category);
    setShowDifficultyModal(true);
  };

  const handleDifficultyConfirm = (level) => {
    setDifficulty(level);
    setShowDifficultyModal(false);
    setSelectedCategory(pendingCategory);
    if (window.plausible && pendingCategory) {
      window.plausible('Category Played', {
        props: { category: pendingCategory.type, value: pendingCategory.value, difficulty: level }
      });
    }
    // Navigate to ranking route
    navigate(`/rank/${pendingCategory.type}/${pendingCategory.value}/${level}`);
    setPendingCategory(null);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div style={{ fontFamily: 'sans-serif', maxWidth: 1000, margin: '0 auto' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key="category"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.4 }}
              >
                <CategorySelection onCategorySelect={handleCategorySelect} />
                {/* Difficulty Modal */}
                {showDifficultyModal && (
                  <div
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      width: '100vw',
                      height: '100vh',
                      background: 'rgba(0,0,0,0.32)',
                      zIndex: 1000,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={() => {
                      setShowDifficultyModal(false);
                      setPendingCategory(null);
                    }}
                  >
                    <div
                      style={{
                        background: '#fff',
                        borderRadius: 16,
                        padding: '32px 28px 24px 28px',
                        boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
                        minWidth: 320,
                        maxWidth: '90vw',
                        textAlign: 'center',
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 12 }}>Choose your difficulty</div>
                      <div style={{ marginBottom: 18 }}>
                        <label style={{ display: 'block', marginBottom: 8, cursor: 'pointer' }}>
                          <input type="radio" name="modal-difficulty" value="cinephile" checked={difficulty === 'cinephile'} onChange={() => setDifficulty('cinephile')} />
                          <span style={{ fontWeight: 600, marginLeft: 6 }}>Cinephile</span>
                          <span style={{ color: '#888', fontSize: 13, marginLeft: 6 }}>(no skips)</span>
                        </label>
                        <label style={{ display: 'block', marginBottom: 8, cursor: 'pointer' }}>
                          <input type="radio" name="modal-difficulty" value="film_buff" checked={difficulty === 'film_buff'} onChange={() => setDifficulty('film_buff')} />
                          <span style={{ fontWeight: 600, marginLeft: 6 }}>Film Buff</span>
                          <span style={{ color: '#888', fontSize: 13, marginLeft: 6 }}>(5 skips)</span>
                        </label>
                        <label style={{ display: 'block', marginBottom: 8, cursor: 'pointer' }}>
                          <input type="radio" name="modal-difficulty" value="film_lover" checked={difficulty === 'film_lover'} onChange={() => setDifficulty('film_lover')} />
                          <span style={{ fontWeight: 600, marginLeft: 6 }}>Film Lover</span>
                          <span style={{ color: '#888', fontSize: 13, marginLeft: 6 }}>(unlimited skips)</span>
                        </label>
                      </div>
                      <button
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          padding: '8px 24px',
                          borderRadius: 8,
                          border: 'none',
                          background: '#111',
                          color: '#fff',
                          cursor: 'pointer',
                          marginTop: 8,
                        }}
                        onClick={() => handleDifficultyConfirm(difficulty)}
                      >
                        Start Ranking
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            <footer style={{
              width: '100%',
              textAlign: 'center',
              fontSize: 13,
              color: '#888',
              letterSpacing: 0.2,
              fontFamily: 'Inter, Arial, sans-serif',
              position: 'fixed',
              left: 0,
              bottom: 0,
              zIndex: 100,
              background: 'rgba(255,255,255,0.97)',
              padding: '8px 0',
              boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
            }}>
              Created by <a href="https://twitter.com/iandeborja_" target="_blank" rel="noopener noreferrer" style={{ color: '#888', textDecoration: 'underline', fontWeight: 500 }}>@iandeborja_</a>
            </footer>
          </div>
        }
      />
      <Route
        path="/rank/:categoryType/:categoryValue/:difficulty"
        element={
          <div style={{ fontFamily: 'sans-serif', maxWidth: 1000, margin: '0 auto' }}>
            <AnimatePresence mode="wait">
              {loading ? (
                <p>Loading movies...</p>
              ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
              ) : movies.length > 0 && currentIndex < movies.length ? (
                <motion.div
                  key="ranking"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.4 }}
                >
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
                    Make your BLINDBOXD {selectedCategory?.type === 'genre' ? selectedCategory.value : selectedCategory?.type === 'decade' ? selectedCategory.value : selectedCategory?.type === 'oscar' ? `Oscar Winners: ${selectedCategory.value}` : ''} Top 10.<br/>
                    <span style={{ fontWeight: 400, fontSize: 18 }}>&quot;You must choose... but choose wisely.&quot;</span>
                  </div>
                  <div className="vote-flex">
                    <div className="vote-poster-col">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={movies[currentIndex].id || movies[currentIndex].title}
                          className="vote-poster-img"
                          src={movies[currentIndex].poster_path ? `https://image.tmdb.org/t/p/w500${movies[currentIndex].poster_path}` : ''}
                          alt={movies[currentIndex].title}
                          initial={{ rotateY: 0, opacity: 1 }}
                          animate={{ rotateY: 0, opacity: 1 }}
                          exit={{ rotateY: 90, opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          style={{ perspective: 1000 }}
                        />
                      </AnimatePresence>
                    </div>
                    <div className="vote-rank-col">
                      <div className="vote-rank-slots">
                        {[...Array(10)].map((_, i) => {
                          const slotRank = i + 1;
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
                      {/* Skip button for Film Buff and Film Lover */}
                      {(difficulty === 'film_buff' || difficulty === 'film_lover') && skipsLeft > 0 && (
                        <button
                          style={{
                            marginTop: 18,
                            padding: '8px 18px',
                            fontSize: 16,
                            fontWeight: 700,
                            borderRadius: 8,
                            border: '1.5px solid #bbb',
                            background: '#f8f8f8',
                            color: '#333',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                          }}
                          onClick={handleSkip}
                          disabled={skipsLeft === 0}
                        >
                          Skip {difficulty === 'film_buff' && <span style={{ fontWeight: 400, fontSize: 14 }}>({skipsLeft} left)</span>}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : movies.length > 0 && Object.keys(rankings).length === movies.length ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.4 }}
                >
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
                          selectedCategory?.type === 'genre'
                            ? selectedCategory.value
                            : selectedCategory?.type === 'decade'
                            ? selectedCategory.value
                            : selectedCategory?.type === 'oscar'
                            ? `Oscar Winners: ${selectedCategory.value}`
                            : ''
                        } Blindboxd`}
                      </h2>
                      <ResultsGrid
                        key={selectedCategory?.type + '-' + selectedCategory?.value + '-' + Object.values(rankings).join('-')}
                        rankings={rankings}
                        movies={movies}
                        selectedCategory={selectedCategory}
                        preloadedPosters={preloadedPostersRef.current}
                      />
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
                          navigate('/');
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
                </motion.div>
              ) : (
                <p>No movies found.</p>
              )}
            </AnimatePresence>
            <footer style={{
              width: '100%',
              textAlign: 'center',
              fontSize: 13,
              color: '#888',
              letterSpacing: 0.2,
              fontFamily: 'Inter, Arial, sans-serif',
              position: 'fixed',
              left: 0,
              bottom: 0,
              zIndex: 100,
              background: 'rgba(255,255,255,0.97)',
              padding: '8px 0',
              boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
            }}>
              Created by <a href="https://twitter.com/iandeborja_" target="_blank" rel="noopener noreferrer" style={{ color: '#888', textDecoration: 'underline', fontWeight: 500 }}>@iandeborja_</a>
            </footer>
          </div>
        }
      />
    </Routes>
  );
}

export default App; 