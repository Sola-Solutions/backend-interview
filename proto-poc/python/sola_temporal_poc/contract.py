"""Loads the shared names registry (../../contract/names.json).

Protobuf defines payload schemas but not Temporal topology, so workflow type /
task-queue / signal / query names come from this one JSON that the TS side reads
too — keeping the string conventions in sync across languages.
"""

import json
import pathlib

_NAMES = json.loads(
    (pathlib.Path(__file__).resolve().parents[2] / "contract" / "names.json").read_text()
)

GREETING_TASK_QUEUE: str = _NAMES["taskQueues"]["greeting"]
GREETING_WORKFLOW: str = _NAMES["workflows"]["greeting"]
CHEER_SIGNAL: str = _NAMES["signals"]["cheer"]
STATUS_QUERY: str = _NAMES["queries"]["status"]
