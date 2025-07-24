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
COPY . /app

# Build frontend assets
RUN npm install \
    && npm run build \
    && npm cache clean --force

EXPOSE 8000
CMD ["python", "-m", "http.server", "8000"]
