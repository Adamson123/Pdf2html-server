# Use Node.js base image
FROM node:18-bullseye

# Install pdf2htmlEX
RUN apt-get update && apt-get install -y \
    pdf2htmlEX \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the entire project
COPY . .

# Expose port for Railway
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
