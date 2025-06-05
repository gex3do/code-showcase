import json
import logging
import os

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette import status
from uvicorn import run

from .backend.client import MaiBackendClient
from .config import settings
from .headers import MaiHeaderMiddleware
from .helper import certify, close_task, get_task, get_tasks, get_tasks_history
from .requests import CertifyRequest, get_user_from_request
from .responses import (CertifyResponse, CloseTaskResponse,
                        TasksHistoryResponse, adjust_response_for_client)

ALLOWED_CERT_TYPES = [
    "link",
    "network",
]

ORIGINS = [
    "http://mai-ui:3819",
    "http://mai:80",
    "http://localhost:3819",
]

logger = logging.getLogger(__name__)


def get_tasks_from_mock():
    with open(os.path.dirname(__file__) + "/mock/responses.json") as f:
        tasks = json.load(f)["/tasks"]
    return tasks or []


def register_routing_api():
    app = FastAPI()

    be_client = MaiBackendClient(settings=settings)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_middleware(MaiHeaderMiddleware)

    @app.get("/")
    async def index():
        return {"message": "HA! Wazzupp"}

    @app.get("/tasks")
    async def get_tasklist(count: int = 100):
        if settings.use_mock_api:
            tasks = get_tasks_from_mock()
            return tasks[:count]
        else:
            result = get_tasks(be_client)
            return result.data

    @app.get("/tasks/history")
    async def get_tasklist_history(
        request: Request, query: str = None, assigned: bool = False
    ):
        user_credentials = get_user_from_request(request)
        user = user_credentials.user
        assignee = user if assigned else None

        result = get_tasks_history(be_client, query, assignee)
        return TasksHistoryResponse(
            data=result.data,
            status=result.status,
            msg=result.reason,
        )

    @app.get("/tasks/{task_id}")
    async def get_task_by_id(task_id: int):
        if settings.use_mock_api:
            tasks = get_tasks_from_mock()
            tasks_found = [task for task in tasks if task["id"] == task_id]
            return tasks_found[0] if tasks_found else tasks[0]
        else:
            result = get_task(be_client, task_id)
            return result.data

    @app.post("/tasks/{task_id}/close", response_model=CloseTaskResponse)
    async def close_task_by_id(task_id: int, request: Request, response: Response):
        user = get_user_from_request(request)
        result = close_task(be_client, task_id, user=user.user)

        adjust_response_for_client(result, response)

        return CloseTaskResponse(
            id=task_id,
            status=result.status,
            msg=result.reason,
        )

    @app.post("/certify", response_model=CertifyResponse)
    async def certify_entity(
        item: CertifyRequest, request: Request, response: Response
    ):
        if item.type not in ALLOWED_CERT_TYPES:
            error = f"Wrong item type provided: {item.type}"
            logging.error(error)
            return {"error": error}, status.HTTP_500_INTERNAL_SERVER_ERROR

        user = get_user_from_request(request)

        payload = {k: v for k, v in item.dict().items() if v is not None}

        result = certify(
            be_client,
            payload,
            user=user.user,
        )

        adjust_response_for_client(result, response)

        return CertifyResponse(
            id=item.id,
            who=user.user,
            state=item.state,
            comment=item.comment,
            status=result.status,
            msg=result.reason,
        )

    @app.get("/info")
    async def info():
        return {
            "use_mock_api": settings.use_mock_api,
            "BACKEND": {"BASE_URL": settings.backend_base_url},
        }

    run(app, host=settings.app_host, port=settings.app_port)
