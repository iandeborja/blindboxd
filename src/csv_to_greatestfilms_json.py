import csv
import json

input_csv = 'src/greatestfilms_filled.csv'
output_json = 'src/greatestfilms.json'

with open(input_csv, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    films = [row for row in reader if row.get('tmdb_id')]

with open(output_json, 'w', encoding='utf-8') as jsonfile:
    json.dump(films, jsonfile, ensure_ascii=False, indent=2)

print(f'Wrote {len(films)} films to {output_json}') 