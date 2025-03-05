# Use Node.js base image
FROM node:18-bullseye

# Install dependencies for pdf2htmlEX
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    pkg-config \
    poppler-utils \
    poppler-data \
    libpoppler-cpp-dev \
    libfontforge-dev \
    fontforge \
    git \
    && rm -rf /var/lib/apt/lists/*

# Clone and build pdf2htmlEX from source
RUN git clone --depth=1 https://github.com/pdf2htmlEX/pdf2htmlEX.git /opt/pdf2htmlEX \
    && cd /opt/pdf2htmlEX \
    && cmake . \
    && make \
    && make install

# Set working directory
WORKDIR /app

# Copy package.json (Skip package-lock.json if missing)
COPY package.json ./

# Install dependencies (Ignore package-lock.json if not present)
RUN npm install --no-package-lock

# Copy the entire project
COPY . .

# Ensure /tmp directory is writable
RUN mkdir -p /tmp && chmod -R 777 /tmp

# Expose port for Koyeb
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]