from .backend import MaiMWResponse, MaiMWResponseStatus
from .backend.client import MaiBackendClient, set_header
from .headers import HEADERS_USER

CERT_BE_PATHS = {
    "link": "/links/certify",
    "network": "/network/certify",
}


def get_tasks(client: MaiBackendClient) -> MaiMWResponse:
    res = client.get_req("/tasks")

    if res.status == MaiMWResponseStatus.ERROR:
        res.data = []
    return res


def get_task(client: MaiBackendClient, task_id: int) -> MaiMWResponse:
    res = client.get_req(f"/tasks/{task_id}")

    if res.status == MaiMWResponseStatus.ERROR:
        res.data = {}
    return res


def close_task(client: MaiBackendClient, task_id: int, user: str) -> MaiMWResponse:
    extra_data = set_header(HEADERS_USER, user)
    res = client.post_req(f"/tasks/{task_id}/close", {}, **extra_data)
    return res


def certify(client: MaiBackendClient, payload: dict, user: str) -> MaiMWResponse:
    extra_data = set_header(HEADERS_USER, user)
    cert_type = payload.pop("type")
    res = client.post_req(
        CERT_BE_PATHS[cert_type],
        payload,
        **extra_data,
    )
    return res


def get_tasks_history(
    client: MaiBackendClient,
    query: str = None,
    assignee: str = None,
) -> MaiMWResponse:
    query_params = dict(query=query, assignee=assignee)

    res = client.get_req("/tasks/history", params=query_params)
    if res.status == MaiMWResponseStatus.ERROR:
        res.data = []
    return res
