"""Add slack_submitter_id to tickets

Revision ID: 0002
Revises: 0001
Create Date: 2026-05-31
"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "tickets",
        sa.Column("slack_submitter_id", sa.String(), nullable=True),
    )
    op.create_index("ix_tickets_slack_submitter_id", "tickets", ["slack_submitter_id"])


def downgrade() -> None:
    op.drop_index("ix_tickets_slack_submitter_id", table_name="tickets")
    op.drop_column("tickets", "slack_submitter_id")
