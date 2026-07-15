# Uploaded workflow run artifacts

Evidence from an actual cross-language run against **local Temporal**
(`localhost:7233`, the repo's docker-compose stack).

| file | what it is |
|---|---|
| [`DECODED-SUMMARY.md`](./DECODED-SUMMARY.md) | Human-readable table: each cross-boundary payload decoded from its `binary/protobuf` bytes via the shared proto contract. |
| `history-ts-to-python.json` | Full Temporal history for the **TypeScript client → Python worker** execution (`temporal workflow show --output json`). |
| `history-python-to-python.json` | Full Temporal history for the **Python client → Python worker** baseline execution. |

## Headline result (TS client → Python worker)

```
Started workflow greeting-ts-... on 'greeting-poc'
Query status -> cheers_received=1 greeted=true
Result -> message='Bonjour, Grace!' handled_by='python-worker' cheers_received=1
```

The TS client started `GreetingWorkflow` (hosted by the Python worker) by string
name, passed a protobuf argument, signalled a protobuf `CheerSignal`, queried a
protobuf `GreetingStatus`, and received a decoded protobuf `GreetingResponse` —
all off the same `.proto` contract, encoded `binary/protobuf` with matching
`messageType` on both sides.

## Note on the query result

Temporal query requests/responses are **not** recorded in workflow history (they
run out-of-band), so the histories here show the **argument**, **signal**, and
**return** payloads. The query result (`GreetingStatus`) is exercised live and
printed in the client output above; its proto type is validated by the same
converter that handles the other three.

## Reproduce

See [`../README.md`](../README.md) — start the Python worker, then run
`npm run client` (TS) or `python -m sola_temporal_poc.client` (Python).
