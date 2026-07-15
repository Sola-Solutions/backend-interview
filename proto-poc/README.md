# POC: Protobuf-defined shared Temporal contracts (TypeScript ⇄ Python)

Proof-of-concept for [monorepo#13694](https://github.com/Sola-Solutions/monorepo/issues/13694):
use **Protobuf to define the data contracts** for Temporal workflows/activities
so the *same* schema is shared across TypeScript and Python workers.

It demonstrates the two halves the issue scopes the work to:

1. **Protobuf → payload contract.** Workflow args, return values, signal
   payloads, and query results are all protobuf messages defined once in
   `proto/` and code-generated into both languages. Temporal's `DataConverter`
   serializes them as `binary/protobuf` with a `messageType` metadata field.
   That identical `(encoding, messageType)` pair on both SDKs **is** the
   cross-language interop contract.
2. **A shared names registry → topology.** Protobuf can't express Temporal
   topology (workflow-type / task-queue / signal / query *names*), so those stay
   string conventions — kept in one `contract/names.json` both languages read.

## What it proves (verified end-to-end)

A **TypeScript client** starts a workflow hosted by a **Python worker**, with no
shared workflow code — only the shared `.proto` + names registry:

```
$ npm run client          # (TS) → Python worker on task queue 'greeting-poc'
Started workflow greeting-ts-... on 'greeting-poc'
Query status -> cheers_received=1 greeted=true
Result -> message='Bonjour, Grace!' handled_by='python-worker' cheers_received=1
```

Inspecting that workflow's history confirms the wire format is genuinely
protobuf, encoded in TS and decoded in Python off the same `messageType`:

```
encoding=binary/protobuf   messageType=sola.temporal.greeting.v1.GreetingRequest    (TS arg  → Python)
encoding=binary/protobuf   messageType=sola.temporal.greeting.v1.CheerSignal        (TS signal → Python)
encoding=binary/protobuf   messageType=sola.temporal.greeting.v1.GreetingResponse   (Python return → TS)
```

The Python client (`python -m sola_temporal_poc.client`) exercises the same
workflow Python→Python as a baseline.

## Layout

```
proto-poc/
├── proto/                         # single schema source of truth
│   ├── sola/temporal/greeting/v1/greeting.proto   # Request/Response/Signal/Query messages
│   ├── buf.yaml                   # production lint + breaking-change gate (issue plan §1)
│   └── buf.gen.yaml               # production `buf generate` fan-out
├── contract/names.json            # shared names registry (issue plan §5)
├── python/                        # Python worker + client (issue plan §4)
│   ├── sola_temporal_poc/
│   │   ├── converter.py           # proto-first composite DataConverter
│   │   ├── workflows.py           # GreetingWorkflow (proto args/return/signal/query)
│   │   ├── worker.py / client.py
│   │   └── contract.py            # loads ../../contract/names.json
│   ├── gen.sh                     # install-free codegen (grpcio-tools' protoc)
│   └── requirements.txt
└── ts/                            # TS client (issue plan §2–3)
    ├── src/
    │   ├── data-converter.ts      # proto-first composite, loaded by module path (sandbox-safe)
    │   ├── messages.ts            # typed message constructors
    │   ├── client.ts              # starts the Python-hosted workflow by string name
    │   └── contract.ts            # loads ../../contract/names.json
    ├── gen.sh                     # install-free codegen (protobufjs-cli, route "a")
    └── package.json
```

## Design decisions (mapping to the issue's open questions)

- **Encoding:** `binary/protobuf` (the issue's interop recommendation). Both
  composites put the binary-proto converter *first* so it wins on encode; both
  also keep the JSON-proto + JSON-plain converters so either side can still
  *decode* the other's payloads and non-proto values fall back to JSON.
- **TS codegen:** route **(a)** — protobufjs static codegen — per the issue's
  recommendation to start there. The `pbjs -t json-module` output is a
  sandbox-safe protobufjs `Root` that the SDK's proto converters reflect over;
  the static `.d.ts` provides compile-time field types. No custom converter or
  protobuf-es needed yet.
- **Converter wiring:** the TS converter is supplied **by module path**
  (`payloadConverterPath`) to *both* client and worker, because on the worker it
  loads inside the deterministic workflow sandbox — exactly the constraint the
  issue calls out. The Python converter is a `DataConverter` shared by worker and
  client. Client and worker are byte-for-byte identical on each side.
- **Names registry:** one `names.json` both languages read at import — the
  "generated JSON both sides read" option, so a rename can't silently drift.

## Toolchain note

The issue's production path is **`buf generate`** (see `proto/buf.gen.yaml`),
gated by `buf lint` + `buf breaking` in CI. To keep this POC runnable without
installing `buf`/`protoc`, each language ships an install-free `gen.sh` that
produces equivalent output from its own package manager:

- **TS:** `protobufjs-cli` (`pbjs`/`pbts`) via npm.
- **Python:** the `protoc` bundled inside `grpcio-tools` via pip.

Both are drop-in equivalents to the `buf.gen.yaml` plugins.

---

## Running it

Prereqs: Node ≥18, Python ≥3.8, and the repo's Temporal stack up
(`docker compose up -d` from the repo root — frontend on `localhost:7233`).

### 1. Python worker

```bash
cd proto-poc/python
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
bash gen.sh                                   # generate *_pb2.py
PYTHONPATH=. .venv/bin/python -m sola_temporal_poc.worker
```

### 2a. Python client (baseline, Python → Python)

```bash
cd proto-poc/python
PYTHONPATH=. .venv/bin/python -m sola_temporal_poc.client
```

### 2b. TypeScript client (cross-language, TS → Python)

```bash
cd proto-poc/ts
npm install
npm run gen                                   # generate protobufjs types
npm run client                                # starts the Python-hosted workflow
```

Environment overrides (both languages): `TEMPORAL_ADDRESS` (default
`localhost:7233`), `TEMPORAL_NAMESPACE` (default `default`).

## Rollout caveats (from the issue, unchanged by this POC)

Swapping a `DataConverter` is a **wire-format change**: client + worker for a
queue must deploy together, and an in-flight JSON history can't have its
converter swapped mid-replay. Pilot on the already-cross-language queues
(`pydata-processing`, DSPy) before TS-only queues. This POC is a greenfield
queue, so it sidesteps migration — that part still needs a real plan.
