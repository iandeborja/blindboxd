import csv
import json
import requests
import time

TMDB_API_KEY = "33023f84b60dbaa8d051cb792a0893e2"  # <-- Replace with your actual TMDb API key
INPUT_CSV = "src/FormattedOscarWinners.csv"
OUTPUT_JSON = "src/oscarWinners.json"

def search_tmdb(title, year):
    url = f"https://api.themoviedb.org/3/search/movie"
    params = {
        "api_key": TMDB_API_KEY,
        "query": title,
        "year": year,
    }
    resp = requests.get(url, params=params)
    if resp.status_code == 200:
        results = resp.json().get("results", [])
        if results:
            return results[0]["id"]
    return None

data = []
with open(INPUT_CSV, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        title = row["Movie title"]
        year = row["Year"]
        category = row["Category"]
        tmdb_id = row.get("tmdb_id", "").strip()
        if not tmdb_id:
            tmdb_id = search_tmdb(title, year)
            time.sleep(0.25)  # Be nice to the API
        data.append({
            "title": title,
            "year": int(year),
            "category": category,
            "tmdb_id": tmdb_id
        })

with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Done! Output written to {OUTPUT_JSON}")