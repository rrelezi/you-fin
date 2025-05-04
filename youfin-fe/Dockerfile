FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN apk add --no-cache python3 make g++ && \
    npm install -g npm@10.2.4 && \
    npm install

# Copy the rest of the application
COPY . .

EXPOSE 5173

ENV HOST=0.0.0.0
ENV PORT=5173

# Start the application
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 