import { Client } from '@temporalio/client';
import { ExecuteCoinFlipsAndRequireTwoHeads, httpWorkflow } from './workflows';

async function runDefaultExamples(): Promise<void> {
  const client = new Client();

  const result = await client.workflow.execute(httpWorkflow, {
    taskQueue: 'demo',
    workflowId: 'activities-examples',
  });
  console.log(result); // 'The answer is 42'
}

const runCoinFlips = async () => {
  const client = new Client();
  const result = await client.workflow.execute(ExecuteCoinFlipsAndRequireTwoHeads, {
    taskQueue: 'demo',
    workflowId: 'activities-examples',
    retry: {
      maximumAttempts: 1,
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
