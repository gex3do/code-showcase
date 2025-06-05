import logging
from typing import List, Literal

from fastapi.openapi.models import Response
from pydantic import BaseModel
from starlette import status

from .backend import MaiMWResponse

StatusType = Literal["ok", "error"]


class CloseTaskResponse(BaseModel):
    id: int = None
    status: StatusType = None
    msg: str = None


class CertifyResponse(BaseModel):
    id: int = None
    who: str = None
    state: str = None
    comment: str = None


class TasksHistoryItemResponse(BaseModel):
    id: int = None
    title: str = None
    created: int = None
    updated: int = None
    assignee: str = None


class TasksHistoryResponse(BaseModel):
    data: List[TasksHistoryItemResponse] = []
    status: StatusType = None
    msg: str = None


def adjust_response_for_client(result: MaiMWResponse, response: Response):
    """This function adjusts response to the client.
    Either propagates backend response http status-code, or
    overwrites with 200 (OK) because RTK Query understand all
    status codes between '300 <= code < 400' as an error

    The function changes response status-code on-the-fly and makes side-effect

    Returns: None
    """
    if 300 <= result.status_code < 400:
        logging.info(
            "The original http status-code received from backend "
            "was overwritten: original (%d), new (%d)",
            result.status_code,
            status.HTTP_200_OK,
        )
        response.status_code = status.HTTP_200_OK
    else:
        response.status_code = result.status_code
