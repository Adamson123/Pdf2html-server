# Use Node.js base image
FROM node:18-bullseye

# Install pdf2htmlEX
RUN apt-get update && apt-get install -y \
    pdf2htmlEX \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json (Skip package-lock.json if missing)
COPY package.json ./

# Install dependencies (Ignore package-lock.json if not present)
RUN npm install --no-package-lock

# Copy the entire project
COPY . .

# Ensure /tmp directory is writable (important for in-memory PDF processing)
RUN mkdir -p /tmp && chmod -R 777 /tmp

# Expose port for Koyeb
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]