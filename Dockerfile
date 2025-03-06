# Use Ubuntu as the base image
FROM ubuntu:20.04

# Set environment variable to avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
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

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies (without package-lock.json)
COPY package.json ./
RUN npm install --no-package-lock  

# Copy all other files into the container
COPY . .  

# Ensure node_modules is not ignored
RUN ls -la node_modules || echo "node_modules is missing!"

# Expose the application port
EXPOSE 3000  

# Run the server
CMD ["node", "server.js"]