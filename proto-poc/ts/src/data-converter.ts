/**
 * Shared protobuf PayloadConverter for the TS side (issue plan steps 2 & 3).
 *
 * This module is loaded BY MODULE PATH (`payloadConverterPath`) by both the
 * client and the worker, so the exact same converter runs on both ends of every
 * call — the issue's "byte-for-byte identical on client + worker" requirement.
 * On the worker it is imported inside the deterministic workflow sandbox, which
 * is why the protobuf root must be sandbox-safe: the `pbjs -t json-module`
 * output uses protobufjs/light and touches no node/DOM APIs at import time.
 *
 * We build the composite by hand (rather than DefaultPayloadConverterWithProtobufs)
 * for ONE reason: converter order decides the ENCODE encoding, and the issue
 * requires a single encoding used identically across both languages. Putting the
 * binary-proto converter first makes proto messages go out as `binary/protobuf`
 * — matching the Python side's proto-first composite exactly. Both languages
 * still keep the JSON-proto + JSON-plain converters for decoding, so either can
 * read whatever the other wrote.
 */
import {
  BinaryPayloadConverter,
  CompositePayloadConverter,
  JsonPayloadConverter,
  UndefinedPayloadConverter,
} from '@temporalio/common';
import {
  patchProtobufRoot,
  ProtobufBinaryPayloadConverter,
  ProtobufJsonPayloadConverter,
} from '@temporalio/common/lib/protobufs';

// The json-module export is itself a protobufjs Root (built from the shared
// .proto). `import = require` yields the Root directly; patchProtobufRoot makes
// it safe to hand to the SDK converters.
import jsonModule = require('./generated/json-module');

const protobufRoot = patchProtobufRoot(jsonModule as unknown as Record<string, unknown>);

export const payloadConverter = new CompositePayloadConverter(
  new UndefinedPayloadConverter(),
  new BinaryPayloadConverter(),
  // Interop encoding: proto message -> binary/protobuf + messageType metadata.
  new ProtobufBinaryPayloadConverter(protobufRoot),
  // Also decode json/protobuf if a peer chose the readable encoding.
  new ProtobufJsonPayloadConverter(protobufRoot),
  // Fallback for everything that isn't a protobuf message.
  new JsonPayloadConverter(),
);
