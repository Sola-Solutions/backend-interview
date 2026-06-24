// v2 of the activities-examples workflows.
//
// This is the "new code" half of the worker-versioning demo. It is a drop-in
// replacement for ./workflows with a deliberate behavioral change so a rollout
// is observable:
//   - httpWorkflow tags its result with the version, and
//   - ExecuteCoinFlipsAndRequireTwoHeads requires THREE heads instead of two.
//
// Because the worker registers with defaultVersioningBehavior: PINNED, workflows
// started on v1 finish on v1 while new workflows run here on v2.
import { ApplicationFailure, proxyActivities } from '@temporalio/workflow';
import type * as activities from './activities';

const { makeHTTPRequest, generateCoin, flipCoin } = proxyActivities<typeof activities>({
  retry: {
    initialInterval: '50 milliseconds',
    maximumAttempts: 2,
  },
  startToCloseTimeout: '30 seconds',
});

export async function httpWorkflow(): Promise<string> {
  const answer = await makeHTTPRequest();
  return `The answer is ${answer} (v2)`;
}

export async function ExecuteCoinFlipsAndRequireTwoHeads(): Promise<{ success: boolean }> {
  // v2: require three heads in a row instead of two.
  const numberOfFlips = 3;
  const coin = await generateCoin();

  for (let i = 0; i < numberOfFlips; i++) {
    const result = await flipCoin(coin);
    if (result === 'tails') {
      // Retryable error
      throw ApplicationFailure.retryable('Got tails on coin flip');
    }
  }

  return { success: true };
}
