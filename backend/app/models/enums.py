from enum import Enum


class Role(str, Enum):
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


class AuthProvider(str, Enum):
    local = "local"
