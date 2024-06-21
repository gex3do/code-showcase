from typing import Final

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

HEADERS_USER: Final[str] = "mai-user"
HEADERS_GROUPS: Final[str] = "mai-groups"


class MaiHeaderMiddleware(BaseHTTPMiddleware):
    def __init__(self, app) -> None:
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        # process the request and get the response
        response = await call_next(request)

        # pass on MAI special headers
        response.headers[HEADERS_USER] = request.headers.get(HEADERS_USER, "")
        response.headers[HEADERS_GROUPS] = request.headers.get(HEADERS_GROUPS, "")
        return response
