import { ApplicationFailure, log } from '@temporalio/activity';

export interface Coin {
  probabilityOfHeads: number;
}

// We need to make this async to register as an activity
// eslint-disable-next-line @typescript-eslint/require-await
export const findCoin = async (): Promise<Coin> => {
  log.info('Finding coin...');
  const probabilityOfHeads = Math.random() * 100;
  log.info(`Found a coin probability of heads: ${probabilityOfHeads.toFixed(3)}`);
  return { probabilityOfHeads };
};

// We need to make this async to register as an activity
// eslint-disable-next-line @typescript-eslint/require-await
export const flipCoin = async (coin: Coin): Promise<'heads' | 'tails'> => {
  if (coin.probabilityOfHeads > 1.0) {
    throw new ApplicationFailure('Coin probability of heads is greater than 1.0', 'COIN_PROBABILITY_TOO_HIGH', false);
  }

  if (coin.probabilityOfHeads < 0.0) {
    throw new ApplicationFailure('Coin probability of heads is less than 0.0', 'COIN_PROBABILITY_TOO_LOW', true);
  }

  log.info('Flipping coin...');
  const flip = Math.random();
  log.info(`Coin flip result: ${flip}`);
  const result = flip < coin.probabilityOfHeads ? 'heads' : 'tails';
  return result;
};
