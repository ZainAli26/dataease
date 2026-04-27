# DataEase Local Development Setup Guide

Complete instructions to clone, build, and run DataEase locally with offline map support.


## Prerequisites

Install the following before starting:

| Tool       | Version  | Notes                          |
|------------|----------|--------------------------------|
| Java (JDK) | 21+     | OpenJDK recommended            |
| Maven      | 3.6+     |                                |
| Node.js    | 18+      |                                |
| npm        | 9+       | Comes with Node.js             |
| MySQL      | 8.0+     |                                |
| Redis      | 6+       |                                |
| Docker     | 20+      | For offline tile server (maps) |
| Git        | 2.30+    |                                |


## 1. Clone the Repository

```bash
git clone https://github.com/ZainAli26/dataease.git
cd dataease
git checkout dev-v2
```


## 2. Database & Redis Setup

### Start MySQL and Redis

If they are not already running as system services:

```bash
# MySQL
sudo systemctl start mysql

# Redis
sudo systemctl start redis
```

### Create the Database

If MySQL is already running but the database doesn't exist:

```bash
mysql -u root -p123456 -e "CREATE DATABASE IF NOT EXISTS dataease10 DEFAULT CHARACTER SET utf8mb4;"
```

### Verify Connectivity

```bash
# MySQL
mysql -u root -p123456 -e "SHOW DATABASES LIKE 'dataease10';"

# Redis
redis-cli -a 123456 ping
# Should return: PONG
```

> **Default connection settings** (from `application-standalone.yml`):
> - MySQL: `localhost:3306`, user `root`, password `123456`, database `dataease10`
> - Redis: `localhost:6379`, password `123456`


## 3. Backend Setup

### 3.1 Create Data Directories

The backend writes logs, cache, and data files to `/opt/dataease2.0/` by default. Create these directories first:

```bash
sudo mkdir -p /opt/dataease2.0/{cache,logs/dataease,data/{excel,font,report,static-resource,exportData},drivers,custom-drivers}
sudo chown -R $USER:$USER /opt/dataease2.0
```

### 3.2 Install SDK Modules

From the project root:

```bash
cd sdk
mvn install -DskipTests
cd ..
```

This installs all SDK sub-modules (`common`, `api-base`, `api-permissions`, `extensions-*`, etc.) to your local Maven repository.

### 3.3 Build the Frontend (required before backend)

The backend build copies the frontend's `dist/` folder into its static resources. You must build the frontend first:

```bash
cd core/core-frontend
npm install
npm run build:base
cd ../..
```

### 3.4 Run the Backend

```bash
cd core/core-backend
mvn spring-boot:run -DskipTests \
  -Dspring-boot.run.arguments="--logging.file.path=./logs --spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver"
```

**Explanation of arguments:**
- `--logging.file.path=./logs` — Writes logs to a local `./logs` directory instead of the default `/opt/dataease2.0/logs/dataease`
- `--spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver` — Explicitly selects the MySQL driver (H2 is also on the classpath and can interfere)

The backend will start on **http://localhost:8100**.

Wait for the log output:
```
Started CoreApplication in X seconds
```

## 4. Frontend Setup

Open a **new terminal** (keep the backend running).

### 4.1 Install Dependencies

```bash
cd core/core-frontend
npm install
```

### 4.2 Run the Dev Server

**Linux / macOS:**
```bash
npm run dev
```

The frontend will start on **http://localhost:8080**.

It proxies API requests (`/api/*`) to the backend at `http://localhost:8100` automatically.


## 5. Offline Map Setup (Optional)

This sets up a local OpenStreetMap tile server so map visualizations work without internet.

### 5.1 Download Map Tiles

1. Go to https://www.maptiler.com/on-prem-datasets/dataset/osm/
2. Create a free account
3. Select your region (e.g., GCC States, Asia, World)
4. Download the `.mbtiles` file
5. Place it in the tile server data directory:

```bash
cd osm-tileserver
mkdir -p data
cp ~/Downloads/your-downloaded-file.mbtiles ./data/tiles.mbtiles
```

### 5.2 Download Fonts

> The map style files (`osm-tileserver/data/styles/`) are already included in the repository — no download needed.

```bash
wget -O /tmp/fonts.tar.gz "https://github.com/klokantech/klokantech-gl-fonts/archive/refs/heads/master.tar.gz"
mkdir -p data/fonts
cd /tmp && tar xzf fonts.tar.gz
cp -r klokantech-gl-fonts-master/* <project-root>/osm-tileserver/data/fonts/
```

Create font symlinks:

```bash
cd <project-root>/osm-tileserver/data/fonts
ln -sf "KlokanTech Noto Sans Bold" "Noto Sans Bold"
ln -sf "KlokanTech Noto Sans Regular" "Noto Sans Regular"
ln -sf "KlokanTech Noto Sans Italic" "Noto Sans Italic"
```

### 5.3 Start the Tile Server

> The tile server config (`osm-tileserver/data/config.json`) is already included in the repository — no need to create it.

```bash
cd osm-tileserver
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
```

Preview the map at: http://localhost:8480/styles/osm-bright/


## 6. Configure Map URL in DataEase

1. Open DataEase at **http://localhost:8080**
2. Log in (see credentials below)
3. Go to **System Settings > Map Settings > OnlineMaps**
4. Set the **Tile URL** to:
   ```
   http://localhost:8480/styles/osm-bright/{z}/{x}/{y}.png
   ```
5. Click **Save**

| Mode        | Tile URL Setting                                                  |
|-------------|-------------------------------------------------------------------|
| **Offline** | `http://localhost:8480/styles/osm-bright/{z}/{x}/{y}.png`         |
| **Online**  | Leave blank (uses OpenStreetMap servers automatically)             |


## 7. Login Credentials

Open the app at **http://localhost:8080** and log in with:

| Field    | Value              |
|----------|--------------------|
| Username | `admin`            |
| Password | `DataEase@123456`  |


## Quick Reference

| Service          | URL                          |
|------------------|------------------------------|
| Frontend (dev)   | http://localhost:8080         |
| Backend API      | http://localhost:8100         |
| Tile Server      | http://localhost:8480         |
| Map Preview      | http://localhost:8480/styles/osm-bright/ |


## Tile Server Management

```bash
# Stop
docker stop dataease-tileserver

# Start
docker start dataease-tileserver

# View logs
docker logs dataease-tileserver

# Remove and recreate
docker rm -f dataease-tileserver
cd osm-tileserver
docker run -d --name dataease-tileserver -p 8480:8080 \
  -v $(pwd)/data:/data \
  maptiler/tileserver-gl --config /data/config.json
```
