import { Client } from '@temporalio/client';
import { asyncActivityWorkflow, httpWorkflow, flipCoins } from './workflows';

async function runDefaultExamples(): Promise<void> {
  const client = new Client();

  let result = await client.workflow.execute(httpWorkflow, {
    taskQueue: 'activities-examples',
    workflowId: 'activities-examples',
  });
  console.log(result); // 'The answer is 42'

  result = await client.workflow.execute(asyncActivityWorkflow, {
    taskQueue: 'activities-examples',
    workflowId: 'activities-examples',
  });
  console.log(result);
}

const runCoinFlips = async () => {
  const client = new Client();
  const result = await client.workflow.execute(flipCoins, {
    taskQueue: 'activities-examples',
    workflowId: 'activities-examples',
    retry: {
      maximumAttempts: 5,
    },
  });
  console.log(result);
};

const main = async () => {
  const workflowName = process.argv.at(2);

  if (workflowName === 'flipcoins') {
    await runCoinFlips();
  } else {
    await runDefaultExamples();
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
