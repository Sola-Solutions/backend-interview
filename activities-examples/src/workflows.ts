import { ApplicationFailure, proxyActivities } from '@temporalio/workflow';
import type * as activities from './activities';

const {
  makeHTTPRequest,
  completeSomethingAsync,
  findCoin,
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

export async function asyncActivityWorkflow(): Promise<string> {
  const answer = await completeSomethingAsync();
  return `The Peon says: ${answer}`;
}

export async function flipCoins(): Promise<{ success: boolean }> {
  const numberOfFlips = 2;
  const coin = await findCoin();

  for (let i = 0; i < numberOfFlips; i++) {
    const result = await flipCoin(coin);
    if (result === 'tails') {
      // Retryable error
      throw ApplicationFailure.retryable('Got tails on coin flip');
    }
  }

  return { success: true };
}
