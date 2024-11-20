FROM node:20 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve the React app with serve
FROM node:20

# Set the working directory
WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy the build output to the working directory
COPY --from=build /app/build ./build

# Expose port 3000
EXPOSE 3000

# Start the serve server
CMD ["serve", "-s", "build", "-l", "3000"]