FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production || npm install --only=production

# Copy server code
COPY proxy-server.js ./

EXPOSE 3001

CMD ["node", "proxy-server.js"]
