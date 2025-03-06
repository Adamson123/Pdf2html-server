# Use Ubuntu as the base image
FROM ubuntu:20.04

# Set non-interactive mode to avoid timezone prompts
ENV DEBIAN_FRONTEND=noninteractive

# Update package manager and install dependencies
RUN apt-get update && apt-get install -y \
    libfontconfig1 \
    libcairo2 \
    libjpeg-turbo8 \
    wget \
    dpkg 

# Download and install pdf2htmlEX
RUN wget https://github.com/pdf2htmlEX/pdf2htmlEX/releases/download/v0.18.8.rc1/pdf2htmlEX-0.18.8.rc1-master-20200630-Ubuntu-bionic-x86_64.deb \
    && dpkg -i pdf2htmlEX-0.18.8.rc1-master-20200630-Ubuntu-bionic-x86_64.deb \
    && apt-get install -f -y

# Set working directory
WORKDIR /app

# Set pdf2htmlEX as the default command
ENTRYPOINT ["pdf2htmlEX"]
CMD ["--help"]