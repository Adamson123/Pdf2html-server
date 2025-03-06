FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    libfontconfig1 \
    libcairo2 \
    libjpeg-turbo8 \
    wget \
    curl \
    dpkg \
    nodejs \
    npm

RUN wget https://github.com/pdf2htmlEX/pdf2htmlEX/releases/download/v0.18.8.rc1/pdf2htmlEX-0.18.8.rc1-master-20200630-Ubuntu-bionic-x86_64.deb \
    && mv pdf2htmlEX-0.18.8.rc1-master-20200630-Ubuntu-bionic-x86_64.deb pdf2htmlEX.deb \
    && dpkg -i pdf2htmlEX.deb || apt-get install -f -y

WORKDIR /app

# Install Node.js & npm from NodeSource (better than Ubuntu repo)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Copy package.json and package-lock.json FIRST
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Optional: Verify node_modules
RUN ls -la node_modules || echo "node_modules is missing!"

EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
