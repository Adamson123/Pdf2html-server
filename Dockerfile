# Use Ubuntu 20.04 as the base image
FROM ubuntu:20.04

# Set environment variables to prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Update and install dependencies
RUN apt-get update && apt-get install -y \
    libfontconfig1 \
    libcairo2 \
    libjpeg-turbo8 \
    wget \
    curl \
    dpkg \
    nodejs \
    npm  

# Download and install pdf2htmlEX
RUN wget https://github.com/pdf2htmlEX/pdf2htmlEX/releases/download/v0.18.8.rc1/pdf2htmlEX-0.18.8.rc1-master-20200630-Ubuntu-bionic-x86_64.deb \
    && mv pdf2htmlEX-0.18.8.rc1-master-20200630-Ubuntu-bionic-x86_64.deb pdf2htmlEX.deb \
    && dpkg -i pdf2htmlEX.deb || apt-get install -f -y  

# Set working directory inside the container
WORKDIR /app

# Copy only package.json (ignore package-lock.json)
COPY package.json ./

# Install dependencies without package-lock.json
RUN npm install --no-package-lock  

# Copy the rest of the app files
COPY . .  

# Expose the port
EXPOSE 3000  

# Start the Node.js server
CMD ["node", "server.js"]