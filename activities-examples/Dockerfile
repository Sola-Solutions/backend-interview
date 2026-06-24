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

# Which workflow bundle this image ships: "v1" (default) or "v2". The CI matrix
# builds one image per variant so the worker-controller can roll between them.
ARG WORKFLOWS_VARIANT=v1
ENV WORKFLOWS_VARIANT=$WORKFLOWS_VARIANT

# Start the application
CMD ["node", "lib/worker.js"]
