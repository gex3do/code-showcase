from typing import Optional

from pydantic import BaseModel
from pydantic.dataclasses import dataclass
from starlette.requests import Request

from example.mai.headers import HEADERS_GROUPS, HEADERS_USER


class CertifyRequest(BaseModel):
    type: str
    id: Optional[int] = None
    value: Optional[str] = None
    state: str
    comment: str


@dataclass
class User:
    user: str = None
    groups: list | None = None


def get_user_from_request(request: Request):
    user = request.headers.get(HEADERS_USER)
    if user is None:
        raise ValueError(
            f"There is no `{HEADERS_USER} header in the request: {request.url}"
        )

    # groups may be separated by comma: "group_a,group_b"
    groups_list = request.headers.get(HEADERS_GROUPS)
    if groups_list is None:
        raise ValueError(
            f"There is no `{HEADERS_GROUPS}` header in the request: {request.url}"
        )

    groups = groups_list.split(",")
    return User(user=user, groups=groups)
