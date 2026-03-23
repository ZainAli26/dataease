# OSM Offline Tile Server for DataEase

Serves OpenStreetMap tiles locally so DataEase map visualizations work without internet.

## Prerequisites

- Docker installed
- Python3 (for style setup)
- wget, unzip, tar (for downloading assets)

## Setup

### 1. Download Map Tiles

Download your region's MBTiles file from MapTiler:

1. Go to https://www.maptiler.com/on-prem-datasets/dataset/osm/
2. Create a free account
3. Select your region (e.g., GCC States, Asia, World)
4. Download the `.mbtiles` file
5. Place it in `data/tiles.mbtiles`:

```bash
mkdir -p data
cp ~/Downloads/your-downloaded-file.mbtiles data/tiles.mbtiles
```

### 2. Download Map Style

```bash
wget -O /tmp/osm-bright.zip "https://github.com/openmaptiles/osm-bright-gl-style/releases/download/v1.9/v1.9.zip"
mkdir -p data/styles/osm-bright
cd /tmp && unzip -o osm-bright.zip -d osm-bright
cp osm-bright/sprite*.json osm-bright/sprite*.png <path-to>/osm-tileserver/data/styles/osm-bright/
cp osm-bright/style-local.json <path-to>/osm-tileserver/data/styles/osm-bright/style.json
```

Fix the style to point to local data:

```bash
python3 -c "
import json
style_path = '<path-to>/osm-tileserver/data/styles/osm-bright/style.json'
with open(style_path) as f:
    s = json.load(f)
s['sources']['openmaptiles'] = {'type': 'vector', 'url': 'mbtiles://{v3}'}
s['glyphs'] = '{fontstack}/{range}.pbf'
s['sprite'] = '{styleJsonFolder}/sprite'
with open(style_path, 'w') as f:
    json.dump(s, f, indent=2)
"
```

### 3. Download Fonts

```bash
wget -O /tmp/fonts.tar.gz "https://github.com/klokantech/klokantech-gl-fonts/archive/refs/heads/master.tar.gz"
mkdir -p data/fonts
cd /tmp && tar xzf fonts.tar.gz
cp -r klokantech-gl-fonts-master/* <path-to>/osm-tileserver/data/fonts/
```

Create font symlinks (the style expects these names):

```bash
cd <path-to>/osm-tileserver/data/fonts
ln -sf "KlokanTech Noto Sans Bold" "Noto Sans Bold"
ln -sf "KlokanTech Noto Sans Regular" "Noto Sans Regular"
ln -sf "KlokanTech Noto Sans Italic" "Noto Sans Italic"
```

### 4. Create Tile Server Config

Create `data/config.json`:

```json
{
  "options": {
    "paths": {
      "root": "/data",
      "fonts": "fonts",
      "styles": "styles",
      "mbtiles": "/data"
    },
    "maxScaleFactor": 3,
    "serveStaticMaps": false
  },
  "styles": {
    "osm-bright": {
      "style": "osm-bright/style.json"
    }
  },
  "data": {
    "v3": {
      "mbtiles": "tiles.mbtiles"
    }
  }
}
```

### 5. Start the Tile Server

```bash
docker run -d \
  --name dataease-tileserver \
  --restart unless-stopped \
  -p 8480:8080 \
  -v $(pwd)/data:/data \
  maptiler/tileserver-gl \
  --config /data/config.json
```

Verify it's running:

```bash
docker logs dataease-tileserver
# Should show "Startup complete"

# Open in browser to preview the map:
# http://localhost:8480/styles/osm-bright/
```

### 6. Configure DataEase

1. Open DataEase in your browser
2. Go to **System Settings > Map Settings**
3. Set the **Tile URL** to:
   ```
   http://localhost:8480/styles/osm-bright/{z}/{x}/{y}.png
   ```
4. Click **Save**

## Switching Between Online and Offline

| Mode | Tile URL Setting |
|------|-----------------|
| **Offline** | `http://localhost:8480/styles/osm-bright/{z}/{x}/{y}.png` |
| **Online** | Leave blank (uses OpenStreetMap servers automatically) |

## Tile Server Management

```bash
# Stop
docker stop dataease-tileserver

# Start
docker start dataease-tileserver

# View logs
docker logs dataease-tileserver

# Remove and recreate (after changing tiles)
docker rm -f dataease-tileserver
docker run -d --name dataease-tileserver -p 8480:8080 \
  -v $(pwd)/data:/data \
  maptiler/tileserver-gl --config /data/config.json
```
