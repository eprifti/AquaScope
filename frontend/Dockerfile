# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Accept build args for Vite env vars
ARG VITE_API_URL=""

# Set as env vars so Vite picks them up during build
ENV VITE_API_URL=$VITE_API_URL

# Copy package files (context is repo root)
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source files
COPY frontend/ .

# Copy shared species-traits data (imported by compatibilityData.ts)
COPY data/species-traits.json /data/species-traits.json

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
