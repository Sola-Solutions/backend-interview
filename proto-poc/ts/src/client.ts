/**
 * TypeScript client for the Python-hosted GreetingWorkflow.
 *
 * This is the issue's headline scenario: a TS caller dispatching onto a queue
 * owned by a Python worker, with NO shared workflow code — only the shared
 * .proto contract + names registry. The TS SDK encodes the GreetingRequest as
 * binary/protobuf; the Python worker decodes it via the same messageType; the
 * GreetingResponse makes the round trip back. Drift on either side would now be
 * a codegen/compile failure instead of a silent runtime break.
 *
 * Run:  npm run client   (after `npm run gen` and with the Python worker up)
 */
import { Client, Connection } from '@temporalio/client';

import { CHEER_SIGNAL, GREETING_TASK_QUEUE, GREETING_WORKFLOW, STATUS_QUERY } from './contract';
import { IGreetingResponse, IGreetingStatus, newCheerSignal, newGreetingRequest } from './messages';

async function main(): Promise<void> {
  const address = process.env.TEMPORAL_ADDRESS ?? 'localhost:7233';
  const connection = await Connection.connect({ address });
  const client = new Client({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE ?? 'default',
    // Same converter module the worker loads — identical on both ends.
    dataConverter: { payloadConverterPath: require.resolve('./data-converter') },
  });

  // Workflow type is a STRING from the shared registry (topology isn't in proto).
  const request = newGreetingRequest({ name: 'Grace', language: 'fr' });
  const handle = await client.workflow.start(GREETING_WORKFLOW, {
    args: [request],
    taskQueue: GREETING_TASK_QUEUE,
    workflowId: `greeting-ts-${Date.now()}`,
  });
  console.log(`Started workflow ${handle.workflowId} on '${GREETING_TASK_QUEUE}'`);

  // Signal payload is also a proto message.
  await handle.signal(CHEER_SIGNAL, newCheerSignal({ sender: 'ts-client', volume: 9 }));

  // Query result is a proto message too.
  const status = (await handle.query(STATUS_QUERY)) as IGreetingStatus;
  console.log(`Query status -> cheers_received=${status.cheersReceived} greeted=${status.greeted}`);

  const result = (await handle.result()) as IGreetingResponse;
  console.log(
    `Result -> message='${result.message}' handled_by='${result.handledBy}' ` +
      `cheers_received=${result.cheersReceived}`,
  );

  await connection.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
