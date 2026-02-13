"""add feeding_schedules and feeding_logs tables

Revision ID: j1e2f3g4h5i6
Revises: i0d1e2f3g4h5
Create Date: 2026-02-13

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from app.models.types import GUID


# revision identifiers, used by Alembic.
revision: str = 'j1e2f3g4h5i6'
down_revision: Union[str, None] = 'i0d1e2f3g4h5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'feeding_schedules',
        sa.Column('id', GUID, primary_key=True, index=True),
        sa.Column('tank_id', GUID, sa.ForeignKey('tanks.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('user_id', GUID, sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('consumable_id', GUID, sa.ForeignKey('consumables.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('food_name', sa.String, nullable=False),
        sa.Column('quantity', sa.Float, nullable=True),
        sa.Column('quantity_unit', sa.String, nullable=True),
        sa.Column('frequency_hours', sa.Integer, nullable=False, server_default='24'),
        sa.Column('last_fed', sa.DateTime, nullable=True),
        sa.Column('next_due', sa.DateTime, nullable=True),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default=sa.text('true')),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        'feeding_logs',
        sa.Column('id', GUID, primary_key=True, index=True),
        sa.Column('tank_id', GUID, sa.ForeignKey('tanks.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('user_id', GUID, sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('schedule_id', GUID, sa.ForeignKey('feeding_schedules.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('food_name', sa.String, nullable=False),
        sa.Column('quantity', sa.Float, nullable=True),
        sa.Column('quantity_unit', sa.String, nullable=True),
        sa.Column('fed_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('feeding_logs')
    op.drop_table('feeding_schedules')
