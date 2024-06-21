import logging
from json import JSONDecodeError

import requests
from requests import HTTPError, Response

from ..backend import MaiMWResponse, MaiMWResponseStatus
from ..config import Settings


def set_header(field: str, value: str, data=None) -> dict:
    if data is None:
        data = {}

    if "headers" not in data:
        data["headers"] = {}

    data["headers"][field] = value
    return data


class MaiBackendClient:
    """
    The helper helps to communicate with backend endpoints via RESTFul for
    getting and updating task(s) and task(s) relative information
    """

    def __init__(self, settings: Settings) -> None:
        self.logger = logging.getLogger(__name__)
        self.BASE_URL = settings.backend_base_url
        self.common_req_kwargs = {}

    def _prepare_response_data(self, res: Response) -> MaiMWResponse:
        try:
            res.raise_for_status()

            if res.ok and res.text == "":
                # For some "positive" responses (example: 200 or 304 Not-modified),
                # we get JSON-Decode-Error because it contains empty string.
                # Not JSON-Friendly, but it's fine to continue work as it's
                # considered as positive response.
                # TODO: discuss with backend team if we can use json friendly value
                data = None
            else:
                data = res.json()
            return MaiMWResponse(
                data=data,
                status=MaiMWResponseStatus.OK,
                status_code=res.status_code,
                reason=res.reason,
            )
        except (JSONDecodeError, HTTPError) as error:
            self._log_response(res)
            return MaiMWResponse(
                data=None,
                status=MaiMWResponseStatus.ERROR,
                status_code=res.status_code,
                reason=str(error),
            )

    def _log_response(self, res):
        if res.status_code < 500:
            logger = self.logger.debug
        else:
            logger = self.logger.warning

        logger(
            "Request to the %s %s returned with status_code: %s, reason: %s, body: %s",
            res.request.method,
            res.url,
            res.status_code,
            res.reason,
            res.text,
        )

    def get_req(self, req_url: str, **kwargs: dict) -> MaiMWResponse:
        res = requests.get(
            f"{self.BASE_URL}{req_url}", **self.common_req_kwargs, **kwargs
        )
        return self._prepare_response_data(res)

    def put_req(self, req_url: str, body: dict, **kwargs: dict) -> MaiMWResponse:
        res = requests.put(
            f"{self.BASE_URL}{req_url}",
            json=body,
            **self.common_req_kwargs,
            **kwargs,
        )
        return self._prepare_response_data(res)

    def post_req(self, req_url: str, body: dict, **kwargs: dict) -> MaiMWResponse:
        res = requests.post(
            f"{self.BASE_URL}{req_url}",
            json=body,
            **self.common_req_kwargs,
            **kwargs,
        )
        return self._prepare_response_data(res)
