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

url = f"{env_vars.get('VITE_SUPABASE_URL')}/rest/v1/"
headers = {
    'apikey': env_vars.get('VITE_SUPABASE_ANON_KEY'),
    'Authorization': f"Bearer {env_vars.get('VITE_SUPABASE_ANON_KEY')}"
}

# Instead of OpenAPI, let's query the PostgreSQL pg_indexes using RPC if it exists, or just do an INSERT of a dummy row to see if it violates a unique constraint?
# Actually, since I can't easily see constraints, I'll just check if there are any duplicate (driver_id, tanggal) pairs in JBK and NGORO.
