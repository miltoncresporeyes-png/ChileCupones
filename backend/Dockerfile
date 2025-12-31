FROM node:18-slim

# Install Python and dependencies for Playwright/Crawlers
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    wget \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Copy crawler requirements
COPY crawler-scripts/requirements.txt ../crawler-scripts/

# Install Python dependencies
WORKDIR /app/crawler-scripts
RUN python3 -m venv .venv
RUN . .venv/bin/activate && pip install -r requirements.txt
RUN . .venv/bin/activate && playwright install --with-deps chromium

# Copy source code
WORKDIR /app
COPY backend/ ./backend/
COPY crawler-scripts/ ./crawler-scripts/

# Expose port
EXPOSE 3000

# Start the application
WORKDIR /app/backend
CMD ["npm", "start"]
