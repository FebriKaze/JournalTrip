import os
import json
import urllib.request

env_vars = {}
try:
    with open('.env', 'r') as f:
        for line in f:
            if '=' in line:
                key, val = line.strip().split('=', 1)
                env_vars[key] = val.replace('"', '').replace("'", "")
except Exception as e:
    pass

base_url = f"{env_vars.get('VITE_SUPABASE_URL')}/rest/v1/trips?select=area"
headers = {
    'apikey': env_vars.get('VITE_SUPABASE_ANON_KEY'),
    'Authorization': f"Bearer {env_vars.get('VITE_SUPABASE_ANON_KEY')}"
}

all_data = []
offset = 0
limit = 1000

while True:
    url = f"{base_url}&offset={offset}&limit={limit}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            all_data.extend(data)
            if len(data) < limit:
                break
            offset += limit
    except Exception as e:
        print("Error fetching data:", e)
        break

counts = {}
for row in all_data:
    area = row.get('area')
    if not area: area = 'NULL'
    counts[area] = counts.get(area, 0) + 1

print("\n=== TOTAL BARIS DATA PER AREA (TRIPS TABLE) ===")
for area, count in sorted(counts.items()):
    print(f"Area {area}: {count} baris")
print(f"Total Keseluruhan: {len(all_data)} baris\n")
