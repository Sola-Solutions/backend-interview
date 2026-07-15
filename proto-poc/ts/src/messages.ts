/**
 * Typed constructors for the shared proto messages.
 *
 * Messages are created from the protobufjs *reflection* Root (the json-module),
 * so each instance carries the `$type` the SDK's proto converter needs to encode
 * it and stamp the right `messageType`. The generated static `.d.ts` is imported
 * TYPE-ONLY — it gives compile-time field checking without pulling the static
 * runtime (proto.js), which would fight the json-module over protobufjs's shared
 * default root.
 */
import type { sola } from './generated/proto';

// json-module's CommonJS export IS a protobufjs Root; `import = require` yields
// it directly (an `import * as` would wrap the Root in a synthetic namespace and
// hide its prototype methods like lookupType).
import jsonModule = require('./generated/json-module');
const root = jsonModule as unknown as { lookupType(name: string): any };

const PKG = 'sola.temporal.greeting.v1';
const GreetingRequestType = root.lookupType(`${PKG}.GreetingRequest`);
const CheerSignalType = root.lookupType(`${PKG}.CheerSignal`);

export type IGreetingRequest = sola.temporal.greeting.v1.IGreetingRequest;
export type IGreetingResponse = sola.temporal.greeting.v1.IGreetingResponse;
export type ICheerSignal = sola.temporal.greeting.v1.ICheerSignal;
export type IGreetingStatus = sola.temporal.greeting.v1.IGreetingStatus;

export const newGreetingRequest = (props: IGreetingRequest): unknown => GreetingRequestType.create(props);
export const newCheerSignal = (props: ICheerSignal): unknown => CheerSignalType.create(props);
