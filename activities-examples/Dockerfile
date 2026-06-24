FROM node:bookworm-slim

# node:bookworm-slim ships without the ca-certificates package, so /etc/ssl/certs
# is empty. The Temporal SDK's native gRPC core (Rust/tonic via rustls-native-certs)
# loads the OS trust store to verify Temporal Cloud's TLS certificate; without it
# the worker dies on startup with:
#   TransportError: tonic::transport::Error(Transport, NativeCertsNotFound)
# Install the CA bundle so the worker can establish its TLS connection.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

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
