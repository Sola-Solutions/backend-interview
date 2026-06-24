FROM node:bookworm-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Worker version baked into the image: "v1" (default) or "v2". The CI matrix
# builds one image per version; the makeHTTPRequest activity stamps its answer
# with this so the worker-controller can roll between them observably.
ARG WORKER_VERSION=v1
ENV WORKER_VERSION=$WORKER_VERSION

# Start the application
CMD ["node", "lib/worker.js"]
