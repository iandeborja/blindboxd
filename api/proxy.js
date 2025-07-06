export default async function handler(req, res) {
  const { url } = req.query;
  if (!url || !url.startsWith('https://image.tmdb.org/')) {
    res.status(400).send('Invalid or missing URL');
    return;
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      res.status(response.status).send('Failed to fetch image');
      return;
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', response.headers.get('content-type'));
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).send('Proxy error');
  }
} 