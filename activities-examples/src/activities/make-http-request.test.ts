import axios from 'axios';
import { makeHTTPRequest } from './index';

jest.mock('axios');
const mockedAxios = jest.mocked(axios, true);

test('makeHTTPRequest stamps the answer with the worker version', async () => {
  mockedAxios.get.mockResolvedValue({ data: { args: { answer: '88' } } });
  const result = await makeHTTPRequest();
  // WORKER_VERSION is unset under test, so it defaults to "unversioned".
  expect(result).toBe('88 (from worker unversioned)');
});
