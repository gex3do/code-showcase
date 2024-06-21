from dataclasses import dataclass


class MaiMWResponseStatus:
    OK = "ok"
    ERROR = "error"


@dataclass
class MaiMWResponse:
    status: str
    status_code: int
    data: str | dict | None = None
    reason: str = ""
