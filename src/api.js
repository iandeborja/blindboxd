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

  if (category.type === 'genre') {
    const genreId = GENRE_IDS[category.value];
    url += `&with_genres=${genreId}`;
  } else if (category.type === 'decade') {
    const { start, end } = getYearRange(category.value);
    url += `&primary_release_date.gte=${start}-01-01&primary_release_date.lte=${end}-12-31`;
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
  }

  // Fetch a random page (TMDb allows up to 500 pages)
  const randomPage = Math.floor(Math.random() * 10) + 1; // limit to first 10 pages for demo
  url += `&page=${randomPage}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
      console.error('TMDb API returned no results:', data);
      return [];
    }
    // Shuffle and pick 10 unique movies
    const shuffled = data.results.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  } catch (err) {
    console.error('Failed to fetch from TMDb:', err);
    return [];
  }
} 