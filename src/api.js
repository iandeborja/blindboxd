console.log('VITE_TMDB_API_KEY:', import.meta.env.VITE_TMDB_API_KEY);
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// Hardcoded genre IDs for demonstration
const GENRE_IDS = {
  Action: 28,
  Comedy: 35,
  Drama: 18,
  Horror: 27,
  'Sci-Fi': 878,
};

// Oscar main categories
const OSCAR_CATEGORIES = [
  'Best Picture',
  'Best Actor',
  'Best Actress',
  'Best Director',
  'Best Original Screenplay',
  'Best Adapted Screenplay',
];

function getYearRange(decade) {
  const start = parseInt(decade.slice(0, 4), 10);
  return { start, end: start + 9 };
}

async function fetchMovieDetailsById(tmdb_id) {
  const url = `${BASE_URL}/movie/${tmdb_id}?api_key=${API_KEY}&language=en-US`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return await res.json();
}

export async function fetchRandomMovies(category) {
  let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}` +
    `&language=en-US` +
    `&sort_by=popularity.desc` +
    `&vote_count.gte=100` +
    `&vote_average.gte=6` +
    `&with_original_language=en`;

  let maxPages;
  if (category.type === 'genre') {
    const genreId = GENRE_IDS[category.value];
    url += `&with_genres=${genreId}`;
    maxPages = 20; // 400 movies for genres
  } else if (category.type === 'decade') {
    const { start, end } = getYearRange(category.value);
    url += `&primary_release_date.gte=${start}-01-01&primary_release_date.lte=${end}-12-31`;
    maxPages = 25; // 500 movies for decades
  } else if (category.type === 'oscar') {
    // Load oscarWinners.json dynamically
    const oscarData = (await import('./oscarWinners.json')).default;
    const { start, end } = getYearRange(category.value);
    // Filter for main categories and decade
    const filtered = oscarData.filter(row => {
      const y = Number(row.year);
      return (
        y >= start && y <= end &&
        OSCAR_CATEGORIES.includes(row.category) &&
        row.tmdb_id
      );
    });
    // Deduplicate by tmdb_id (force string for key)
    const seen = new Set();
    const unique = [];
    for (const row of filtered) {
      const id = String(row.tmdb_id);
      if (!seen.has(id)) {
        seen.add(id);
        unique.push(row);
      }
    }
    // Shuffle and pick 10 unique movies
    const shuffled = unique.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);
    // Fetch movie details from TMDb for each
    const details = await Promise.all(
      selected.map(row => fetchMovieDetailsById(row.tmdb_id))
    );
    // Return only valid results
    return details.filter(Boolean);
  } else if (category.type === 'greatest') {
    // Only use greatestfilms.json, pick 10 random movies
    const greatestFilms = (await import('./greatestfilms.json')).default;
    // Filter for those with tmdb_id
    let pool = greatestFilms.filter(f => f.tmdb_id);
    // Shuffle and pick 10
    pool = pool.sort(() => 0.5 - Math.random()).slice(0, 10);
    // Fetch poster_path if missing
    for (const movie of pool) {
      if (!movie.poster_path && movie.tmdb_id) {
        try {
          const details = await fetchMovieDetailsById(movie.tmdb_id);
          if (details && details.poster_path) {
            movie.poster_path = details.poster_path;
          }
        } catch {}
      }
      movie.id = Number(movie.tmdb_id);
      movie.title = movie['Movie Title'];
    }
    return pool;
  } else if (category.type === 'podcast' && category.value === 'rewatchables') {
    // Load rewatchables.json and pick 10 random movies with valid tmdb_id and poster_path
    const rewatchables = (await import('./rewatchables.json')).default;
    const pool = rewatchables.filter(m => m.tmdb_id && m.poster_path);
    const shuffled = pool.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10).map(m => ({
      ...m,
      id: Number(m.tmdb_id),
      title: m.title,
    }));
  } else if (category.type === 'podcast' && category.value === 'blankslate') {
    // Load blankslate.json and pick 10 random movies
    const blankslate = (await import('./blankslate.json')).default;
    // Shuffle and pick 10
    const shuffled = blankslate.sort(() => 0.5 - Math.random());
    // Return as objects with id, title, and (if available) tmdb_id/poster_path
    return shuffled.slice(0, 10).map((m, i) => ({
      ...m,
      id: m.tmdb_id ? Number(m.tmdb_id) : m.title + '-' + i,
      title: m.title,
      poster_path: m.poster_path || null,
    }));
  } else if (category.type === 'podcast' && category.value === 'seventymm') {
    // Load 70mm.json and pick 10 random movies
    const seventymm = (await import('./70mm.json')).default;
    // Shuffle and pick 10
    const shuffled = seventymm.sort(() => 0.5 - Math.random());
    // Return as objects with id, title, and (if available) tmdb_id/poster_path
    return shuffled.slice(0, 10).map((m, i) => ({
      ...m,
      id: m.tmdb_id ? Number(m.tmdb_id) : m.title + '-' + i,
      title: m.title,
      poster_path: m.poster_path || null,
    }));
  } else if (category.type === 'podcast' && category.value === 'escapehatch') {
    // Load escapehatch.json and pick 10 random movies
    const escapehatch = (await import('./escapehatch.json')).default;
    // Shuffle and pick 10
    const shuffled = escapehatch.sort(() => 0.5 - Math.random());
    // Return as objects with id, title, and (if available) tmdb_id/poster_path
    return shuffled.slice(0, 10).map((m, i) => ({
      ...m,
      id: m.tmdb_id ? Number(m.tmdb_id) : m.title + '-' + i,
      title: m.title,
      poster_path: m.poster_path || null,
    }));
  }

  let apiResults = [];
  if (category.type !== 'oscar') {
    // Fetch a random page (TMDb allows up to 500 pages)
    const randomPage = Math.floor(Math.random() * maxPages) + 1;
    url += `&page=${randomPage}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        apiResults = data.results;
      }
    } catch (err) {
      console.error('Failed to fetch from TMDb:', err);
    }
  }

  // Load greatestfilms.json and filter for matches
  const greatestFilms = (await import('./greatestfilms.json')).default;
  let extraFilms = [];
  if (category.type === 'genre') {
    // Match if genre is included in the Genre field (case-insensitive, partial match)
    extraFilms = greatestFilms.filter(f =>
      f.Genre && f.Genre.toLowerCase().includes(category.value.toLowerCase()) && f.tmdb_id
    ).map(f => ({
      ...f,
      id: Number(f.tmdb_id),
      title: f['Movie Title'],
      poster_path: null // will fill in below if possible
    }));
  } else if (category.type === 'decade') {
    const { start, end } = getYearRange(category.value);
    extraFilms = greatestFilms.filter(f => {
      const y = Number(f.Year);
      return y >= start && y <= end && f.tmdb_id;
    }).map(f => ({
      ...f,
      id: Number(f.tmdb_id),
      title: f['Movie Title'],
      poster_path: null // will fill in below if possible
    }));
  }

  // Merge and deduplicate by tmdb_id
  const all = [...apiResults, ...extraFilms];
  const seen = new Set();
  const deduped = [];
  for (const movie of all) {
    const id = String(movie.id || movie.tmdb_id);
    if (!seen.has(id)) {
      seen.add(id);
      deduped.push(movie);
    }
  }

  // Optionally, fetch poster_path for extraFilms if missing
  for (const movie of deduped) {
    if (!movie.poster_path && movie.id) {
      // Try to fetch details for poster
      try {
        const details = await fetchMovieDetailsById(movie.id);
        if (details && details.poster_path) {
          movie.poster_path = details.poster_path;
        }
      } catch {}
    }
  }

  // Shuffle and pick 10 unique movies
  const shuffled = deduped.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 10);
} 