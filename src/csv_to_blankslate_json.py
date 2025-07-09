import csv
import json
import requests
import time
import os

TMDB_API_KEY = os.environ.get("VITE_TMDB_API_KEY")
if not TMDB_API_KEY:
    raise ValueError("TMDb API key not found in environment variable VITE_TMDB_API_KEY")
TMDB_SEARCH_URL = "https://api.themoviedb.org/3/search/movie"

input_csv = 'src/blankslate.csv'
output_json = 'src/blankslate.json'

with open(input_csv, newline='', encoding='utf-8') as csvfile:
    reader = csv.reader(csvfile)
    titles = [row[0].strip() for row in reader if row and row[0].strip() and not row[0].startswith('Title')]

results = []
for title in titles:
    params = {
        'api_key': TMDB_API_KEY,
        'query': title,
        'language': 'en-US',
        'include_adult': 'false',
    }
    try:
        resp = requests.get(TMDB_SEARCH_URL, params=params)
        data = resp.json()
        if data.get('results'):
            movie = data['results'][0]
            tmdb_id = movie['id']
            poster_path = movie.get('poster_path')
            results.append({
                'title': title,
                'tmdb_id': tmdb_id,
                'poster_path': poster_path
            })
        else:
            results.append({
                'title': title,
                'tmdb_id': None,
                'poster_path': None
            })
    except Exception as e:
        print(f"Error fetching {title}: {e}")
        results.append({
            'title': title,
            'tmdb_id': None,
            'poster_path': None
        })
    time.sleep(0.2)  # Be nice to the API

with open(output_json, 'w', encoding='utf-8') as jsonfile:
    json.dump(results, jsonfile, ensure_ascii=False, indent=2)

print(f'Wrote {len(results)} movies to {output_json}') 