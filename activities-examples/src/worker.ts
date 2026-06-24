import { NativeConnection, Worker, WorkerDeploymentOptions } from '@temporalio/worker';
import * as activities from './activities';

const {
  TEMPORAL_ADDRESS,
  TEMPORAL_NAMESPACE,
  TEMPORAL_API_KEY,
  TEMPORAL_TLS,
  // Injected by the temporal-worker-controller for versioned workers.
  TEMPORAL_DEPLOYMENT_NAME,
  TEMPORAL_WORKER_BUILD_ID,
  // Baked into the image per version (see Dockerfile / CI matrix); the
  // makeHTTPRequest activity stamps its answer with this.
  WORKER_VERSION,
} = process.env;

const TASK_QUEUE = 'activities-examples';

// In-cluster the worker-controller injects TEMPORAL_ADDRESS / _NAMESPACE /
// _API_KEY from the Connection resource. Locally these are unset, so we return
// undefined and let the SDK fall back to its default (localhost:7233, no TLS).
async function connect(): Promise<NativeConnection | undefined> {
  if (!TEMPORAL_ADDRESS) {
    return undefined;
  }

  return NativeConnection.connect({
    address: TEMPORAL_ADDRESS,
    // Temporal Cloud requires TLS; an API key implies it.
    tls: TEMPORAL_API_KEY || TEMPORAL_TLS === 'true' ? true : undefined,
    apiKey: TEMPORAL_API_KEY || undefined,
  });
}

// Opt into Worker Versioning (Worker Deployments) when the controller has
// assigned this pod a deployment name + build id. PINNED keeps each workflow on
// the version that started it, so a rollout never breaks running workflows.
// Returns undefined locally (and in any unversioned deployment), leaving the
// worker unversioned.
function getWorkerDeploymentOptions(): WorkerDeploymentOptions | undefined {
  if (!TEMPORAL_DEPLOYMENT_NAME || !TEMPORAL_WORKER_BUILD_ID) {
    return undefined;
  }

  return {
    useWorkerVersioning: true,
    version: {
      deploymentName: TEMPORAL_DEPLOYMENT_NAME,
      buildId: TEMPORAL_WORKER_BUILD_ID,
    },
    defaultVersioningBehavior: 'PINNED',
  };
}

async function run() {
  const connection = await connect();
  const workerDeploymentOptions = getWorkerDeploymentOptions();

  const worker = await Worker.create({
    connection,
    namespace: TEMPORAL_NAMESPACE,
    workflowsPath: require.resolve('./workflows'),
    activities,
    taskQueue: TASK_QUEUE,
    workerDeploymentOptions,
  });

  console.log(
    `Worker starting on task queue "${TASK_QUEUE}" (version ${WORKER_VERSION ?? 'v1'})` +
      (workerDeploymentOptions
        ? ` [versioned: ${TEMPORAL_DEPLOYMENT_NAME}.${TEMPORAL_WORKER_BUILD_ID}]`
        : ' [unversioned]'),
  );

  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
