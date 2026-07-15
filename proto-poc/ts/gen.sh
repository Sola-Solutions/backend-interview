#!/usr/bin/env bash
# Install-free TS codegen for the POC: uses protobufjs-cli (npm), route (a) from
# the issue — protobufjs static codegen that plugs straight into the SDK's
# DefaultPayloadConverterWithProtobufs. No system protoc / buf needed.
# Production path is `buf generate` (see ../proto/buf.gen.yaml).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
PROTOS="$HERE/../proto/sola/temporal/greeting/v1/greeting.proto"
OUT="$HERE/src/generated"
PBJS="$HERE/node_modules/.bin/pbjs"
PBTS="$HERE/node_modules/.bin/pbts"

mkdir -p "$OUT"

# 1. json-module: a sandbox-safe protobufjs Root (pure data + protobufjs/light,
#    no fs/DOM at import) — this is what the payload converter reflects over.
"$PBJS" -t json-module -w commonjs -o "$OUT/json-module.js" -p "$HERE/../proto" "$PROTOS"

# 2. static-module + types: typed message classes for building/consuming
#    messages with compile-time safety in client/worker code.
"$PBJS" -t static-module -o "$OUT/proto.js" -p "$HERE/../proto" "$PROTOS"
"$PBTS" -o "$OUT/proto.d.ts" "$OUT/proto.js"

echo "Generated TS protobuf types into $OUT"
