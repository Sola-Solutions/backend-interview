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

# Worker version baked into the image. CI sets this per image via
# `--build-arg WORKER_VERSION=<version>` (the publish matrix builds unversioned,
# v1 and v2); the makeHTTPRequest activity stamps its answer with it so the
# worker-controller can roll between versions observably. Defaults to
# "unversioned" for a plain build with no build arg.
ARG WORKER_VERSION=unversioned
ENV WORKER_VERSION=$WORKER_VERSION

# Start the application
CMD ["node", "lib/worker.js"]
