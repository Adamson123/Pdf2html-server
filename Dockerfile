# Use Debian as the base image
FROM debian:latest

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential cmake g++ pkg-config \
    libpoppler-glib-dev poppler-utils \
    fontforge libglib2.0-dev \
    libcairo2-dev libjpeg-dev libpng-dev \
    git wget curl software-properties-common \
    nodejs npm \
    openjdk-11-jre-headless \
    && rm -rf /var/lib/apt/lists/*  # Clean up APT cache

# Clone the pdf2htmlEX repository
RUN git clone --recursive https://github.com/pdf2htmlEX/pdf2htmlEX.git /pdf2htmlEX

# Navigate to the pdf2htmlEX directory
WORKDIR /pdf2htmlEX

# Install additional dependencies required for pdf2htmlEX
RUN apt-get update && apt-get install -y \
    libfreetype6-dev libfontconfig1-dev \
    libicu-dev libpng-dev libjpeg-dev \
    && rm -rf /var/lib/apt/lists/*  # Clean up APT cache

# Fix missing OpenJDK 8 by forcing an alternative
RUN sed -i 's/openjdk-8-jre-headless/openjdk-11-jre-headless/g' ./buildScripts/getBuildToolsApt

# Build pdf2htmlEX
RUN ./buildScripts/getBuildToolsApt \
    && ./buildScripts/buildInstallLocallyApt

# Install npm dependencies (if needed)
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the application
COPY . .

# Set pdf2htmlEX as the default command
ENTRYPOINT ["pdf2htmlEX"]