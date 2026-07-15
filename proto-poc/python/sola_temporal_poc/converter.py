"""Composite proto-first DataConverter (issue plan step 4).

Mirrors the proposal: put the protobuf converter(s) *first*, JSON fallback
*after*. Proto messages therefore serialize as `binary/protobuf` with a
`messageType` metadata field; anything else (plain dicts, strings) still works
via the default JSON converter. `binary/protobuf` is the encoding the issue
recommends for cross-language interop, and it must be byte-for-byte identical on
client + worker in BOTH languages — which is exactly what this converter, shared
by worker.py and client.py, guarantees on the Python side.
"""

from temporalio.converter import (
    BinaryNullPayloadConverter,
    BinaryPlainPayloadConverter,
    BinaryProtoPayloadConverter,
    CompositePayloadConverter,
    DataConverter,
    JSONPlainPayloadConverter,
    JSONProtoPayloadConverter,
)


class ProtoFirstPayloadConverter(CompositePayloadConverter):
    """Proto binary first for encode; JSON plain as the non-proto fallback.

    On decode, converters are selected by the payload's `encoding` metadata, so
    both proto converters below can decode what the other language wrote,
    regardless of order.
    """

    def __init__(self) -> None:
        super().__init__(
            BinaryNullPayloadConverter(),
            BinaryPlainPayloadConverter(),
            # Our interop encoding: proto message -> binary/protobuf + messageType.
            BinaryProtoPayloadConverter(),
            # Still decode json/protobuf if a peer chose the readable encoding.
            JSONProtoPayloadConverter(),
            # Fallback for everything that isn't a protobuf Message.
            JSONPlainPayloadConverter(),
        )


# Shared by both the worker and the client — the whole point is that they match.
proto_data_converter = DataConverter(payload_converter_class=ProtoFirstPayloadConverter)
