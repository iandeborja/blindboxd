import React, { useEffect, useRef, useState } from 'react';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

async function fetchPosterPath(tmdb_id) {
  if (!tmdb_id) return null;
  try {
    const res = await fetch(`${TMDB_BASE_URL}/movie/${tmdb_id}?api_key=${TMDB_API_KEY}&language=en-US`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.poster_path || null;
  } catch {
    return null;
  }
}

export default function ResultsGrid({ rankings, movies, selectedCategory }) {
  // Build an array of 10 slots, one for each rank 1-10
  const rankToMovie = Array(10).fill(null);
  Object.entries(rankings).forEach(([movieIdx, rank]) => {
    if (rank >= 1 && rank <= 10) {
      rankToMovie[rank - 1] = movies[Number(movieIdx)];
    }
  });

  const [pngUrl, setPngUrl] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    async function ensurePostersAndDraw() {
      const SCALE = 2;
      // Clone the array to avoid mutating props
      const moviesWithPosters = await Promise.all(
        rankToMovie.map(async (movie) => {
          if (!movie) return null;
          if (movie.poster_path) return movie;
          // Try to fetch poster_path from TMDb
          const poster_path = await fetchPosterPath(movie.tmdb_id || movie.id);
          return { ...movie, poster_path };
        })
      );
      // Now draw the PNG
      const width = 700 * SCALE;
      const height = 540 * SCALE;
      const posterW = 120 * SCALE;
      const posterH = 180 * SCALE;
      const gap = 10 * SCALE;
      const marginTop = 80 * SCALE;
      const marginLeft = 30 * SCALE;
      const rowGap = 45 * SCALE;
      const numberFont = `bold ${20 * SCALE}px Inter, Arial, sans-serif`;
      const brandFont = `bold ${36 * SCALE}px Inter, Arial, sans-serif`;
      const descFont = `${16 * SCALE}px Inter, Arial, sans-serif`;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      // White background
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, width, height);
      // Branding
      ctx.font = brandFont;
      ctx.fillStyle = '#111';
      ctx.textAlign = 'center';
      ctx.fillText('BLINDBOXD', width / 2, 44 * SCALE);
      ctx.font = descFont;
      ctx.fillStyle = '#666';
      ctx.fillText(
        selectedCategory?.type === 'greatest'
          ? 'The Greatest Films of All Time'
          : selectedCategory?.type === 'genre'
          ? selectedCategory.value
          : selectedCategory?.type === 'decade'
          ? selectedCategory.value
          : selectedCategory?.type === 'oscar'
          ? `Oscar Winners: ${selectedCategory.value}`
          : 'Movie Ranking',
        width / 2,
        70 * SCALE
      );
      // Draw posters and numbers for all 10 slots
      for (let i = 0; i < 10; i++) {
        const movie = moviesWithPosters[i];
        const col = i % 5;
        const row = Math.floor(i / 5);
        const x = marginLeft + col * (posterW + gap);
        const y = marginTop + row * (posterH + rowGap);
        // Always draw a placeholder first
        ctx.fillStyle = '#eee';
        ctx.fillRect(x, y, posterW, posterH);
        // Poster (if available)
        if (movie && movie.poster_path) {
          // Ensure poster_path is a full URL via the Vercel proxy
          let posterUrl = movie.poster_path;
          if (!posterUrl.startsWith('http')) {
            posterUrl = `/api/proxy?url=https://image.tmdb.org/t/p/w300${posterUrl}`;
          } else if (posterUrl.startsWith('https://image.tmdb.org/')) {
            posterUrl = `/api/proxy?url=${encodeURIComponent(posterUrl)}`;
          }
          console.log(`Drawing poster for slot ${i + 1}:`, posterUrl);
          await new Promise((resolve) => {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              ctx.drawImage(img, x, y, posterW, posterH);
              resolve();
            };
            img.onerror = (e) => {
              console.error(`Failed to load poster for slot ${i + 1}:`, posterUrl, e);
              resolve();
            };
            img.src = posterUrl;
          });
        } else {
          console.warn(`No poster_path for slot ${i + 1}`, movie);
        }
        // Number (always)
        ctx.font = numberFont;
        ctx.fillStyle = '#222';
        ctx.textAlign = 'center';
        ctx.fillText(i + 1, x + posterW / 2, y + posterH + 32 * SCALE);
      }
      setPngUrl(canvas.toDataURL('image/png'));
    }
    ensurePostersAndDraw();
  }, [rankings, movies, selectedCategory]);

  return (
    <div style={{ textAlign: 'center', marginTop: 10 }}>
      {pngUrl ? (
        <>
          <img
            src={pngUrl}
            alt="Your BLINDBOXD ranking"
            style={{
              width: 700,
              height: 540,
              maxWidth: '100%',
              borderRadius: 16,
              boxShadow: '0 2px 10px rgba(0,0,0,0.10)',
              border: '1.5px solid #eee',
              marginBottom: 12,
            }}
          />
          <div style={{ fontSize: 15, color: '#444', marginBottom: 8 }}>
            Tap and hold to save or share
          </div>
        </>
      ) : (
        <div style={{ width: 732, height: 540, background: '#eee', borderRadius: 16, margin: '0 auto' }} />
      )}
    </div>
  );
} 