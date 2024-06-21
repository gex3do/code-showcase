import email
import re

from validate_email import validate_email


def get_recipients(mail: email.message.Message) -> list:
    """
    Gives recipient emails. The 'recipients' are taken from `Received for` header

    Args:
        mail: Mail object

    Returns: List of distinct recipients. If nothing found, empty list
    """
    received_headers = mail.get_all("Received")

    if received_headers:
        envelope_tos = set()
        for received_header in received_headers:
            if "for " in received_header:
                received_header = received_header.replace("\n", "").replace("\r", "")
                recipient = re.sub(
                    "^.*for <?(?P<recipient>.*?)>?;.*$",
                    "\\1",
                    received_header,
                    flags=re.DOTALL,
                )
                if allowed_recipient(recipient) and validate_email(recipient):
                    envelope_tos.add(recipient)

        if envelope_tos:
            return list(envelope_tos)

    return []


def allowed_recipient(recipient):
    return str.lower(recipient) != "somespecial@myownproject.com"


def get_mailfrom(mail: email.message.Message) -> str:
    """
    Gives sender email. The 'sender' is checked sequentially with two different ways:
        1. Check 'return-path'
        2. Check 'envelope-from'
        3. If sender not found, empty string returns

    Args:
        mail: Mail object

    Returns: Sender of the mail or empty string

    Raises: Nothing
    """
    if mail["Return-Path"] and validate_email(mail["Return-Path"]):
        return mail["Return-Path"]

    received_headers = mail.get_all("Received", [])

    for received_header in received_headers:
        if "envelope-from" not in received_header:
            continue

        received_header = received_header.replace("\n", "").replace("\r", "")
        envelop_from = re.sub(".*envelope-from <(.*?)>.*", "\\1", received_header)
        if validate_email(envelop_from):
            return envelop_from

    return ""
