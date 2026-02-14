"""add lighting_schedules table

Revision ID: m4h5i6j7k8l9
Revises: l3g4h5i6j7k8
Create Date: 2026-02-14

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from app.models.types import GUID


# revision identifiers, used by Alembic.
revision: str = 'm4h5i6j7k8l9'
down_revision: Union[str, None] = 'l3g4h5i6j7k8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'lighting_schedules',
        sa.Column('id', GUID, primary_key=True, index=True),
        sa.Column('tank_id', GUID, sa.ForeignKey('tanks.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('user_id', GUID, sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('name', sa.String, nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('channels', sa.JSON, nullable=False),
        sa.Column('schedule_data', sa.JSON, nullable=False),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default=sa.text('false')),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('lighting_schedules')
