# Dockerfile

# --- Stage 1: The Builder ---
# This stage installs dependencies and builds the Next.js app.
FROM node:22-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker caching
COPY package*.json ./
RUN npm install

# Copy the rest of your application's source code
COPY . .

# Build the Next.js application for production
RUN npm run build

# --- Stage 2: The Runner ---
# This stage takes the build output from the 'builder' stage and runs the app.
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy the optimized production build from the 'builder' stage
COPY --from=builder /app/.next ./.next

# Copy node_modules from the 'builder' stage
COPY --from=builder /app/node_modules ./node_modules

# Copy package.json to know which command to run for `npm start`
COPY package.json ./

# The Next.js app runs on port 3000 by default. Expose it.
EXPOSE 3000

# The command to start the Next.js production server
CMD ["npm", "start"]