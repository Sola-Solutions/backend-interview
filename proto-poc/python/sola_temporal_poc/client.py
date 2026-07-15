"""Python client for GreetingWorkflow — proves the Python <-> Python path and
gives the worker something to talk to without the TS side.

Run:  python -m sola_temporal_poc.client
"""

import asyncio
import os
import uuid

from temporalio.client import Client

from .contract import (
    CHEER_SIGNAL,
    GREETING_TASK_QUEUE,
    GREETING_WORKFLOW,
    STATUS_QUERY,
)
from .converter import proto_data_converter
from .generated.sola.temporal.greeting.v1.greeting_pb2 import (
    CheerSignal,
    GreetingRequest,
)


async def main() -> None:
    address = os.environ.get("TEMPORAL_ADDRESS", "localhost:7233")
    namespace = os.environ.get("TEMPORAL_NAMESPACE", "default")

    client = await Client.connect(
        address, namespace=namespace, data_converter=proto_data_converter
    )

    handle = await client.start_workflow(
        GREETING_WORKFLOW,
        GreetingRequest(name="Ada", language="es"),
        id=f"greeting-py-{uuid.uuid4()}",
        task_queue=GREETING_TASK_QUEUE,
    )
    print(f"Started workflow {handle.id}")

    await handle.signal(CHEER_SIGNAL, CheerSignal(sender="python-client", volume=11))
    status = await handle.query(STATUS_QUERY)
    print(f"Query status -> cheers_received={status.cheers_received} greeted={status.greeted}")

    result = await handle.result()
    print(
        f"Result -> message='{result.message}' handled_by='{result.handled_by}' "
        f"cheers_received={result.cheers_received}"
    )


if __name__ == "__main__":
    asyncio.run(main())
