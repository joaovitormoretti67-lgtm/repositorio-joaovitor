#!/usr/bin/env python3
import json
import urllib.request

pages=["The_Starry_Night","Sunflowers_(Van_Gogh_series)","The_Potato_Eaters","Irises_(painting)","Wheat_Field_with_Cypresses"]
images=[]
headers = { 'User-Agent': 'VanGoghGallery/1.0 (https://example.org)'}
for p in pages:
    url=f"https://en.wikipedia.org/api/rest_v1/page/summary/{p}"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as r:
            s=json.load(r)
    except Exception as e:
        print('failed',p,e)
        images.append({'title': p, 'caption': '', 'full': '', 'thumb': ''})
        continue
    full = ''
    if isinstance(s.get('originalimage'), dict):
        full = s['originalimage'].get('source','')
    if not full and isinstance(s.get('thumbnail'), dict):
        full = s['thumbnail'].get('source','')
    images.append({'title': s.get('title',''), 'caption': s.get('extract',''), 'full': full, 'thumb': full})
with open('images.json','w',encoding='utf-8') as f:
    json.dump(images,f,ensure_ascii=False,indent=2)
print('wrote images.json')
