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
  // Selects which workflow bundle this image ships (see Dockerfile / CI matrix).
  WORKFLOWS_VARIANT,
} = process.env;

const TASK_QUEUE = 'activities-examples';

async function run() {
  // In-cluster the worker-controller injects TEMPORAL_ADDRESS / _NAMESPACE /
  // _API_KEY from the Connection resource. Locally these are unset and we fall
  // back to the SDK default (localhost:7233, no TLS).
  const connection = TEMPORAL_ADDRESS
    ? await NativeConnection.connect({
        address: TEMPORAL_ADDRESS,
        // Temporal Cloud requires TLS; an API key implies it.
        tls: TEMPORAL_API_KEY || TEMPORAL_TLS === 'true' ? true : undefined,
        apiKey: TEMPORAL_API_KEY || undefined,
      })
    : undefined;

  // Opt into Worker Versioning (Worker Deployments) when the controller has
  // assigned this pod a deployment name + build id. PINNED keeps each workflow
  // on the version that started it, so a rollout never breaks running workflows.
  const workerDeploymentOptions: WorkerDeploymentOptions | undefined =
    TEMPORAL_DEPLOYMENT_NAME && TEMPORAL_WORKER_BUILD_ID
      ? {
          useWorkerVersioning: true,
          version: {
            deploymentName: TEMPORAL_DEPLOYMENT_NAME,
            buildId: TEMPORAL_WORKER_BUILD_ID,
          },
          defaultVersioningBehavior: 'PINNED',
        }
      : undefined;

  const worker = await Worker.create({
    connection,
    namespace: TEMPORAL_NAMESPACE,
    workflowsPath:
      WORKFLOWS_VARIANT === 'v2' ? require.resolve('./workflows.v2') : require.resolve('./workflows'),
    activities,
    taskQueue: TASK_QUEUE,
    workerDeploymentOptions,
  });

  console.log(
    `Worker starting on task queue "${TASK_QUEUE}"` +
      (workerDeploymentOptions
        ? ` (versioned: ${TEMPORAL_DEPLOYMENT_NAME}.${TEMPORAL_WORKER_BUILD_ID}, workflows=${
            WORKFLOWS_VARIANT ?? 'v1'
          })`
        : ' (unversioned)'),
  );

  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
