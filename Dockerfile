# Use a lightweight base image
FROM debian:latest

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential cmake g++ pkg-config \
    libpoppler-glib-dev poppler-utils \
    libfontforge-dev libglib2.0-dev \
    libcairo2-dev libjpeg-dev libpng-dev \
    git wget curl

# Install Node.js and npm (using NodeSource)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Verify installations
RUN node -v && npm -v

# Clone and build pdf2htmlEX from source
RUN git clone --depth=1 https://github.com/pdf2htmlEX/pdf2htmlEX.git /opt/pdf2htmlEX && \
    cd /opt/pdf2htmlEX && \
    cmake . && make && make install

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies if needed
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Set default command (adjust based on your Node.js app)
CMD ["npm", "start"]