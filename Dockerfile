# =============================
# 🐳 Skyward Flow - Dockerfile
# =============================

# Folosim o imagine Node.js stabilă și ușoară, cu Chromium suportat
FROM node:22-slim

# Instalăm dependențele necesare pentru Puppeteer (Chrome headless)
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    xdg-utils \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Setăm directorul de lucru
WORKDIR /app

# Copiem package.json și package-lock.json
COPY package*.json ./

# Instalăm dependențele npm
RUN npm install

# Copiem tot codul aplicației
COPY . .

# Expunem portul (opțional, pentru debug / viitor)
EXPOSE 3000

# Comanda de start
CMD ["npm", "start"]
