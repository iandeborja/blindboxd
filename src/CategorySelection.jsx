import React from 'react';

const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi'];
const decades = ['1980s', '1990s', '2000s', '2010s', '2020s'];

export default function CategorySelection({ onCategorySelect }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      fontFamily: 'Inter, Arial, Helvetica, sans-serif',
      color: '#111',
    }}>
      {/* Top Nav Bar */}
      <nav style={{
        width: '100%',
        borderBottom: 'none',
        padding: '48px 0 0 0',
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
          Create Top 10 Lists Without Knowing the Movies
        </span>
      </nav>
      <main style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '0 16px',
        marginTop: 56,
        textAlign: 'left',
      }}>
        <section style={{ marginBottom: 56 }}>
          <h2 style={{
            fontSize: 28,
            fontWeight: 800,
            textTransform: 'uppercase',
            marginBottom: 28,
            letterSpacing: 1,
          }}>Genres</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 220px)',
            gap: '32px 32px',
            marginBottom: 0,
          }}>
            {genres.map((genre) => (
              <button
                key={genre}
                style={{
                  padding: '36px 0',
                  fontSize: 26,
                  fontWeight: 800,
                  border: '3px solid #111',
                  background: '#fff',
                  color: '#111',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  cursor: 'pointer',
                  transition: 'background 0.2s, color 0.2s',
                  outline: 'none',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#111';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.color = '#111';
                }}
                onClick={() => onCategorySelect({ type: 'genre', value: genre })}
              >
                {genre.toUpperCase()}
              </button>
            ))}
          </div>
        </section>
        <section style={{ marginBottom: 56 }}>
          <h2 style={{
            fontSize: 28,
            fontWeight: 800,
            textTransform: 'uppercase',
            marginBottom: 28,
            letterSpacing: 1,
          }}>Decades</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 220px)',
            gap: '32px 32px',
            marginBottom: 0,
          }}>
            {decades.map((decade) => (
              <button
                key={decade}
                style={{
                  padding: '36px 0',
                  fontSize: 26,
                  fontWeight: 800,
                  border: '3px solid #111',
                  background: '#fff',
                  color: '#111',
                  letterSpacing: 1,
                  cursor: 'pointer',
                  transition: 'background 0.2s, color 0.2s',
                  outline: 'none',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#111';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.color = '#111';
                }}
                onClick={() => onCategorySelect({ type: 'decade', value: decade })}
              >
                <span style={{ textTransform: 'uppercase' }}>{decade.slice(0, 4)}</span><span style={{ textTransform: 'lowercase' }}>s</span>
              </button>
            ))}
          </div>
        </section>
        <section style={{ marginBottom: 56 }}>
          <h2 style={{
            fontSize: 28,
            fontWeight: 800,
            textTransform: 'uppercase',
            marginBottom: 28,
            letterSpacing: 1,
          }}>Oscar Winners</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 220px)',
            gap: '32px 32px',
            marginBottom: 0,
          }}>
            {decades.map((decade) => (
              <button
                key={decade}
                style={{
                  padding: '36px 0',
                  fontSize: 26,
                  fontWeight: 800,
                  border: '3px solid #111',
                  background: '#fff',
                  color: '#111',
                  letterSpacing: 1,
                  cursor: 'pointer',
                  transition: 'background 0.2s, color 0.2s',
                  outline: 'none',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#111';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.color = '#111';
                }}
                onClick={() => onCategorySelect({ type: 'oscar', value: decade })}
              >
                <span style={{ textTransform: 'uppercase' }}>{decade.slice(0, 4)}</span><span style={{ textTransform: 'lowercase' }}>s</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
} 