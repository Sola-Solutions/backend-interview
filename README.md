# Prerequisites
Please have all of the following installed before the interview:
- [Node.js](https://nodejs.org/en/download)
- [Docker Engine](https://docs.docker.com/engine/install/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)
- [gRPCurl](https://github.com/fullstorydev/grpcurl?tab=readme-ov-file#installation)

Install one of tools for kubernetes for local development:
- [kind](https://kind.sigs.k8s.io/docs/user/quick-start)
- [minikube](https://minikube.sigs.k8s.io/docs/start)
- [k3d](https://k3d.io/v5.4.7/#installation)

or some other k8s emulator suitable for *local* development.


# Try out Temporal with docker-compose
1. Spin up services
```
docker-compose up
```

2. Check the Temporal API:
```sh
brew install grpcurl
grpcurl -plaintext localhost:7233 list
```

3. Navigate to `localhost:8080` to see the temporal UI.

# Task
Deploy the Temporal Services described in `docker-compose.yml` to your local kubernetes cluster

# Running a Temporal Workflow
1. `cd activities-example`
2. `npm install` to install dependencies.
3. `npm run start.watch` to start the Worker.
4. In another shell, `npm run workflow` to run the Workflow.

The Workflow should make an HTTP request to httpbin.org and then return:
```
The answer is 42
```
