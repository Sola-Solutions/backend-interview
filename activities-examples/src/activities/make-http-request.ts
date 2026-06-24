import axios from 'axios';

// The worker version is set per image by CI via the WORKER_VERSION build arg
// (see Dockerfile / the CI matrix). Activities run on the worker (not in the
// workflow sandbox), so they can read process.env. The activity stamps the
// answer with the version that produced it, which makes a versioned rollout
// observable: workflows pinned to v1 return the v1 answer while new workflows
// on v2 return the v2 answer. Defaults to "unversioned" when unset (local dev,
// or an image built without the build arg).
const WORKER_VERSION = process.env.WORKER_VERSION || 'unversioned';

export async function makeHTTPRequest(): Promise<string> {
  const res = await axios.get('http://httpbin.org/get?answer=42');
  const answer = res.data.args.answer;

  return `${answer} (from worker ${WORKER_VERSION})`;
}
