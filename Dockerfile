# Build static assets with Node
FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Final image for serving
FROM python:3.11-slim
WORKDIR /app
COPY --from=build /app /app
RUN rm -rf node_modules
EXPOSE 8000
CMD ["python", "-m", "http.server", "8000"]
