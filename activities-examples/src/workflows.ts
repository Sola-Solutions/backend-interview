import { ApplicationFailure, proxyActivities } from '@temporalio/workflow';
import type * as activities from './activities';

const {
  makeHTTPRequest,
  generateCoin,
  flipCoin,
  // cancellableFetch  // todo: demo usage
} = proxyActivities<typeof activities>({
  retry: {
    initialInterval: '50 milliseconds',
    maximumAttempts: 2,
  },
  startToCloseTimeout: '30 seconds',
});

export async function httpWorkflow(): Promise<string> {
  const answer = await makeHTTPRequest();
  return `The answer is ${answer}`;
}

export async function ExecuteCoinFlipsAndRequireTwoHeads(): Promise<{ success: boolean }> {
  const numberOfFlips = 2;
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
