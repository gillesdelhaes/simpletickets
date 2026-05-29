"""seed default SLA policies

Revision ID: 0002
Revises: 0001
Create Date: 2026-05-29

Default SLA targets (all times in minutes):
  Critical : first_response=30,  resolution=240   (4 h)
  High     : first_response=60,  resolution=480   (8 h)
  Medium   : first_response=240, resolution=1440  (1 day)
  Low      : first_response=480, resolution=4320  (3 days)
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_table = sa.table(
    "sla_policies",
    sa.column("name", sa.String),
    sa.column("priority", sa.String),
    sa.column("first_response_minutes", sa.Integer),
    sa.column("resolution_minutes", sa.Integer),
)

_DEFAULTS = [
    {
        "name": "Critical SLA",
        "priority": "critical",
        "first_response_minutes": 30,
        "resolution_minutes": 240,
    },
    {
        "name": "High SLA",
        "priority": "high",
        "first_response_minutes": 60,
        "resolution_minutes": 480,
    },
    {
        "name": "Medium SLA",
        "priority": "medium",
        "first_response_minutes": 240,
        "resolution_minutes": 1440,
    },
    {
        "name": "Low SLA",
        "priority": "low",
        "first_response_minutes": 480,
        "resolution_minutes": 4320,
    },
]


def upgrade() -> None:
    op.bulk_insert(_table, _DEFAULTS)


def downgrade() -> None:
    op.execute(
        "DELETE FROM sla_policies WHERE priority IN ('critical', 'high', 'medium', 'low')"
    )
