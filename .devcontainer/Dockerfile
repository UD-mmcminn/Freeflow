FROM mcr.microsoft.com/devcontainers/javascript-node:20

ARG USERNAME=vscode

# Native build deps + headless browser/canvas requirements
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        build-essential \
        python3 \
        pkg-config \
        git \
        curl \
        chromium \
        libcairo2-dev \
        libpango1.0-dev \
        libjpeg-dev \
        libgif-dev \
        librsvg2-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Use pnpm v9 via corepack
RUN corepack enable && corepack prepare pnpm@9 --activate

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV NODE_OPTIONS=--max-old-space-size=8192

# Ensure pnpm cache dirs are writable by the dev user
RUN mkdir -p /home/${USERNAME}/.local/share/pnpm \
    && chown -R ${USERNAME}:${USERNAME} /home/${USERNAME}/.local/share

USER ${USERNAME}
