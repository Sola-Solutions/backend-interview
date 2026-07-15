# Uploaded workflow run — decoded payloads

Raw Temporal histories exported from local Temporal (`localhost:7233`) with `temporal workflow show --output json`. Each cross-boundary payload is decoded below from its `binary/protobuf` bytes using the *shared* proto contract — proving the value encoded by one language decodes correctly by the other.


## TypeScript client → Python worker (cross-language)

| # | event | direction | encoding | messageType | decoded value |
|---|---|---|---|---|---|
| 1 | WorkflowExecutionStarted | ARG (client→worker) | `binary/protobuf` | `sola.temporal.greeting.v1.GreetingRequest` | name='Grace' language='fr' |
| 2 | WorkflowExecutionSignaled | SIGNAL (client→worker) | `binary/protobuf` | `sola.temporal.greeting.v1.CheerSignal` | sender='ts-client' volume=9 |
| 3 | WorkflowExecutionCompleted | RETURN (worker→client) | `binary/protobuf` | `sola.temporal.greeting.v1.GreetingResponse` | message='Bonjour, Grace!' handled_by='python-worker' cheers_received=1 |

## Python client → Python worker (baseline)

| # | event | direction | encoding | messageType | decoded value |
|---|---|---|---|---|---|
| 1 | WorkflowExecutionStarted | ARG (client→worker) | `binary/protobuf` | `sola.temporal.greeting.v1.GreetingRequest` | name='Ada' language='es' |
| 2 | WorkflowExecutionSignaled | SIGNAL (client→worker) | `binary/protobuf` | `sola.temporal.greeting.v1.CheerSignal` | sender='python-client' volume=11 |
| 3 | WorkflowExecutionCompleted | RETURN (worker→client) | `binary/protobuf` | `sola.temporal.greeting.v1.GreetingResponse` | message='Hola, Ada!' handled_by='python-worker' cheers_received=1 |
