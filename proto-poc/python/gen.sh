#!/usr/bin/env bash
# Install-free Python codegen for the POC: uses the protoc bundled inside
# grpcio-tools (pip) instead of a system protoc / buf. Emits *_pb2.py + .pyi
# into sola_temporal_poc/generated/. Production path is `buf generate`.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
PROTO_ROOT="$HERE/../proto"
OUT="$HERE/sola_temporal_poc/generated"

# Prefer the project venv's python if present; override with $PYTHON.
PYTHON="${PYTHON:-$( [ -x "$HERE/.venv/bin/python" ] && echo "$HERE/.venv/bin/python" || echo python3 )}"

mkdir -p "$OUT"
"$PYTHON" -m grpc_tools.protoc \
  --proto_path="$PROTO_ROOT" \
  --python_out="$OUT" \
  --pyi_out="$OUT" \
  "$PROTO_ROOT"/sola/temporal/greeting/v1/greeting.proto

# Make the generated package importable (protoc emits nested dirs without
# __init__.py files).
find "$OUT/sola" -type d -exec touch {}/__init__.py \;
touch "$OUT/__init__.py"
echo "Generated Python protobuf types into $OUT"
