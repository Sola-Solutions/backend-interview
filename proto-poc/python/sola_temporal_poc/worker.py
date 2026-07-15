"""Python worker hosting GreetingWorkflow with the proto-first DataConverter.

Run:  python -m sola_temporal_poc.worker
Env:  TEMPORAL_ADDRESS (default localhost:7233), TEMPORAL_NAMESPACE (default 'default')
"""

import asyncio
import os

from temporalio.client import Client
from temporalio.worker import Worker

from .contract import GREETING_TASK_QUEUE
from .converter import proto_data_converter
from .workflows import GreetingWorkflow


async def main() -> None:
    address = os.environ.get("TEMPORAL_ADDRESS", "localhost:7233")
    namespace = os.environ.get("TEMPORAL_NAMESPACE", "default")

    client = await Client.connect(
        address, namespace=namespace, data_converter=proto_data_converter
    )
    worker = Worker(
        client,
        task_queue=GREETING_TASK_QUEUE,
        workflows=[GreetingWorkflow],
    )
    print(
        f"Python worker running on task queue '{GREETING_TASK_QUEUE}' "
        f"(address={address}, namespace={namespace})"
    )
    await worker.run()


if __name__ == "__main__":
    asyncio.run(main())
