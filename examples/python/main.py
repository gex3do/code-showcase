import argparse
import logging

from example.imap.manager import ImapManager
from example.mai.api import register_routing_api

logger = logging.getLogger(__name__)


def main():
    mode = _get_mode_from_args()

    if mode == "server":
        # brief example of fastapi
        register_routing_api()
    elif mode == "imap":
        # brief example of imap wrapper
        imap_config = {
            "folders": {"inbox": "2024"},
            "ssl": False,
            "host": "127.0.0.1",
            "port": 993,
            "login": "test",
            "password": "test",
        }
        try:
            with ImapManager(config=imap_config) as imap_mgr:
                imap_mgr.scan_inbox()
        except Exception as e:
            logger.error(e)
    else:
        print("Unknown mode, possible modes: server or imap")


def _get_mode_from_args():
    arg_parser = argparse.ArgumentParser(
        prog="examples",
        description="shows different examples",
    )
    arg_parser.add_argument(
        "--mode",
        choices=["server", "imap"],
    )
    args = arg_parser.parse_args()
    return args.mode


if __name__ == "__main__":
    # generally it's used cobra to handle different sub-commands,
    #  but for this example scenario, it is not a point
    main()
