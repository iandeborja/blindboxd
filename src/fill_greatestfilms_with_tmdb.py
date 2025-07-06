import csv
import os
import requests
import time

TMDB_API_KEY = os.environ.get('TMDB_API_KEY')
TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/search/movie'
TMDB_MOVIE_URL = 'https://api.themoviedb.org/3/movie/{}'

INPUT_CSV = 'src/greatestfilms.csv'
OUTPUT_CSV = 'src/greatestfilms_filled.csv'

if not TMDB_API_KEY:
    raise Exception('Please set the TMDB_API_KEY environment variable.')

def get_tmdb_info(title, year):
    params = {
        'api_key': TMDB_API_KEY,
        'query': title,
        'year': year if year else '',
        'language': 'en-US',
    }
    resp = requests.get(TMDB_SEARCH_URL, params=params)
    if resp.status_code != 200:
        return None, None
    data = resp.json()
    if not data['results']:
        return None, None
    # Take the first result
    movie = data['results'][0]
    tmdb_id = movie['id']
    # Now get genres
    details_resp = requests.get(TMDB_MOVIE_URL.format(tmdb_id), params={'api_key': TMDB_API_KEY, 'language': 'en-US'})
    if details_resp.status_code != 200:
        return tmdb_id, None
    details = details_resp.json()
    genres = [g['name'] for g in details.get('genres', [])]
    return tmdb_id, ';'.join(genres)

def main():
    with open(INPUT_CSV, newline='', encoding='utf-8') as infile, \
         open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as outfile:
        reader = csv.DictReader(infile)
        fieldnames = reader.fieldnames
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()
        for row in reader:
            title = row['Movie Title']
            year = row['Year']
            genre = row['Genre']
            tmdb_id = row['tmdb_id']
            if not genre or not tmdb_id:
                print(f'Looking up: {title} ({year})...')
                found_id, found_genre = get_tmdb_info(title, year)
                if not tmdb_id and found_id:
                    row['tmdb_id'] = found_id
                if not genre and found_genre:
                    row['Genre'] = found_genre
                time.sleep(0.25)  # Be nice to the API
            writer.writerow(row)
    print(f'Done! Output written to {OUTPUT_CSV}')

if __name__ == '__main__':
    main() 