# Use Node.js base image
FROM node:18-bullseye

# Install dependencies required for pdf2htmlEX
RUN apt-get update && apt-get install -y \
    build-essential \
    poppler-utils \
    fontforge \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Download and install prebuilt pdf2htmlEX binary
RUN wget -qO /usr/local/bin/pdf2htmlEX https://github.com/pdf2htmlEX/pdf2htmlEX/releases/download/v0.18.8.rc2/pdf2htmlEX-linux-64bit \
    && chmod +x /usr/local/bin/pdf2htmlEX

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