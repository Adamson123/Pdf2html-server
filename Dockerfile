# Use Ubuntu 20.04 as the base image
FROM ubuntu:20.04

# Set environment variables to avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Update system and install required dependencies
RUN apt-get update && apt-get install -y \
    libfontconfig1 \
    libcairo2 \
    libjpeg-turbo8 \
    wget \
    curl \
    dpkg \
    build-essential \
    python3 \
    && apt-get clean

# Install Node.js & npm from NodeSource (better than Ubuntu repo)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@latest

# Download and install pdf2htmlEX
RUN wget https://github.com/pdf2htmlEX/pdf2htmlEX/releases/download/v0.18.8.rc1/pdf2htmlEX-0.18.8.rc1-master-20200630-Ubuntu-bionic-x86_64.deb \
    && mv pdf2htmlEX-0.18.8.rc1-master-20200630-Ubuntu-bionic-x86_64.deb pdf2htmlEX.deb \
    && dpkg -i pdf2htmlEX.deb || apt-get install -f -y

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first to optimize caching
COPY package*.json ./

# Install Node.js dependencies
RUN npm install --production

# Copy remaining application files
COPY . .

# Check if node_modules exists
RUN ls -la node_modules || echo "node_modules is missing!"

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]