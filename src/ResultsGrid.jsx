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

export default function ResultsGrid({ rankings, movies, selectedCategory, preloadedPosters = {} }) {
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
      const height = 560 * SCALE;
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
      let subtitle = 'Movie Ranking';
      if (selectedCategory?.type === 'greatest') subtitle = 'The Greatest Films of All Time';
      else if (selectedCategory?.type === 'genre') subtitle = selectedCategory.value;
      else if (selectedCategory?.type === 'decade') subtitle = selectedCategory.value;
      else if (selectedCategory?.type === 'oscar') subtitle = `Oscar Winners: ${selectedCategory.value}`;
      else if (selectedCategory?.type === 'podcast') {
        const podcastMap = {
          rewatchables: 'The Rewatchables Podcast',
          blankslate: 'Blank Check Podcast',
          seventymm: '70mm Podcast',
          escapehatch: 'Escape Hatch Podcast',
        };
        subtitle = podcastMap[selectedCategory.value] || `${selectedCategory.value} Podcast`;
      }
      ctx.fillText(subtitle, width / 2, 70 * SCALE);
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
          let posterUrl = movie.poster_path;
          if (!posterUrl.startsWith('http')) {
            posterUrl = `/api/proxy?url=https://image.tmdb.org/t/p/w300${posterUrl}`;
          } else if (posterUrl.startsWith('https://image.tmdb.org/')) {
            posterUrl = `/api/proxy?url=${encodeURIComponent(posterUrl)}`;
          }
          const preloadedImg = preloadedPosters[movie.id || movie.tmdb_id];
          if (preloadedImg && preloadedImg.complete && preloadedImg.naturalWidth > 0) {
            ctx.drawImage(preloadedImg, x, y, posterW, posterH);
          } else {
            await new Promise((resolve) => {
              const img = new window.Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                ctx.drawImage(img, x, y, posterW, posterH);
                resolve();
              };
              img.onerror = (e) => {
                resolve();
              };
              img.src = posterUrl;
            });
          }
        }
        // Delivery order (for label)
        let deliveryOrder = 0;
        if (movie) {
          deliveryOrder = movies.findIndex(m => (m.id || m.tmdb_id) === (movie.id || movie.tmdb_id) && m.title === movie.title);
        }
        // Final rank as black circle with white number
        const rankCircleR = 24 * SCALE; // 20% smaller than 30
        const rankCircleX = x + posterW / 2;
        const rankCircleY = y + posterH + 16 * SCALE; // 20% smaller than 20
        ctx.save();
        ctx.beginPath();
        ctx.arc(rankCircleX, rankCircleY, rankCircleR / 2, 0, 2 * Math.PI);
        ctx.fillStyle = '#111';
        ctx.fill();
        ctx.font = `bold ${15 * SCALE}px 'Menlo', 'Consolas', 'Liberation Mono', 'monospace', Inter, Arial, sans-serif`;
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(i + 1), rankCircleX, rankCircleY + 1.2 * SCALE);
        ctx.restore();
        // Draw delivery order below in smaller grey font
        ctx.font = `${10 * SCALE}px Inter, Arial, sans-serif`;
        ctx.fillStyle = '#888';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`(Draw #${deliveryOrder + 1})`, x + posterW / 2, y + posterH + 32 * SCALE);
      }
      // Draw site URL at the bottom center
      ctx.font = `bold ${14 * SCALE}px Inter, Arial, sans-serif`;
      ctx.fillStyle = '#888';
      ctx.textAlign = 'center';
      ctx.fillText('BLINDBOXD.XYZ', width / 2, height - 22 * SCALE);
      setPngUrl(canvas.toDataURL('image/png'));
    }
    ensurePostersAndDraw();
  }, [rankings, movies, selectedCategory, preloadedPosters]);

  return (
    <div style={{ textAlign: 'center', marginTop: 10 }}>
      {pngUrl ? (
        <>
          <img
            src={pngUrl}
            alt="Your BLINDBOXD ranking"
            style={{
              width: '100%',
              height: 'auto',
              maxWidth: 700,
              borderRadius: 16,
              boxShadow: '0 2px 10px rgba(0,0,0,0.10)',
              border: '1.5px solid #eee',
              marginBottom: 12,
              display: 'block',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          />
          <div style={{ fontSize: 15, color: '#444', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            Tap and hold to save or
            <button
              style={{
                fontSize: 13,
                padding: '3px 10px',
                borderRadius: 6,
                border: '1px solid #bbb',
                background: '#f8f8f8',
                color: '#333',
                fontWeight: 600,
                cursor: 'pointer',
                marginLeft: 4,
                marginRight: 0,
                transition: 'background 0.2s',
              }}
              onClick={async () => {
                if (window.plausible) {
                  window.plausible('Result Shared');
                }
                if (!pngUrl) return;
                try {
                  const response = await fetch(pngUrl);
                  const blob = await response.blob();
                  const clipboardItems = [
                    new window.ClipboardItem({
                      'image/png': blob,
                      'text/plain': new Blob(['https://blindboxd.xyz'], { type: 'text/plain' }),
                    }),
                  ];
                  await navigator.clipboard.write(clipboardItems);
                  alert('Image and link copied! Paste in any app to share.');
                } catch (err) {
                  try {
                    await navigator.clipboard.write([
                      new window.ClipboardItem({ 'image/png': blob }),
                    ]);
                    alert('Image copied! Link: https://blindboxd.xyz');
                  } catch (e) {
                    alert('Could not copy image. Please long-press or right-click to save.');
                  }
                }
              }}
            >
              SHARE
            </button>
          </div>
        </>
      ) : (
        <div style={{ width: 732, height: 540, background: '#eee', borderRadius: 16, margin: '0 auto' }} />
      )}
    </div>
  );
} 