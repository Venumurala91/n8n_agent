FROM node:20-bookworm

USER root

# Install Python, pip, Chromium, and Playwright system dependencies using apt-get on modern Debian
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    chromium \
    chromium-driver \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    ca-certificates \
    fonts-liberation \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install n8n and playwright-core globally via npm
RUN npm install -g n8n playwright-core

# Set environment variables for Chromium
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROME_PATH=/usr/lib/chromium/

# Create a directory for n8n scripts, test logs, and screenshots
RUN mkdir -p /home/node/n8n-local-files/screenshots
RUN chown -R node:node /home/node/n8n-local-files

# Create virtual environment and install dependencies
RUN python3 -m venv /home/node/venv
ENV PATH="/home/node/venv/bin:$PATH"

RUN pip install --no-cache-dir selenium pytest requests openpyxl lxml urllib3

WORKDIR /home/node
CMD ["n8n", "start"]
