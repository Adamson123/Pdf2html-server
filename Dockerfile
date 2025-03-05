# Use Ubuntu as the base image
FROM ubuntu:22.04

# Update package manager and install dependencies
RUN apt-get update && apt-get upgrade -y && apt-get install -y \
    sudo \
    gzip \
    zip \
    git \
    m4 \
    poppler-utils \
    fontforge \
    build-essential \
    cmake \
    g++ \
    pkg-config \
    libpoppler-glib-dev \
    curl

# Install Node.js and npm (using NodeSource)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Verify installations
RUN node -v && npm -v

# Clone the pdf2htmlEX repository
RUN git clone https://github.com/pdf2htmlEX/pdf2htmlEX.git /pdf2htmlEX

# Navigate to the pdf2htmlEX directory
WORKDIR /pdf2htmlEX

# Build pdf2htmlEX locally
RUN ./buildScripts/getBuildToolsApt && ./buildScripts/buildInstallLocallyApt

# Set working directory for the app
WORKDIR /app

# Copy package.json and install npm dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Set the default command to npm start
CMD ["npm", "start"]