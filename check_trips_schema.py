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

# We can query OpenAPI spec from Supabase to check the trips table schema
url = f"{env_vars.get('VITE_SUPABASE_URL')}/rest/v1/"
headers = {
    'apikey': env_vars.get('VITE_SUPABASE_ANON_KEY'),
    'Authorization': f"Bearer {env_vars.get('VITE_SUPABASE_ANON_KEY')}",
    'Accept': 'application/openapi+json'
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        table = data['definitions'].get('trips')
        print(json.dumps(table, indent=2))
except Exception as e:
    print("Error:", e)
