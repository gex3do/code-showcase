import email
import logging
import re
import socket
from datetime import datetime
from email import policy
from imaplib import IMAP4, IMAP4_SSL
from typing import List, Optional

import pytz

from example.imap.helper import get_mailfrom, get_recipients
from example.imap.mail_item import MailItem

logger = logging.getLogger(__name__)

DATE_FORMATS = [
    {
        "pattern": r"(^\w{3},.{1,2}\d{1,2} \w{3} \d{4} ..:..:.. .\w{4})",
        "format_string": "%a, %d %b %Y %H:%M:%S %z",
        "example": (
            "Tue, 21 Jul 2020 21:23:00 +0200; "
            "Sat, 16 Nov 2019 21:09:45 -0800 (added by "
            "postmaster@C9MAIL02.amadis.com); "
            "Sun,  7 Jun 2020 05:10:08 +0200 (CEST)"
        ),
    },
    {
        "pattern": r"(^\d{1,2} \w{3} \w{4} ..:..:.. .\w{4})",
        "format_string": "%d %b %Y %H:%M:%S %z",
        "example": "21 Jul 2020 21:23:00 +0200",
    },
]


class ImapManager:
    _OK = "OK"

    _CMD_FETCH_UID_SUBJECT = "(UID BODY.PEEK[HEADER.FIELDS (SUBJECT DATE)])"
    _CMD_FETCH_MAIL = "(RFC822)"

    _header_fields = (
        "reply-to",
        "subject",
        "date",
        "cc",
        "content-type",
        "content-transfer-encoding",
    )

    def __init__(self, config: dict):
        self._config = config
        self.inbox_folder = self._config["folders"]["inbox"]

        self._set_socket_timeout(5)

        raised = None
        try:
            self._connect_to_imap_server()
        except IMAP4.error as e:
            logger.error("IMAP4 error occurred: %s", e)
            raised = e
        except ConnectionRefusedError as e:
            logger.error("Connection error occurred: %s", e)
            raised = e
        except (RuntimeError, ValueError) as e:
            logger.error("Unexpected error occurred: %s", e)
            raised = e
        except Exception as e:
            logger.error("Unknown error occurred: %s", e)
            raised = e
        finally:
            self._reset_socket_timeout()
            if raised:
                raise raised

    @staticmethod
    def _set_socket_timeout(timeout: int):
        socket.setdefaulttimeout(timeout)

    @staticmethod
    def _reset_socket_timeout():
        socket.setdefaulttimeout(None)

    def _connect_to_imap_server(self):
        if self._config["ssl"]:
            self._client = IMAP4_SSL(
                host=self._config["host"], port=self._config["port"]
            )
        else:
            self._client = IMAP4(host=self._config["host"], port=self._config["port"])

        self._client.login(self._config["login"], self._config["password"])
        self._client.select(self.inbox_folder)
        logger.info("Successfully connected to IMAP server.")

    def __enter__(self):
        return self

    def __exit__(self, *args):
        if self._client:
            self._client.close()
            self._client.logout()

    def _search_mails(self, criteria: str = "ALL") -> list:
        """
        Search mails by given search criteria
            (see docs: https://tools.ietf.org/html/rfc3501#section-6.4.4)

        Args:
            criteria: Search criteria

        Returns: List of mail sequence numbers (NOT UIDs)

        Raises: RuntimeError
        """
        status, data = self._client.search(None, criteria)
        if status != self._OK:
            raise RuntimeError(
                f"Error occurred while searching a mail with a criteria: {criteria}"
            )

        if not data:
            raise RuntimeError(f"No mails found with a criteria: {criteria}")

        decoded_result = data[0].decode()
        if not decoded_result:
            raise RuntimeError("Failed to decode mail content from IMAP response.")

        return decoded_result.split()

    def scan_inbox(self) -> List[MailItem]:
        """
        Get mails from inbox (only Subjects, Dates and UIDs).

        Returns: List of MailItems objects

        Raises: RuntimeError
        """
        found_mail_ids = self._search_mails(criteria="UNDELETED")
        if not found_mail_ids:
            return []

        fetch_mail_ids = ",".join(found_mail_ids)
        status, data = self._client.fetch(fetch_mail_ids, self._CMD_FETCH_UID_SUBJECT)

        if status != self._OK:
            raise RuntimeError(
                f"Failed to retrieve mails from IMAP. Error status: {status}"
            )

        mail_items = []
        for response_part in data:
            if not isinstance(response_part, tuple):
                # Each `response_part` entity has 2 elements - tuple and binary-string.
                # Only tuple is allowed
                continue

            # Resolve Pylint E1136 issue by casting response_part back to a tuple
            response_part = tuple(response_part)

            raw_mail_uid = response_part[0].decode()
            raw_mail_content = response_part[1].decode()

            # Handle potential error when extracting UID
            try:
                mail_uid = ImapManager._extract_uid(raw_mail_uid)
            except ValueError as e:
                logger.warning(f"Failed to extract UID from raw mail data: {e}")
                continue

            mail_item = self._raw_mail_to_mail_item(
                mail_uid, raw_mail_content, only_header=True
            )
            mail_items.append(mail_item)

        sorted_mail_items = sorted(
            mail_items, key=lambda x: x.header["date"], reverse=True
        )

        return sorted_mail_items

    def get_mail(self, uid: str) -> MailItem:
        """
        Get mail whole content by provided uid parameter.

        Args:
            uid: Mail UID

        Returns: MailItem object

        Raises: RuntimeError
        """
        status, data = self._client.uid("fetch", uid, self._CMD_FETCH_MAIL)

        if status != self._OK:
            raise RuntimeError(f"Failed to retrieve mail with UID: {uid} from IMAP.")

        if not data:
            raise RuntimeError("Empty response data received from IMAP server.")

        response_part = data[0]
        if not isinstance(response_part, tuple):
            raise RuntimeError(
                f"Unable to parse mail from data received from IMAP: {data}"
            )

        raw_mail = response_part[1].decode(errors="ignore")
        if not raw_mail:
            raise RuntimeError("Failed to decode mail content from IMAP response.")

        return self._raw_mail_to_mail_item(uid, raw_mail)

    def upload_mail(self, mail: str) -> None:
        """
        Append mail to the mail server

        Args:
            mail: email message

        Returns: Nothing

        Raises: RuntimeError
        """
        response = self._client.append(self.inbox_folder, "UNSEEN", "", mail.encode())

        if response[0] != self._OK:
            raise RuntimeError("Cannot append mail to mail-server with eml-data")

    def move_mail(self, uid: str, dest_folder: str) -> None:
        """
        Move mail with given `uid` to `dest_folder`.

        Args:
            uid: Mail UID which should be moved
            dest_folder: Destination folder

        Returns: Nothing

        Raises: RuntimeError
        """
        if self._config["capability"]["move"]:
            response = self._client.uid("MOVE", uid, dest_folder)
            if response[0] == self._OK:
                return
        else:
            # Otherwise, copy the mail to the destination folder and mark the original as deleted
            response = self._client.uid("COPY", uid, dest_folder)
            if response[0] == self._OK:
                response = self._client.uid("STORE", uid, "+FLAGS", "(\\Deleted)")
                if response[0] == self._OK:
                    self._client.expunge()
                    return
                else:
                    raise RuntimeError(
                        f"Cannot mark mail with uid: {uid} as deleted after applying COPY"
                    )

        raise RuntimeError(f"Cannot move mail with uid: {uid} to {dest_folder}")

    def delete_mail(self, uid: str) -> None:
        """
        Delete mail by uid parameter.

        Args:
            uid: Mail UID

        Returns: Nothing

        Raises: RuntimeError
        """
        response = self._client.uid("STORE", uid, "+FLAGS", "(\\Deleted)")

        if response[0] == self._OK:
            self._client.expunge()
            return

        raise RuntimeError(f"Failed to delete mail with UID: {uid}")

    @classmethod
    def _raw_mail_to_mail_item(
        cls, mail_uid: str, raw_mail: str, only_header=False
    ) -> MailItem:
        """
        Convert raw email taken from IMAP to MailItem.

        Args:
            mail_uid: Mail UID
            raw_mail: Raw mail
            only_header: If True, read only mail header

        Returns: MailItem object
        """

        mail_obj = email.message_from_string(raw_mail, policy=policy.SMTPUTF8)
        mail_item = MailItem(uid=mail_uid, raw_mail=raw_mail)

        # Parse header fields and add them to mail_item header
        cls.parse_header_fields(mail_obj, mail_item)

        # Parse mail content and attachments
        if not only_header:
            cls.parse_mail_content(mail_obj, mail_item)

        return mail_item

    @staticmethod
    def parse_header_fields(
        mail_obj: email.message.Message, mail_item: MailItem
    ) -> None:
        """
        Parse header fields and add them to mail_item header.

        Args:
            mail_obj: Message object
            mail_item: MailItem object

        Returns: Nothing
        """
        # Parse required data from header and add them to mail_item header
        for header_field in ["Subject", "Date", "CES-imde"]:
            if header_field in mail_obj:
                header_field_val = mail_obj[header_field]
                mail_item.header[header_field.lower()] = header_field_val

        mail_item.header.setdefault("subject", "")

        mail_date = ImapManager.parse_mail_date(mail_obj)
        mail_item.header["date"] = mail_date.isoformat()

        # Get envelope data about recipients and sender
        mail_item.header["rcpt_to"] = get_recipients(mail_obj)
        mail_item.header["return_path"] = get_mailfrom(mail_obj)

        # and more and more fields...

    @staticmethod
    def parse_mail_date(mail_obj: email.message.Message) -> datetime:
        """
        Parse mail date and return as datetime object.

        Args:
            mail_obj: Message object

        Returns: Datetime object
        """
        mail_date_str = mail_obj["Date"]
        mail_date = (
            ImapManager.parse_date(mail_date_str)
            if mail_date_str
            else datetime.now(tz=pytz.utc)
        )
        return mail_date

    @staticmethod
    def parse_mail_content(
        mail_obj: email.message.Message, mail_item: MailItem
    ) -> None:
        """
        Parse mail content and attachments.

        Args:
            mail_obj: Message object
            mail_item: MailItem object
        """

        # and more and more fields
        pass

    @staticmethod
    def parse_date(dt_string: str) -> Optional[datetime]:
        """
        Convert string datetime into datetime object.

        Note: As the datetime (parsed from mail) not always meet the same
            datetime standard, the `to_parse_dt` value should be prepared first and
            even different formatters can be used.

        Args:
            dt_string: Datetime string

        Returns: Datetime object. If the value cannot be parsed, returns None
        """

        for format_candidate in DATE_FORMATS:
            match = re.match(format_candidate["pattern"], dt_string)
            if match:
                return datetime.strptime(
                    match.group(1), format_candidate["format_string"]
                )

        return None

    @staticmethod
    def _extract_uid(input_string: str) -> str:
        """
        Extracts mail UID from the string.

        Example:
            input: '1 (UID 2040 BODY[HEADER.FIELDS (SUBJECT DATE)] {67}'
            output: '2040'

        Args:
            input_string: String containing UID

        Returns: mail UID

        Raises:
            ValueError when match not found
        """
        uid_match = re.match(r".*UID\s(\d+)", input_string)
        if uid_match:
            return str(uid_match.group(1))

        raise ValueError(
            f"UID of the mail cannot be parsed from the value: {input_string}"
        )
