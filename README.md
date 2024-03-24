# Prerequisites
- [NodeJs](https://nodejs.org/en/download)
- [Docker Engine](https://docs.docker.com/engine/install/)
- [minikube](https://minikube.sigs.k8s.io/docs/start/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)

# Task
Deploy the Temporal Services desribed in `docker-compose.yml` to `minikube`

## Starter
1. Start a minikube cluster
```sh
minikube start
```
2. Open up the minikube dashboard
```sh
minikube dashboard
```

# Running a Temporal Workflow
1. `cd activites-example`
1. `npm install` to install dependencies.
2. `npm run start.watch` to start the Worker.
3. In another shell, `npm run workflow` to run the Workflow.
4. The Workflow should make an HTTP request to httpbin.org and then return:
```
The answer is 42
```
