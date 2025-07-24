# Build static assets with Node
FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Final image for serving
FROM python:3.11-slim

# Install Node.js 20.x
RUN apt-get update \
    && apt-get install -y curl gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

WORKDIR /app
COPY --from=build /app /app
# Build frontend assets
RUN npm install \
    && npm run build \
    && npm cache clean --force
RUN rm -rf node_modules
EXPOSE 8000
CMD ["python", "serve.py", "-p", "8000", "--no-browser"]
