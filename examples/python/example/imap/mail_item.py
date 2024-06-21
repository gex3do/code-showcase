from dataclasses import dataclass, field


@dataclass
class MailItem:
    uid: str
    raw_mail: str = ""
    header: dict = field(default_factory=dict)
    attachments: list = field(default_factory=list)
    content: str = ""
