"""GreetingWorkflow — hosted by the Python worker, callable from any language.

Every value crossing the workflow boundary is a protobuf message defined in the
shared contract: the argument (GreetingRequest), the return (GreetingResponse),
the signal payload (CheerSignal), and the query result (GreetingStatus).
"""

from datetime import timedelta

from temporalio import workflow

# These imports are deterministic (string constants + generated proto types),
# but they touch things the workflow sandbox restricts on re-execution
# (contract.py reads names.json off disk; the proto runtime is C-backed). Pass
# them through so the sandbox reuses the already-imported modules.
with workflow.unsafe.imports_passed_through():
    from .contract import CHEER_SIGNAL, GREETING_WORKFLOW, STATUS_QUERY
    from .generated.sola.temporal.greeting.v1.greeting_pb2 import (
        CheerSignal,
        GreetingRequest,
        GreetingResponse,
        GreetingStatus,
    )

_GREETINGS = {
    "en": "Hello",
    "es": "Hola",
    "fr": "Bonjour",
    "de": "Hallo",
}


@workflow.defn(name=GREETING_WORKFLOW)
class GreetingWorkflow:
    def __init__(self) -> None:
        self._cheers = 0
        self._greeted = False

    @workflow.run
    async def run(self, request: GreetingRequest) -> GreetingResponse:
        hello = _GREETINGS.get(request.language, _GREETINGS["en"])
        message = f"{hello}, {request.name}!"
        self._greeted = True

        # Briefly hold open so the signal path is exercised; proceed anyway if
        # no cheer arrives.
        try:
            await workflow.wait_condition(
                lambda: self._cheers >= 1, timeout=timedelta(seconds=10)
            )
        except TimeoutError:
            pass

        return GreetingResponse(
            message=message,
            handled_by="python-worker",
            cheers_received=self._cheers,
        )

    @workflow.signal(name=CHEER_SIGNAL)
    def cheer(self, signal: CheerSignal) -> None:
        workflow.logger.info("Cheer from %s (volume %d)", signal.sender, signal.volume)
        self._cheers += 1

    @workflow.query(name=STATUS_QUERY)
    def status(self) -> GreetingStatus:
        return GreetingStatus(cheers_received=self._cheers, greeted=self._greeted)
