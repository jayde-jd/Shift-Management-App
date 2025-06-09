# Use official Node.js LTS image
FROM node:18

# Set working directory
WORKDIR /app

# Copy the rest of the backend source code
COPY . .

# Install dependencies
RUN npm install

# Expose the backend port (default 3000, change if needed)
EXPOSE 8080

# Start the backend server
CMD ["node", "index.js"]
