from enum import Enum


class Role(str, Enum):
    end_user = "end_user"
    technician = "technician"
    admin = "admin"


class TicketStatus(str, Enum):
    open = "open"
    in_progress = "in_progress"
    pending_user = "pending_user"
    resolved = "resolved"
    closed = "closed"


class Priority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class Channel(str, Enum):
    web = "web"
    slack = "slack"


class AuthProvider(str, Enum):
    local = "local"
