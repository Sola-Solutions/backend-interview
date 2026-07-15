/**
 * Loads the shared names registry (../../contract/names.json) — the same file
 * the Python side reads. Protobuf can't express Temporal topology, so workflow
 * type / task-queue / signal / query names live here as the single source of
 * truth, keeping the string conventions in sync across languages.
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

const names = JSON.parse(readFileSync(resolve(__dirname, '../../contract/names.json'), 'utf8'));

export const GREETING_TASK_QUEUE: string = names.taskQueues.greeting;
export const GREETING_WORKFLOW: string = names.workflows.greeting;
export const CHEER_SIGNAL: string = names.signals.cheer;
export const STATUS_QUERY: string = names.queries.status;
