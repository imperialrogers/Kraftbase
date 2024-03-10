# Use the official Node.js 18 Alpine image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy only the package.json and package-lock.json files to the working directory
COPY  . .

# Install dependencies (will be cached if package.json and package-lock.json haven't changed)
RUN npm install

# Copy the entire application code into the working directory
COPY . .

# Expose port 8080
EXPOSE 8080

# Command to run the application
CMD [ "npm", "start"]