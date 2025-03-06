# Use Ubuntu 20.04 as the base image
FROM ubuntu:20.04

# Set non-interactive mode to avoid prompts
ENV DEBIAN_FRONTEND=noninteractive

# Update package list and install dependencies
RUN apt-get update && apt-get install -y \
    libfontconfig1 libcairo2 libjpeg-turbo8 wget curl \
    build-essential git npm nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Fix any broken dependencies
RUN apt-get --fix-broken install -y

# Download latest pdf2htmlEX Debian package
RUN wget https://github.com/pdf2htmlEX/pdf2htmlEX/releases/download/v0.18.8.rc1/pdf2htmlEX-0.18.8.rc1-master-20200630-Ubuntu-bionic-x86_64.deb -O pdf2htmlEX.deb

# Install pdf2htmlEX
RUN apt-get install -y ./pdf2htmlEX.deb || (dpkg -i pdf2htmlEX.deb && apt-get install -f -y)

# Verify pdf2htmlEX installation
RUN pdf2htmlEX -v

# Set working directory
WORKDIR /app

# Install npm dependencies (if a package.json exists)
COPY package.json package-lock.json* ./
RUN if [ -f package.json ]; then npm install; fi

# Copy app files
COPY . .

# Set pdf2htmlEX as the default command
ENTRYPOINT ["pdf2htmlEX"]