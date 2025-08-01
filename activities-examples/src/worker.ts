import { Worker, NativeConnection } from '@temporalio/worker';
import * as activities from './activities';

async function run() {
  const connection = process.env.TEMPORAL_ADDRESS 
    ? await NativeConnection.connect({ address: process.env.TEMPORAL_ADDRESS })
    : undefined;

  const worker = await Worker.create({
    connection,
    workflowsPath: require.resolve('./workflows'),
    activities,
    taskQueue: 'activities-examples',
  });

  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
